// Import required types
import { ref, computed } from "vue";
import { Item } from "@/models/Item.ts";
import { Tray } from "@/models/Tray.ts";
import { StoredItem } from "@/models/StoredItem.ts";

// Track placed items per user/tray
export const placedItemsMap = ref(new Map<string, Map<string, number>>());

/**
 * Updates the placed items tracking when an item is added to a tray
 * @param trayId The tray ID  received the item
 * @param itemId The ID of the item that was placed
 * @param quantity The quantity of the item placed
 */
export const trackItemPlacement = (trayId: string, itemId: string, quantity: number) => {
  // Initialize map for this user if it doesn't exist
  if (!placedItemsMap.value.has(trayId)) {
    placedItemsMap.value.set(trayId, new Map<string, number>());
  }

  // Get this user's item map
  const userItemMap = placedItemsMap.value.get(trayId)!;

  // Update quantity (add to existing if any)
  const currentQuantity = userItemMap.get(itemId) || 0;
  userItemMap.set(itemId, currentQuantity + quantity);
};

/**
 * Computes whether an item has been fully added to a tray
 * @param trayId The user ID to check
 * @param itemId The item ID to check
 * @param requiredAmount The amount required according to the shopping list
 * @returns True if the placed amount matches or exceeds the required amount
 */
export const isItemFullyAdded = (trayId: string, itemId: string, requiredAmount: number): boolean => {
  if (!requiredAmount) return true; // No items required means it's "complete"

  const userItemMap = placedItemsMap.value.get(trayId);
  if (!userItemMap) return false; // No items placed for this user

  if (itemId.startsWith("_")) {
    itemId = itemId.substring(1);
  }

  const placedAmount = userItemMap.get(itemId) || 0;
  return placedAmount >= requiredAmount;
};

/**
 * Updates placement tracking when a tray is scanned
 * @param trayId The user ID whose tray was scanned
 * @param tray The tray that was scanned
 */
export const updateFromTray = (trayId: string, tray: Tray) => {
  // Create a new map to count items in this tray
  const trayItemCounts = new Map<string, number>();

  // Count all items in the tray
  for (const slot of tray.slots) {
    if (slot.holding) {
      const itemId = slot.holding.id;
      const currentCount = trayItemCounts.get(itemId) || 0;
      trayItemCounts.set(itemId, currentCount + 1);
    }
  }

  // Update the placement map for this user
  placedItemsMap.value.set(trayId, trayItemCounts);
};

/**
 * Integrates with handleItemPlaced to track item placements
 * @param data The placement data from the dialog
 * @param trayId The tray ID where item is placed
 */
export const handleItemPlacedWithTracking = (
    data: {
      item: Item | null,
      alias: string | null,
      quantity: number,
      placements: {trayId: string, slotIndex: number, item: StoredItem}[]
    },
    trayId: string
) => {
  // Extract item ID from the placement data
  if (!data.item) return;
  const itemId = data.alias ? data.alias : data.item.id;

  // Track this placement
  trackItemPlacement(trayId, itemId, data.quantity);

  // Additional handling can be added here if needed
  console.log('Item placed with tracking:', data.item);
  console.log('Quantity:', data.quantity);
  console.log('Placements:', data.placements);
};

/**
 * Resets tracking for a specific user
 * @param userId The user ID to reset tracking for
 */
export const resetUserTracking = (userId: string) => {
  placedItemsMap.value.delete(userId);
};

/**
 * Resets all tracking data
 */
export const resetAllTracking = () => {
  placedItemsMap.value.clear();
};