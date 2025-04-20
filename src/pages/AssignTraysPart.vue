<!-- TrayAssignmentPage.vue -->
<script setup lang="ts">
import {computed, onMounted, Ref, ref, watch} from "vue";
import {User, usersT as users} from "@/models/User.ts";
import ElderSelector from "@/components/ElderSelector.vue";
import {Tray, TrayFactory, TraySize} from "@/models/Tray.ts";
import {TrayAssignment, useShoppingStore} from "@/stores/ShoppingStore.ts";
import {storeToRefs} from "pinia";
import ScannerIntegration from "@/components/ScannerIntegration.vue";
import {useRoute} from "vue-router";
import {Notify} from "quasar";

// Get route for detecting scanner results
const route = useRoute();

// Scanner integration reference
const scanner = ref<InstanceType<typeof ScannerIntegration> | null>(null);

// Current tray assignments
const shoppingStore = useShoppingStore();
const { trayAssignments, addedTrays } = storeToRefs(shoppingStore) as {
  trayAssignments: Ref<TrayAssignment[]>;
  addedTrays: Ref<Map<string,Tray>>; // assuming Tray is an interface you've defined
};

// UI state
const selectedTrayId = ref<string | null>(null);
const showUserPicker = ref(false);
const resetConfirmation = ref(false);
const selectedUsers = ref<User[]>([]);

const userSelected = (newValue: User[]) => {
  if (newValue.length > 0) {
    showUserPicker.value = false;
    selectedUsers.value = [];
  } else return;
  const _selectedTrayId = selectedTrayId.value;
  if (_selectedTrayId === null) return;
  const selectedTray = trayAssignments.value.find(v => v.trayId == _selectedTrayId);
  if (!!selectedTray) {
    selectedTray.userId = newValue[0].id;
  } else {
    trayAssignments.value.push({trayId: _selectedTrayId, userId: newValue[0].id});
  }
}

// Computed properties
const assignedTrays = computed(() => {
  return trayAssignments.value.filter(assignment =>
      !!assignment.userId
  );
});

// Methods
const isTrayAssigned = (trayId: string): boolean => {
  const assignment = trayAssignments.value.find(a => a.trayId === trayId);
  return assignment ? !!assignment.userId : false;
};

const getAssignedUsers = (trayId: string): User[] => {
  const assignment = trayAssignments.value.find(a => a.trayId === trayId);
  if (!assignment || !assignment.userId) return [];

  return users.filter(user => user.id == assignment.userId);
};

const openUserPicker = (trayId: string) => {
  selectedTrayId.value = trayId;
  showUserPicker.value = true;
};

const removeUserFromTray = (trayId: string) => {
  const assignmentIndex = trayAssignments.value.findIndex(a => a.trayId === trayId);
  if (assignmentIndex >= 0) {
    trayAssignments.value[assignmentIndex].userId = null;
  }
};

const resetAllAssignments = () => {
  trayAssignments.value = trayAssignments.value.map(assignment => ({
    ...assignment,
    userId: null
  }));
};

enum FlowStatus {
  BeforeScan,
  ItemScanMobile,
  ItemScanBrowser,
  ItemScanDone
}

const flowStatus = ref<FlowStatus>(FlowStatus.BeforeScan);

const scanNewTray = async () => {
  if (scanner.value) {
    console.log("Starting tray scan");
    scanner.value.startScan();
  }
}

const handleScanStart = () => {
  console.log("Scan started");
  flowStatus.value = FlowStatus.ItemScanMobile;
};

const handleScanSuccess = async (barcodeContent: string) => {
  console.log("Scan success in TrayAssignment:", barcodeContent);
  flowStatus.value = FlowStatus.ItemScanDone;

  // Process the scan result
  try {
    // Add the scanned tray to the store
    if (addedTrays.value.has(barcodeContent)) return;
    const newTray = TrayFactory.importTray(barcodeContent, TraySize.Norm5x5);
    addedTrays.value.set(barcodeContent, newTray);
    console.log("Added tray", addedTrays.value.size);

  } catch (error) {
    console.error("Error importing tray:", error);
  }
};

const handleScanError = (error: string) => {
  console.error("Scan error:", error);
  flowStatus.value = FlowStatus.BeforeScan;

};

const handleStatusChange = (status: number) => {
  console.log("Scan status changed:", status);
  if (status === 0) { // ScannerStatus.Ready
    flowStatus.value = FlowStatus.BeforeScan;
  }
};

onMounted(() => {
  //shoppingStore.clear();
});
</script>

<template>
  <div class="q-pa-md tray-assignment-page">

    <!-- Tray status overview -->
    <div class="row q-mb-lg">
      <div class="col-12 col-md-auto">
        <q-chip color="green" text-color="white" icon="sym_r_check_circle">
          {{ assignedTrays.length }} Trays Assigned
        </q-chip>
      </div>
      <div class="col-12 col-md-auto q-ml-md">
      </div>
      <div class="col"></div>
      <div class="col-12 col-md-auto">
        <q-btn
            outline
            color="primary"
            label="Reset All Assignments"
            icon="sym_r_restart_alt"
            size="sm"
            @click="resetConfirmation = true"
        />
      </div>
    </div>

    <!-- Trays grid -->
    <div class="row q-col-gutter-md">
      <div
          v-for="([id, tray], i) in addedTrays"
          :key="tray.id"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-card
            :class="[
              'tray-card',
              { 'assigned': isTrayAssigned(tray.id) },
              { 'multiple-users': getAssignedUsers(tray.id).length > 1 },
              { 'selected': selectedTrayId === tray.id }
            ]"
            @click="openUserPicker(tray.id)"
            clickable
            bordered
        >
          <div class="tray-nr">
            <div class="absolute-center">
              {{i + 1}}
            </div>
          </div>
          <q-card-section class="column items-center">
            <!-- Tray Icon -->
            <div class="tray-icon q-mb-sm">
              <q-icon
                  :name="isTrayAssigned(tray.id) ? 'sym_r_shopping_basket' : 'sym_r_shopping_cart'"
                  :color="isTrayAssigned(tray.id) ? 'primary' : 'grey-7'"
                  size="48px"
              />
            </div>

            <!-- Tray Number -->
            <div class="text-h5 q-mb-xs">Tray #{{ tray.id }}</div>

            <!-- Tray Size/Capacity -->
            <div class="text-caption q-mb-md">{{ tray.capacity }} items max</div>

            <!-- Assigned Users -->
            <div v-if="getAssignedUsers(tray.id).length > 0" class="assigned-users full-width">
              <div class="text-weight-medium q-mb-xs">Assigned to:</div>
              <div
                  v-for="user in getAssignedUsers(tray.id)"
                  :key="user.id"
                  class="user-chip"
              >
                <q-chip
                    size="1.5rem"
                    removable
                    @remove="removeUserFromTray(tray.id)"
                    class="full-width"
                >
                  <q-avatar>
                    <q-img :src="user.avatar"/>
                  </q-avatar>
                  {{ user.name }}
                </q-chip>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-tray-text">
              <em>No client assigned</em>
            </div>
          </q-card-section>

          <!-- Selected indicator -->
          <div v-if="selectedTrayId === tray.id" class="selected-indicator"></div>
        </q-card>
      </div>
    </div>

    <!-- No Trays State -->
    <q-card class="column items-center q-pa-lg q-mt-sm" flat bordered @click="scanNewTray">
      <q-icon name="sym_r_inventory_2" size="64px" color="grey-6" />
      <div class="q-mt-md text-grey-8">Add tray</div>
    </q-card>

  </div>

  <!-- User picker dialog (placeholder) -->
  <q-dialog v-model="showUserPicker" persistent>
    <q-card style="min-width: 350px">
      <elder-selector v-model="selectedUsers" @update:model-value="userSelected"/>
    </q-card>
  </q-dialog>

  <!-- Reset confirmation dialog -->
  <q-dialog v-model="resetConfirmation">
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="sym_r_warning" color="warning" text-color="white" />
        <span class="q-ml-sm text-h6">Clear All Assignments?</span>
      </q-card-section>

      <q-card-section>
        This will remove all client assignments from all trays. This action cannot be undone.
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="Reset All" color="negative" @click="resetAllAssignments" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Scanner Integration component -->
  <ScannerIntegration
      ref="scanner"
      scanSubject="Tray"
      manual-input-prompt="Enter tray ID manually"
      scanningPrompt="Camera is active, scanning..."
      @scan-start="handleScanStart"
      @scan-success="handleScanSuccess"
      @scan-error="handleScanError"
      @status-change="handleStatusChange"
  />
</template>

<style scoped lang="scss">
.q-card {
  border-radius: 1rem;

  .tray-nr {
    position: absolute;
    top: 0.3rem;
    left: 0.3rem;
    border-radius: 1.5rem !important;
    height: 2rem;
    width: 2rem;
    background-color: orange;
  }
}
</style>