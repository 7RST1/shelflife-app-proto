<script setup lang="ts">
import {ref, computed, reactive, onMounted, watch} from 'vue';
import { Notify, Dialog, uid } from 'quasar';
import { OpenFoodFactsResponse, Product } from "@/models/ItemScanning.ts";
import BarcodeScanner from "@/components/BarcodeScanner.vue";
import { randomItems, randomItemsMap, Item } from "@/models/Item.ts";
import { StoredItem, ExpirySource } from "@/models/StoredItem.ts";
import { TraySlot, SlotStatus, SlotType } from "@/models/TraySlot.ts";
import { installedTrays, Tray, TraySize } from "@/models/Tray.ts";
import {useShoppingStore} from "@/stores/ShoppingStore.ts";
import {storeToRefs} from "pinia";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  initialItemId: {
    type: String,
    default: null
  },
  initialSearchTerm: {
    type: String,
    default: null
  },
  initialItemAmount: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(['update:modelValue', 'item-placed']);

// Dialogs states
const dialogStep = ref(1); // 1: Item Selection, 2: Tray Slot Selection
const selectedItem = ref<Item | null>(null);
const selectedItemQuantity = ref(1);
const selectedSlots = ref<{trayIndex: number, slotIndex: number}[]>([]);

// Scanning states
const scanner = ref<InstanceType<typeof BarcodeScanner> | null>(null);
const isScanning = ref(false);
const lastScan = ref('');

// Searching states
const searchTerm = ref(props.initialSearchTerm || '');
const isSearching = ref(false);
const isLoadingProduct = ref(false);
const productData = ref<OpenFoodFactsResponse | null>(null);
const productError = ref('');

// Tray selection states
const shoppingStore = useShoppingStore();
const { trayAssignments, addedTrays } = storeToRefs(shoppingStore);

const selectedTrayIndex = ref(0);
const selectedTray = computed(() => addedTrays.value[selectedTrayIndex.value] || null);

// Search results
const filteredItems = computed(() => {
  if (!searchTerm.value) return randomItems;

  const term = searchTerm.value.toLowerCase();
  return randomItems.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.id.includes(term)
  );
});

// Populate initial item if provided
const initializeWithItem = (itemId: string) => {
  console.log("itemId", itemId);
  console.log(randomItemsMap)
  if (randomItemsMap.has(itemId)) {
    console.log("itemId", itemId);
    selectedItem.value = randomItemsMap.get(itemId) || null;
    dialogStep.value = 2; // Skip to tray selection
  } else {
    // Try to fetch from OpenFoodFacts if not in local database
    fetchProductInfo(itemId);
  }
};

// If initialItemId is provided, initialize with it


// Start barcode scanning
const startScanning = () => {
  if (scanner.value) {
    scanner.value.startScan();
  }
};

// Scan event handlers
const handleScanStart = () => {
  isScanning.value = true;
};

const handleScanSuccess = async (barcodeContent: string) => {
  lastScan.value = barcodeContent;
  await fetchProductInfo(barcodeContent);
  isScanning.value = false;
};

const handleScanError = (error: string) => {
  Notify.create({
    type: 'negative',
    message: `Scanner error: ${error}`
  });
  isScanning.value = false;
};

const handleStatusChange = (status: number) => {
  isScanning.value = status === 1 || status === 2; // ScanningMobile or ScanningBrowser
};

// Fetch product information from OpenFoodFacts API
const fetchProductInfo = async (barcode: string) => {
  isLoadingProduct.value = true;
  productError.value = '';
  productData.value = null;

  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v3/product/${barcode}.json`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json() as OpenFoodFactsResponse;
    productData.value = data;

    // If product found, create a new Item and select it
    if (data.status === 1 && data.product) {
      const newItem = new Item(
          data.code || uid(),
          data.product.product_name || 'Unknown Product'
      );
      selectedItem.value = newItem;
      dialogStep.value = 2; // Move to tray selection
    }
  } catch (error) {
    console.error('Error fetching product info:', error);
    productError.value = error instanceof Error ? error.message : 'Unknown error';
  } finally {
    isLoadingProduct.value = false;
  }
};

// Get color for nutriscore badge
const getNutriscoreColor = (grade: string): string => {
  const gradeMap: Record<string, string> = {
    'a': 'green',
    'b': 'light-green',
    'c': 'yellow',
    'd': 'orange',
    'e': 'red'
  };

  return gradeMap[grade.toLowerCase()] || 'grey';
};

// Select an item from the list
const selectItem = (item: Item) => {
  selectedItem.value = item;
  dialogStep.value = 2; // Move to tray selection
};

// Handle tray slot selection
const toggleSlotSelection = (trayIndex: number, slotIndex: number) => {
  const slotInfo = { trayIndex, slotIndex };
  const existingIndex = selectedSlots.value.findIndex(
      slot => slot.trayIndex === trayIndex && slot.slotIndex === slotIndex
  );

  // Check if the slot is available
  const tray = addedTrays.value[trayIndex];
  const slot = tray.slots[slotIndex];

  if (slot.holding) {
    Notify.create({
      type: 'negative',
      message: 'This slot is already occupied'
    });
    return;
  }

  if (existingIndex >= 0) {
    // Deselect the slot
    selectedSlots.value.splice(existingIndex, 1);
  } else {
    // Select the slot if we haven't reached the quantity
    if (selectedSlots.value.length < selectedItemQuantity.value) {
      selectedSlots.value.push(slotInfo);
    } else {
      Notify.create({
        type: 'warning',
        message: `You can only select ${selectedItemQuantity.value} slots for this item`
      });
    }
  }
};

// Check if a slot is selected
const isSlotSelected = (trayIndex: number, slotIndex: number) => {
  return selectedSlots.value.some(
      slot => slot.trayIndex === trayIndex && slot.slotIndex === slotIndex
  );
};

// Get the styling for a slot based on its status and selection
const getSlotClass = (trayIndex: number, slotIndex: number, status: SlotStatus) => {
  const isSelected = isSlotSelected(trayIndex, slotIndex);

  let classes = [];

  if (isSelected) {
    classes.push('selected-slot');
  }

  switch(status) {
    case SlotStatus.Empty:
      classes.push('empty-slot');
      break;
    case SlotStatus.OK:
      classes.push('ok-slot');
      break;
    case SlotStatus.Warning:
      classes.push('warning-slot');
      break;
    case SlotStatus.Bad:
      classes.push('bad-slot');
      break;
  }

  return classes.join(' ');
};

// Navigate between trays
const selectTray = (index: number) => {
  if (index >= 0 && index < addedTrays.value.length) {
    selectedTrayIndex.value = index;
  }
};

// Confirm selection and place items
const confirmPlacement = () => {
  if (!selectedItem.value) {
    Notify.create({
      type: 'negative',
      message: 'No item selected'
    });
    return;
  }

  if (selectedSlots.value.length < selectedItemQuantity.value) {
    Dialog.create({
      title: 'Incomplete Selection',
      message: `You selected ${selectedSlots.value.length} slots, but need ${selectedItemQuantity.value}. Continue anyway?`,
      cancel: true,
      persistent: true
    }).onOk(() => {
      placeItems();
    });
  } else {
    placeItems();
  }
};

// Place items in the selected slots
const placeItems = () => {
  if (!selectedItem.value) return;

  const placements: {trayId: string, slotIndex: number, item: StoredItem}[] = [];

  selectedSlots.value.forEach(({trayIndex, slotIndex}) => {
    const tray = addedTrays.value[trayIndex];

    // Create a stored item based on the selected item
    const storedItem = new StoredItem(
        selectedItem.value!.id,
        selectedItem.value!.name,
        1.0, // Default weight
        {
          source: ExpirySource.Estimated,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
    );

    // Update the tray slot
    tray.slots[slotIndex].holding = storedItem;

    // Add to placements
    placements.push({
      trayId: tray.id,
      slotIndex,
      item: storedItem
    });
  });

  // Emit event with placement data
  emit('item-placed', {
    item: selectedItem.value,
    quantity: selectedItemQuantity.value,
    placements
  });

  // Reset and close dialog
  resetDialog();
  emit('update:modelValue', false);
};

// Reset dialog state
const resetDialog = () => {
  dialogStep.value = 1;
  selectedItem.value = null;
  selectedItemQuantity.value = 1;
  selectedSlots.value = [];
  searchTerm.value = '';
  productData.value = null;
  lastScan.value = '';
};

// Go back to item selection
const goBackToItemSelection = () => {
  dialogStep.value = 1;
  selectedSlots.value = [];
};

// Close dialog
const closeDialog = () => {
  resetDialog();
  emit('update:modelValue', false);
};

// Watch for dialog visibility changes
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => {emit('update:modelValue', value)}
});

watch(dialogVisible, (newValue:boolean) => {
  console.log(newValue)
  if (props.initialItemId) {
    initializeWithItem(props.initialItemId);
  }
  if (props.initialItemAmount) {
    selectedItemQuantity.value = props.initialItemAmount
  }
})

</script>

<template>
  <q-dialog
      v-model="dialogVisible"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
  >
    <q-card class="column">
      <!-- Dialog Header -->
      <q-card-section class="bg-primary text-white">
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-h6">{{ dialogStep === 1 ? 'Select Item' : 'Place in Tray' }}</div>
          </div>
          <q-btn v-if="dialogStep === 2" flat round dense icon="sym_r_arrow_back" @click="goBackToItemSelection" />
          <q-btn flat round dense icon="sym_r_close" @click="closeDialog" />
        </div>
      </q-card-section>

      <!-- Step 1: Item Selection -->
      <q-card-section v-if="dialogStep === 1" class="flex-grow-1 scroll">
        <!-- Search Bar -->
        <q-input
            v-model="searchTerm"
            filled
            label="Search for an item"
            clearable
            class="q-mb-md"
        >
          <template v-slot:append>
            <q-icon name="sym_r_search" />
          </template>
        </q-input>

        <!-- Barcode Scanner Button -->
        <div class="row q-mb-md">
          <q-btn
              color="secondary"
              icon="sym_r_qr_code_scanner"
              label="Scan Barcode"
              class="full-width"
              :loading="isScanning"
              @click="startScanning"
          />
        </div>

        <!-- Last Scan Result -->
        <div v-if="lastScan" class="q-mb-md">
          <q-banner class="bg-blue-1">
            <template v-slot:avatar>
              <q-icon name="sym_r_qr_code" color="primary" />
            </template>
            Last scanned: {{ lastScan }}
          </q-banner>
        </div>

        <!-- API Error Message -->
        <div v-if="productError" class="q-mb-md">
          <q-banner class="bg-red-1">
            <template v-slot:avatar>
              <q-icon name="sym_r_error" color="negative" />
            </template>
            {{ productError }}
          </q-banner>
        </div>

        <!-- Loading Indicator -->
        <div v-if="isLoadingProduct" class="row justify-center q-py-md">
          <q-spinner color="primary" size="3em" />
          <span class="q-ml-sm">Loading product details...</span>
        </div>

        <!-- OpenFoodFacts Product Result -->
        <div v-if="productData?.product && !selectedItem" class="q-mb-md">
          <q-card class="cursor-pointer" @click="selectItem(new Item(productData.code || uid(), productData.product.product_name))">
            <q-item>
              <q-item-section v-if="productData.product.image_url" avatar>
                <q-img
                    :src="productData.product.image_url"
                    style="height: 50px; max-width: 50px;"
                    fit="contain"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ productData.product.product_name }}</q-item-label>
                <q-item-label caption>{{ productData.product.brands || 'Unknown brand' }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round icon="sym_r_add" color="primary" />
              </q-item-section>
            </q-item>
          </q-card>
        </div>

        <!-- Item List -->
        <div class="q-mt-md">
          <q-list bordered separator>
            <q-item
                v-for="item in filteredItems"
                :key="item.id"
                clickable
                v-ripple
                @click="selectItem(item)"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ item.name }}</q-item-label>
                <q-item-label caption>ID: {{ item.id }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round icon="sym_r_add" color="primary" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <!-- Step 2: Tray Slot Selection -->
      <q-card-section v-if="dialogStep === 2" class="flex-grow-1 column">
        <!-- Selected Item Display -->
        <div class="row items-center q-mb-md">
          <q-avatar size="50px" class="q-mr-md">
            <q-icon :name="selectedItem?.icon || 'sym_r_grocery'" size="40px" color="primary" />
          </q-avatar>
          <div class="column">
            <div class="text-h6">{{ selectedItem?.name || 'Selected Item' }}</div>
            <div class="text-caption">ID: {{ selectedItem?.id || 'Unknown' }}</div>
          </div>
        </div>

        <!-- Quantity Selection -->
        <div class="row items-center q-mb-md">
          <div class="text-subtitle1 q-mr-md">Quantity:</div>
          <q-btn flat round icon="sym_r_remove" size="sm" @click="selectedItemQuantity > 1 ? selectedItemQuantity-- : null" />
          <div class="q-mx-sm text-h6">{{ selectedItemQuantity }}</div>
          <q-btn flat round icon="sym_r_add" size="sm" @click="selectedItemQuantity++" />
          <div class="q-ml-sm text-caption">(Select {{ selectedItemQuantity }} slots)</div>
        </div>

        <!-- Tray Tabs -->
        <q-tabs
            v-model="selectedTrayIndex"
            class="bg-primary text-white"
            indicator-color="white"
            align="justify"
        >
          <q-tab
              v-for="(tray, index) in addedTrays"
              :key="tray.id"
              :name="index"
              :label="`Tray ${index + 1}`"
          />
        </q-tabs>

        <!-- Tray Slots Grid -->
        <div class="tray-grid q-mt-md flex-grow-1 scroll" v-if="selectedTray">
          <div class="row justify-center">
            <div
                v-for="(row, rowIndex) in Math.sqrt(selectedTray.capacity)"
                :key="rowIndex"
                class="tray-row"
            >
              <div
                  v-for="(col, colIndex) in Math.sqrt(selectedTray.capacity)"
                  :key="colIndex"
                  class="tray-slot"
                  :class="getSlotClass(
                  selectedTrayIndex,
                  rowIndex * Math.sqrt(selectedTray.capacity) + colIndex,
                  selectedTray.slots[rowIndex * Math.sqrt(selectedTray.capacity) + colIndex]?.status
                )"
                  @click="toggleSlotSelection(
                  selectedTrayIndex,
                  rowIndex * Math.sqrt(selectedTray.capacity) + colIndex
                )"
              >
                <div class="slot-content">
                  <div v-if="selectedTray.slots[rowIndex * Math.sqrt(selectedTray.capacity) + colIndex]?.holding">
                    <q-icon :name="selectedTray.slots[rowIndex * Math.sqrt(selectedTray.capacity) + colIndex]?.holding?.icon || 'sym_r_grocery'"
                            size="1.5rem"
                    />
                    <div class="text-caption">
                      {{ selectedTray.slots[rowIndex * Math.sqrt(selectedTray.capacity) + colIndex]?.holding?.name }}
                    </div>
                  </div>
                  <div v-else-if="isSlotSelected(selectedTrayIndex, rowIndex * Math.sqrt(selectedTray.capacity) + colIndex)">
                    <q-icon :name="selectedItem?.icon || 'sym_r_grocery'" size="1.5rem" color="primary" />
                    <div class="text-caption">
                      {{ selectedItem?.name }}
                    </div>
                  </div>
                  <div v-else>
                    {{ rowIndex * Math.sqrt(selectedTray.capacity) + colIndex + 1 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Slots Summary -->
        <div class="q-mt-md">
          <q-banner class="bg-blue-1">
            <template v-slot:avatar>
              <q-icon name="sym_r_info" color="primary" />
            </template>
            Selected {{ selectedSlots.length }} of {{ selectedItemQuantity }} slots
          </q-banner>
        </div>
      </q-card-section>

      <!-- Dialog Actions -->
      <q-card-actions align="right" class="bg-grey-2">
        <q-btn flat label="Cancel" color="negative" @click="closeDialog" />
        <q-btn
            v-if="dialogStep === 2"
            flat
            label="Confirm Placement"
            color="positive"
            :disabled="selectedSlots.length === 0"
            @click="confirmPlacement"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Barcode Scanner Component (hidden) -->
  <BarcodeScanner
      ref="scanner"
      scanningPrompt="Camera is active, scanning..."
      @scan-start="handleScanStart"
      @scan-success="handleScanSuccess"
      @scan-error="handleScanError"
      @status-change="handleStatusChange"
  />
</template>

<style scoped lang="scss">
.tray-grid {
  padding: 1rem;

  .tray-row {
    display: flex;
    justify-content: center;
  }

  .tray-slot {
    width: 4rem;
    height: 4rem;
    margin: 0.25rem;
    border: 2px solid #ccc;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;

    .slot-content {
      text-align: center;
      font-size: 0.8rem;
    }

    &.empty-slot {
      background-color: #f0f0f0;

      &:hover {
        background-color: #e0e0e0;
      }
    }

    &.ok-slot {
      background-color: rgba(0, 200, 0, 0.2);
      border-color: green;
    }

    &.warning-slot {
      background-color: rgba(255, 165, 0, 0.2);
      border-color: orange;
    }

    &.bad-slot {
      background-color: rgba(255, 0, 0, 0.2);
      border-color: red;
    }

    &.selected-slot {
      background-color: rgba(25, 118, 210, 0.2);
      border-color: #1976d2;
      box-shadow: 0 0 5px rgba(25, 118, 210, 0.5);
      transform: scale(1.05);
    }
  }
}
</style>