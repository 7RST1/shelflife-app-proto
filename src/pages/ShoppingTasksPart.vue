<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useShoppingStore } from "@/stores/ShoppingStore.ts";
import { onMounted, ref, computed } from "vue";
import { shoppingListsT } from "@/models/ShoppingList.ts";
import { Item, randomItemsMap } from "@/models/Item.ts";
import { usersM } from "../models/User.ts";
import ItemPlacementDialog from '@/components/ItemPlacementDialog.vue';
import { Tray } from "@/models/Tray.ts";
import {
  placedItemsMap,
  isItemFullyAdded,
  handleItemPlacedWithTracking,
  updateFromTray
} from '@/utils/itemTracking'; // Import our new functions

const showDialog = ref(false);
const initialItemId = ref<string>("");
const initialItemAmount = ref<number>(1);
const searchTerm = ref("");
const selectedUserId = ref<string>(""); // Track which user's tray we're adding to

const handleItemPlaced = (data: any) => {
  console.log('Item placed:', data.item);
  console.log('Quantity:', data.quantity);
  console.log('Placements:', data.placements);

  // Use our new tracking function with the selected user ID
  if (selectedUserId.value) {
    handleItemPlacedWithTracking(data, selectedUserId.value);
  }
};

const shoppingStore = useShoppingStore();
const { trayAssignments, addedTrays } = storeToRefs(shoppingStore);

// Compute relevant lists based on tray assignments
const relevantLists = computed(() =>
    shoppingListsT.filter(shoppingList =>
        trayAssignments.value.some(v => v.userId === shoppingList.owner)
    )
);

const getUserTray = (userId: string): Tray => {
  const assignment = trayAssignments.value.find(v => v.userId === userId);
  if (!assignment) {
    throw new Error("User does not have tray")
  }
  const tray = addedTrays.value.find(v => v.id == assignment.trayId);
  if (!tray) {
    throw new Error("User does not have tray")
  }
  return tray;
}

// Update tracking when a tray is scanned or synced
const syncTrayItems = (userId: string) => {
  try {
    const tray = getUserTray(userId);
    updateFromTray(userId, tray);
  } catch (error) {
    console.error("Could not sync tray:", error);
  }
}

// Track items and their total amounts
const itemsMap = ref(new Map<string, number>());

// Track amounts per list and item
const amountArr = ref<number[][]>([]);

// Normalize item ID for both Item objects and string IDs
const getItemKey = (item: Item | string): string => {
  return item instanceof Item ? item.id : `_${item}`;
};

// Find listing amount in a shopping list
const findListingAmount = (shoppingList, itemKey) => {
  const isGeneric = itemKey.startsWith('_');
  const itemId = isGeneric ? itemKey.substring(1) : itemKey;

  const listing = shoppingList.listings.find(v => {
    if (isGeneric) {
      return !(v.item instanceof Item) && v.item === itemId;
    } else {
      return v.item instanceof Item && v.item.id === itemId;
    }
  });

  return listing?.amount ?? 0;
};

// Computed to check if an item is fully added for a user
const isItemComplete = (userId: string, itemId: string, requiredAmount: number) => {
  return isItemFullyAdded(userId, itemId, requiredAmount);
};

const addThisItemToTray = (itemId: string, amount: number = 1, userId: string) => {
  if (!amount) return;
  initialItemId.value = itemId.startsWith("_") ? "" : itemId;
  initialItemAmount.value = amount;
  selectedUserId.value = userId; // Store which user we're adding for
  showDialog.value = true;
}

onMounted(() => {
  // Reset collections
  itemsMap.value.clear();

  // Build the itemsMap with total quantities
  for (const trayAssignment of trayAssignments.value) {
    const shoppingList = relevantLists.value.find(v => v.owner === trayAssignment.userId);
    if (!shoppingList) continue;

    for (const listing of shoppingList.listings) {
      const itemKey = getItemKey(listing.item);
      const existing = itemsMap.value.get(itemKey) ?? 0;
      itemsMap.value.set(itemKey, existing + listing.amount);
    }
  }

  // Create the amount matrix
  const listCount = relevantLists.value.length;
  const itemCount = itemsMap.value.size;
  amountArr.value = Array(listCount).fill(null).map(() => Array(itemCount).fill(0));

  // Fill the matrix with individual amounts
  relevantLists.value.forEach((shoppingList, listIndex) => {
    let itemIndex = 0;
    itemsMap.value.forEach((_, itemKey) => {
      amountArr.value[listIndex][itemIndex] = findListingAmount(shoppingList, itemKey);
      itemIndex++;
    });
  });

  // Sync all user trays to initialize tracking
  for (const trayAssignment of trayAssignments.value) {
    try {
      syncTrayItems(trayAssignment.userId);
    } catch (error) {
      console.error(`Could not sync tray for user ${trayAssignment.userId}:`, error);
    }
  }
});
</script>

<template>
  <div class="row no-wrap">
    <!-- Aggregated item list -->
    <div class="item-list">
      <div v-for="[item, _] of itemsMap" :key="item" class="item-row">
        <div v-if="item.startsWith('_')" style="background-color: rgba(155,176,184,0.86); height: 100%; font-style: italic; opacity: 70%">
          {{ item.substring(1).toLowerCase() }}
        </div>
        <div v-else style="background-color: rgba(0,0,0,0.18); height: 100%">
          {{ randomItemsMap.get(item)?.name }}
        </div>
      </div>
    </div>

    <!-- User columns with amounts -->
    <div class="user-columns row no-wrap scroll-x">
      <!-- Individual user columns -->
      <div v-for="(list, i) of relevantLists" :key="list.owner" class="user-column">
        <div class="user-header column">
          <div class="tray-nr">
            <div class="absolute-center">
              {{i + 1}}
            </div>
          </div>
          <div>
            {{ usersM.get(list.owner)?.name }}
          </div>
<!--          <q-btn flat size="sm" @click="syncTrayItems(list.owner)" icon="sync" label="Sync Tray" />-->
        </div>
        <div class="column">
          <div
              v-for="(itemId, j) in itemsMap"
              :key="j"
              class="amount-cell"
              :class="{
              'populated': !!amountArr[i][j],
              'completed': isItemComplete(list.owner, itemId[0], amountArr[i][j])
            }"
              @click="addThisItemToTray(itemId[0], amountArr[i][j], list.owner)"
          >
            <div class="relative-position">
              <div class="absolute-center">
                {{ amountArr[i][j] || "" }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sum column -->
      <div class="user-column" style="position: sticky">
        <div class="user-header">
          sum
        </div>
        <div class="column">
          <div v-for="[_, amount] of itemsMap" :key="amount" class="amount-cell sum-cell">
            <div class="relative-position">
              <div class="absolute-center">
                {{ amount }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ItemPlacementDialog
      v-model="showDialog"
      :initial-item-id="initialItemId"
      :initial-search-term="searchTerm"
      :initial-item-amount="initialItemAmount"
      @item-placed="handleItemPlaced"
  />
</template>

<style scoped lang="scss">
.item-list {
  max-width: 40%;
  margin-top: 100px;

  .item-row {
    padding: 0.2rem;
    height: 3.5rem;


    &>div {
      border-radius: 0.3rem;
      padding: 0.3rem;
    }
  }
}

.user-columns {
  flex-grow: 1;

  .user-column {
    width: 5rem;

    .user-header {
      height: 100px;

      .tray-nr {
        position: relative;
        border-radius: 1.5rem !important;
        height: 2rem;
        width: 2rem;
        background-color: orange;
      }
    }

    .amount-cell {
      height: 3.5rem;
      font-size: 1.5rem;
      padding: 0.2rem;

      &>div {
        height: 100%;
        border-radius: 0.3rem;
        text-align: center;
      }

      &.populated > div {
        background-color: rgba(207, 146, 16, 0.35);
      }

      &.completed > div {
        background-color: rgba(76, 175, 80, 0.6) !important; /* Green color for completed items */
      }

      &.sum-cell {
        &>div {
          background-color: rgba(255, 165, 0, 0.6);
          height: 100%;
          border-radius: 0.3rem;
          text-align: center;
        }
      }
    }
  }
}
</style>