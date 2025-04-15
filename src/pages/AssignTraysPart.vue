<script setup lang="ts">

import {computed, onMounted, ref} from "vue";
import {User, usersT as users} from "@/models/User.ts";
import ElderSelector from "@/components/ElderSelector.vue";
import {Tray, TrayFactory, TraySize} from "@/models/Tray.ts";
import BarcodeScanner from "@/components/BarcodeScanner.vue";
import {useShoppingStore} from "@/stores/ShoppingStore.ts";
import {storeToRefs} from "pinia";

// Tray interface

// Available trays

const scanner = ref<InstanceType<typeof BarcodeScanner> | null>(null);

// Current tray assignments
const shoppingStore = useShoppingStore();
const { trayAssignments, addedTrays } = storeToRefs(shoppingStore);

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

const assignUser = () => {
  // In a real implementation, you would get the selected user from your user picker
  // This is just a placeholder function
  console.log(`Assigning user to tray ${selectedTrayId.value}`);

  // For demonstration, let's assign a random user
  if (selectedTrayId.value) {
    const randomUserId = users[Math.floor(Math.random() * users.length)].id;

    // Check if tray already has an assignment
    const existingAssignmentIndex = trayAssignments.value.findIndex(
        a => a.trayId === selectedTrayId.value
    );

    if (existingAssignmentIndex >= 0) {
      // Add user to existing assignment if not already there
      trayAssignments.value[existingAssignmentIndex].userId = randomUserId;
    } else {
      // Create new assignment
      trayAssignments.value.push({
        trayId: selectedTrayId.value,
        userId: randomUserId,
      });
    }
  }
};

const removeUserFromTray = (trayId: string) => {
  const assignmentIndex = trayAssignments.value.findIndex(a => a.trayId === trayId);
  if (assignmentIndex >= 0) {
    trayAssignments.value[assignmentIndex].userId =
        null;
  }
};

const clearTray = (trayId: string) => {
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

const saveAssignments = () => {
  // In a real implementation, you would save the assignments to your backend
  console.log('Saving tray assignments:', trayAssignments.value);
  // You could show a success notification here
};

enum FlowStatus {
  BeforeScan,
  ItemScanMobile,
  ItemScanBrowser,
  ItemScanDone
}


const flowStatus = ref<FlowStatus>(FlowStatus.BeforeScan);
const scanNewTray = async () => {
  //open scanner
  //get tray id
  //import tray with tray id
  if (scanner.value) {
    scanner.value.startScan();
  }


}

const handleScanStart = () => {

};

const handleScanSuccess = async (barcodeContent: string) => {
  addedTrays.value.push(TrayFactory.importTray(barcodeContent, TraySize.Norm5x5));
};

const handleScanError = (error: string) => {

};

const handleStatusChange = (status: number) => {

};

onMounted(()=> {
  shoppingStore.clear();
})

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
          v-for="(tray, i) in addedTrays"
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

  <BarcodeScanner
      ref="scanner"
      scanning-prompt="Camera is active, scanning..."
      manual-input-prompt="Enter tray id manually"
      scan-subject="ID"
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