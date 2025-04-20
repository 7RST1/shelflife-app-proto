<template>
  <div class="receipt-container q-pa-md">
    <h4 class="text-h5 q-mb-md">Tray Overview</h4>

    <!-- Tray Assignment Section -->
    <div class="q-mb-lg">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6" v-for="([trayId, tray], trayIndex) in addedTrays" :key="tray.id">
          <q-card class="tray-card">
            <q-card-section>
              <div class="row items-center q-mb-md">
                <div class="col">
                  <div class="text-h6">Tray #{{ trayIndex + 1 }} ({{ getTrayLabel(tray.size) }})</div>
                  <div class="text-caption">ID: {{ tray.id }}</div>
                </div>
                <div class="col-auto">
                  <q-chip v-if="getUserForTray(tray.id)" color="primary" text-color="white">
                    <q-avatar>
                      <q-img :src="getUserForTray(tray.id)?.avatar" />
                    </q-avatar>
                    {{ getUserForTray(tray.id)?.name }}
                  </q-chip>
                  <q-chip v-else color="grey-5">Unassigned</q-chip>
                </div>
              </div>

              <!-- Tray Grid Visualization -->
              <div :class="getGridClass(tray.size)">
                <div
                    v-for="(slot, index) in tray.slots"
                    :key="index"
                    class="tray-slot"
                    :class="{
                    'status-empty': slot.status === SlotStatus.Empty,
                    'status-ok': slot.status === SlotStatus.OK,
                    'status-warning': slot.status === SlotStatus.Warning,
                    'status-bad': slot.status === SlotStatus.Bad,
                    'slot-long': slot.type === SlotType.LongVegetable
                  }"
                >
                  <template v-if="slot.holding">
                    <q-icon :name="getItemIcon(slot.holding.name)" size="md" />
                    <div class="text-caption">{{ slot.holding.name }}</div>
                    <div v-if="slot.holding.expiry" class="text-caption expiry-text">
                      {{ formatDate(slot.holding.expiry.date) }}
                    </div>
                  </template>
                  <template v-else>
                    <div class="text-caption text-grey">Empty</div>
                  </template>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Receipt Summary Section -->
    <q-card class="receipt-summary q-mt-md">
      <q-card-section>
        <div class="text-h6">Receipt Summary</div>
        <q-separator class="q-my-md" />

        <div class="row">
          <div class="col-12 col-md-8">
            <div class="receipt-header row justify-between q-mb-sm">
              <div class="col-5">Item</div>
              <div class="col-2">Quantity</div>
              <div class="col-2">Weight (kg)</div>
              <div class="col-3">Expiry Date</div>
            </div>

            <q-list separator>
              <q-item v-for="(item, index) in allItems" :key="index">
                <q-item-section avatar>
                  <q-icon :name="getItemIcon(item.name)" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.name }}</q-item-label>
                  <q-item-label caption v-if="getItemFromData(item.name)">
                    {{ getItemFromData(item.name)?.brands }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  1
                </q-item-section>
                <q-item-section side>
                  {{ item.weight }}
                </q-item-section>
                <q-item-section side>
                  <q-chip
                      v-if="item.expiry"
                      :color="getExpiryColor(item.expiry.date)"
                      text-color="white"
                      size="sm"
                  >
                    {{ formatDate(item.expiry.date) }}
                  </q-chip>
                  <span v-else>-</span>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div class="col-12 col-md-4 q-pl-md q-pt-md">
            <div class="text-h6 q-mb-md">User Assignments</div>
            <q-list separator>
              <q-item v-for="user in assignedUsers" :key="user.id">
                <q-item-section avatar>
                  <q-avatar>
                    <q-img :src="user.avatar" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ user.name }}</q-item-label>
                  <q-item-label caption>
                    <q-chip
                        :color="getShoppingNeedColor(user.shoppingNeedLevel)"
                        text-color="white"
                        size="sm"
                    >
                      {{ getShoppingNeedText(user.shoppingNeedLevel) }}
                    </q-chip>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="primary">
                    {{ getTraysForUser(user.id).length }} tray(s)
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>

            <q-card-section class="receipt-summary-totals q-mt-md">
              <div class="text-subtitle1">Totals</div>
              <div class="row q-my-sm">
                <div class="col">Total Items:</div>
                <div class="col-auto">{{ allItems.length }}</div>
              </div>
              <div class="row q-my-sm">
                <div class="col">Total Weight:</div>
                <div class="col-auto">{{ calculateTotalWeight() }} kg</div>
              </div>
              <div class="row q-my-sm">
                <div class="col">Items Expiring Soon:</div>
                <div class="col-auto">{{ countItemsExpiringSoon() }}</div>
              </div>
            </q-card-section>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, Ref, ref} from 'vue';
import { useShoppingStore, TrayAssignment } from '@/stores/ShoppingStore.ts';
import { Tray, TraySize } from '@/models/Tray';
import { SlotStatus, SlotType } from '@/models/TraySlot';
import { StoredItem } from '@/models/StoredItem';
import { User, getShoppingNeedColor, getShoppingNeedText, usersM } from '@/models/User';
import { randomItemsMap, Item } from '@/models/Item';
import {storeToRefs} from "pinia";

const shoppingStore = useShoppingStore();
const { trayAssignments, addedTrays } = storeToRefs(shoppingStore) as {
  trayAssignments: Ref<TrayAssignment[]>;
  addedTrays: Ref<Map<string,Tray>>;
};

const assignedUsers = computed(() => {
  const userIds = new Set<string>();

  shoppingStore.trayAssignments.forEach(assignment => {
    if (assignment.userId) {
      userIds.add(assignment.userId);
    }
  });

  return Array.from(userIds).map(userId => usersM.get(userId)).filter(Boolean) as User[];
});

const allItems = computed(() => {
  const items: StoredItem[] = [];

  addedTrays.value.forEach(tray => {
    tray.slots.forEach(slot => {
      if (slot.holding) {
        items.push(slot.holding);
      }
    });
  });

  return items;
});

// Methods
function getTrayLabel(size: TraySize): string {
  switch (size) {
    case TraySize.Norm3x3: return '3x3';
    case TraySize.Norm4x4: return '4x4';
    case TraySize.Norm5x5: return '5x5';
    case TraySize.Vegetables5x5: return 'Veg 5x5';
    default: return 'Unknown';
  }
}

function getGridClass(size: TraySize): string {
  switch (size) {
    case TraySize.Norm3x3: return 'tray-grid grid-3x3';
    case TraySize.Norm4x4: return 'tray-grid grid-4x4';
    case TraySize.Norm5x5: return 'tray-grid grid-5x5';
    case TraySize.Vegetables5x5: return 'tray-grid grid-5x5 vegetables';
    default: return 'tray-grid';
  }
}

function getItemIcon(itemName: string): string {
  const PREFIX = 'sym_r_';
  const lowerName = itemName.toLowerCase();

  // Dairy products
  if (lowerName.includes('melk') || lowerName.includes('milk')) {
    return PREFIX + 'local_cafe'; // Not perfect but can represent liquid
  } else if (lowerName.includes('yoghurt')) {
    return PREFIX + 'glass_cup';
  } else if (lowerName.includes('smør')) {
    return PREFIX + 'nutrition'; // Generic nutrition symbol for butter
  } else if (lowerName.includes('ost')) {
    return PREFIX + 'nutrition'; // Using nutrition symbol for cheese

    // Breakfast/baked items
  } else if (lowerName.includes('egg')) {
    return PREFIX + 'egg'; // There's an egg icon
  } else if (lowerName.includes('brød')) {
    return PREFIX + 'bakery_dining'; // Bakery icon for bread

    // Fruits and vegetables
  } else if (
      lowerName.includes('frukt') ||
      lowerName.includes('jam') ||
      lowerName.includes('berry') ||
      lowerName.includes('syltetøy')
  ) {
    return PREFIX + 'nutrition'; // Using nutrition for fruits/jams
  } else if (lowerName.includes('grønnsak')) {
    return PREFIX + 'grain'; // Grain icon could work for vegetables

    // Condiments
  } else if (lowerName.includes('saus')) {
    return PREFIX + 'soup_kitchen'; // Not ideal but could represent liquid food

    // Meal types
  } else if (lowerName.includes('middag') || lowerName.includes('dinner')) {
    return PREFIX + 'dinner_dining';
  } else if (lowerName.includes('lunsj') || lowerName.includes('lunch')) {
    return PREFIX + 'lunch_dining';
  } else if (lowerName.includes('frokost') || lowerName.includes('breakfast')) {
    return PREFIX + 'breakfast_dining';

    // Restaurant/takeout food
  } else if (lowerName.includes('pizza')) {
    return PREFIX + 'local_pizza';
  } else if (lowerName.includes('fastfood') || lowerName.includes('burger')) {
    return PREFIX + 'fastfood';

    // Cooking related
  } else if (lowerName.includes('baking') || lowerName.includes('cake')) {
    return PREFIX + 'cake';

    // Default fallback
  } else {
    return PREFIX + 'grocery'; // General grocery icon as fallback
  }
}

function getUserForTray(trayId: string): User | undefined {
  const assignment = shoppingStore.trayAssignments.find(a => a.trayId === trayId);
  if (assignment && assignment.userId) {
    return usersM.get(assignment.userId);
  }
  return undefined;
}

function getTraysForUser(userId: string): TrayAssignment[] {
  return shoppingStore.trayAssignments.filter(a => a.userId === userId);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('no-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function getExpiryColor(date: Date): string {
  const today = new Date();
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(today.getDate() + 2);

  if (date < today) {
    return 'negative';
  } else if (date < twoDaysFromNow) {
    return 'warning';
  }
  return 'positive';
}

function calculateTotalWeight(): number {
  return allItems.value.reduce((sum, item) => sum + (item.weight || 0), 0);
}

function countItemsExpiringSoon(): number {
  const today = new Date();
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(today.getDate() + 2);

  return allItems.value.filter(item =>
      item.expiry && item.expiry.date > today && item.expiry.date < twoDaysFromNow
  ).length;
}

function getItemFromData(itemName: string): Item | undefined {
  const lowerName = itemName.toLowerCase();

  // Find a matching item from randomItemsMap
  return Array.from(randomItemsMap.values()).find(item =>
      item.name.toLowerCase().includes(lowerName) || lowerName.includes(item.name.toLowerCase())
  );
}

// Setup mock data for demonstration
onMounted(() => {

});
</script>

<style scoped>
.tray-grid {
  display: grid;
  gap: 8px;
  width: 100%;
}

.grid-3x3 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 80px);
}

.grid-4x4 {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 70px);
}

.grid-5x5 {
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 60px);
}

.tray-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 4px;
  padding: 4px;
  overflow: hidden;
}

.slot-long {
  grid-column: span 2;
}

.status-empty {
  background-color: #f5f5f5;
}

.status-ok {
  background-color: #c8e6c9;
}

.status-warning {
  background-color: #ffe0b2;
}

.status-bad {
  background-color: #ffcdd2;
}

.receipt-summary {
  border-top: 1px dashed #ddd;
}

.receipt-header {
  font-weight: bold;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.receipt-summary-totals {
  border-top: 1px dashed #ddd;
  margin-top: 16px;
}

.expiry-text {
  font-size: 0.7rem;
}

.tray-card {
  height: 100%;
}
</style>