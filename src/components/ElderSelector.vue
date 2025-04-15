<script setup lang="ts">
import { ref, computed } from 'vue';
import { date } from 'quasar';
import { User, getShoppingNeedColor, getShoppingNeedText, usersT as users } from '../models/User.ts';

const selectedUsers = defineModel<User[]>({default: []});
const searchText = ref('');

const filteredUsers = computed(() => {
  if (!searchText.value) return users;

  const searchLower = searchText.value.toLowerCase();
  return users.filter(user =>
      user.name.toLowerCase().includes(searchLower) ||
      user.address.toLowerCase().includes(searchLower)
  );
});

const isSelected = (user: User): boolean => {
  return selectedUsers.value.some(u => u.id === user.id);
};

const toggleUserSelection = (user: User) => {
  if (isSelected(user)) {
    selectedUsers.value = selectedUsers.value.filter(u => u.id !== user.id);
  } else {
    selectedUsers.value = [...selectedUsers.value, user];
  }
};

const clearSelection = () => {
  selectedUsers.value = [];
};

const formatDate = (dateVal: Date): string => {
  return `Last trip: ${date.formatDate(dateVal, 'MMM D')}`;
};

const continueToShoppingLists = () => {
  // Here you would navigate to the shopping lists page
  // with the selected users, e.g.:
  // router.push({
  //   name: 'shopping-lists',
  //   params: { userIds: selectedUsers.value.map(u => u.id).join(',') }
  // });
  console.log('Selected users:', selectedUsers.value);
};
</script>

<template>
    <div class="q-pa-md">
      <h5 class="q-mt-none q-mb-md">Shopping Trip</h5>

      <p class="text-body1 q-mb-md">
        Select the elderly clients you'll be shopping for today:
      </p>

      <!-- Search Input -->
      <q-input
          v-model="searchText"
          filled
          dense
          clearable
          placeholder="Search clients by name"
          class="q-mb-md"
      >
        <template v-slot:prepend>
          <q-icon name="sym_r_search" />
        </template>
      </q-input>

      <!-- Selected Users Summary -->
      <div v-if="selectedUsers.length > 0" class="q-mb-md bg-blue-1 rounded-borders q-pa-sm">
        <div class="row items-center">
          <div class="col">
            <span class="text-bold">{{ selectedUsers.length }} {{ selectedUsers.length === 1 ? 'client' : 'clients' }} selected</span>
          </div>
          <div class="col-auto">
            <q-btn flat dense color="primary" label="Clear All" @click="clearSelection" />
          </div>
        </div>
      </div>

      <!-- Client Grid -->
      <div class="row q-col-gutter-md">
        <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <q-card
              :class="['user-card', {'selected': isSelected(user)}]"
              @click="toggleUserSelection(user)"
              clickable
              bordered
          >
            <q-card-section class="row no-wrap items-center">
              <div class="col-auto">
                <q-avatar size="72px">
                  <img :src="user.avatar" />
                </q-avatar>
              </div>

              <div class="col q-ml-md">
                <div class="row">
                  <div class="text-h6 ellipsis">{{ user.name }}</div>
                  <q-space />
                  <q-btn
                      v-if="isSelected(user)"
                      round
                      icon="sym_r_check"
                      size="sm"
                  />
                </div>
                <div class="text-caption q-mt-sm">{{ user.address }}</div>

                <div class="q-mt-sm">
                  <div class="row items-center">
                    <div class="col">
                      <q-badge
                          :color="getShoppingNeedColor(user.shoppingNeedLevel)"
                          class="q-py-xs"
                      >
                        {{ getShoppingNeedText(user.shoppingNeedLevel) }}
                      </q-badge>
                    </div>
                    <div class="col-auto text-caption">
                      {{ user.lastShoppingDate ? formatDate(user.lastShoppingDate) : 'No previous trips' }}
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-linear-progress
                  :value="1 - user.shoppingNeedLevel / 100"
                  :color="getShoppingNeedColor(user.shoppingNeedLevel)"
                  style="height: 8px"
                  rounded
              />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredUsers.length === 0" class="column items-center q-pa-lg">
        <q-icon name="sym_r_sentiment_dissatisfied" size="64px" color="grey-6" />
        <div class="q-mt-md text-grey-8">No clients match your search</div>
      </div>

      <!-- Continue Button -->
      <div class="fixed-bottom-right q-pa-md">
        <q-btn
            :disable="selectedUsers.length === 0"
            color="primary"
            label="Continue to Shopping Lists"
            icon-right="sym_r_arrow_forward"
            @click="continueToShoppingLists"
            rounded
            unelevated
            class="q-px-md"
            size="lg"
        />
      </div>
    </div>
</template>

<style scoped lang="scss">



// Custom variables for shopping trip page
$card-border-radius: 16px;
$card-transition: all 0.3s ease;
$card-selected-border-width: 2px;
$card-hover-transform: translateY(-4px);

// Shopping need level colors
$need-low-color: #4caf50;     // Green
$need-medium-color: #ff9800;  // Orange
$need-high-color: #f44336;    // Red

  // Card styling
  .user-card {
    border-radius: $card-border-radius;
    transition: $card-transition;
    overflow: hidden;


    &.selected {
      border: $card-selected-border-width solid var(--q-primary);
      background-color: rgba(var(--q-primary-rgb), 0.05);

      .q-avatar {
        transform: scale(1.05);
      }
    }
  }

  // Avatar styling
  .q-avatar {
    transition: transform 0.3s ease;
    border: 1px solid #e0e0e0;
  }

  // Shopping need indicator
  .need-indicator {
    height: 8px;
    border-radius: 4px;
    overflow: hidden;

    &--low {
      background-color: $need-low-color;
    }

    &--medium {
      background-color: $need-medium-color;
    }

    &--high {
      background-color: $need-high-color;
    }
  }

  // Animation for selection
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }

  .selection-animation {
    animation: pulse 0.5s ease;
  }

  // Continue button styling
  .continue-btn {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 220px;
  }

// Empty state styling
.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #9e9e9e;

  &__icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  &__text {
    font-size: 16px;
  }
}

</style>