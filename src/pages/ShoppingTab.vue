<script setup lang="ts">

import {useRouter} from "vue-router";
import Header from "@/components/Header.vue";

const router = useRouter();

import { defineComponent, ref, computed } from 'vue';
import { User, usersT, usersM, getShoppingNeedColor, getShoppingNeedText } from '@/models/User';
import { Item, randomItems } from '@/models/Item';
import { ShoppingList, shoppingListsT } from '@/models/ShoppingList';

const searchText = ref('');
const sortBy = ref('need');
const sortOptions = [
  { label: 'Shopping need (high to low)', value: 'need' },
  { label: 'Name (A to Z)', value: 'name' },
  { label: 'Last shopping date', value: 'date' }
];

// Get shopping list for a specific user
const getShoppingList = (userId: string): ShoppingList => {
  const list = shoppingListsT.find(list => list.owner === userId);
  return list || { owner: userId, listings: [] };
};

// Get proper icon for an item
const getItemIcon = (item: Item | string): string => {
  if (typeof item === 'string') {
    // Simple string item handling
    if (item.toLowerCase().includes('melk') || item.toLowerCase().includes('milk')) {
      return 'sym_r_water_full';
    } else if (item.toLowerCase().includes('egg')) {
      return 'sym_r_egg';
    } else if (
        item.toLowerCase().includes('frukt') ||
        item.toLowerCase().includes('jam') ||
        item.toLowerCase().includes('berry')
    ) {
      return 'sym_r_nutrition';
    }
    return 'sym_r_grocery';
  } else {
    // Item object has its own icon method
    return item.icon;
  }
};

// Get display name for an item
const getItemDisplayName = (item: Item | string): string => {
  if (typeof item === 'string') {
    return item;
  } else {
    return item.brands ? `${item.name}` : item.name;
  }
};

// Get brand for an item
const getItemBrand = (item: Item | string): string | undefined => {
  if (typeof item === 'string') {
    return undefined;
  } else {
    return item.brands;
  }
};

// Format date for display
const formatDate = (date?: Date): string => {
  if (!date) return 'N/A';
  return date.toLocaleDateString('no-NO');
};

// Filtered and sorted users
const filteredUsers = computed(() => {
  // Start with all users who have shopping lists
  let filtered = usersT.filter(user => {
    const hasList = shoppingListsT.some(list => list.owner === user.id);
    return hasList;
  });

  // Apply search filter
  if (searchText.value) {
    const search = searchText.value.toLowerCase();
    filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(search) ||
        user.address.toLowerCase().includes(search)
    );
  }

  // Apply sorting
  if (sortBy.value === 'need') {
    filtered.sort((a, b) => b.shoppingNeedLevel - a.shoppingNeedLevel);
  } else if (sortBy.value === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy.value === 'date') {
    filtered.sort((a, b) => {
      if (!a.lastShoppingDate) return 1;
      if (!b.lastShoppingDate) return -1;
      return a.lastShoppingDate.getTime() - b.lastShoppingDate.getTime();
    });
  }

  return filtered;
});


</script>

<template>
  <Header title="Shopping Lists"/>
  <!-- Filter and sort controls -->
  <div class="row q-mb-md q-mt-sm q-mx-sm q-gutter-md">
    <q-select
        v-model="sortBy"
        :options="sortOptions"
        label="Sort by"
        outlined
        dense
        class="col-grow"
        style="max-width: 200px"
    />
    <q-input
        v-model="searchText"
        placeholder="Search clients"
        outlined
        dense
        class="col-grow"
    >
      <template v-slot:append>
        <q-icon name="sym_r_search" />
      </template>
    </q-input>
  </div>

  <!-- Client shopping lists -->
  <div class="row q-col-gutter-md">
    <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="col-12 col-md-6 col-lg-4"
    >
      <q-card class="shopping-list-card">
        <q-card-section class="bg-grey-2">
          <div class="row items-center no-wrap">
            <q-avatar size="50px">
              <q-img :src="user.avatar" :ratio="1" />
            </q-avatar>

            <div class="col q-ml-md">
              <div class="text-weight-bold">{{ user.name }}</div>
              <div class="text-grey-8 text-body2">{{ user.address }}</div>
            </div>

            <q-chip
                :color="getShoppingNeedColor(user.shoppingNeedLevel)"
                text-color="white"
                size="sm"
            >
              {{ getShoppingNeedText(user.shoppingNeedLevel) }}
            </q-chip>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="text-subtitle2 q-mb-xs">Shopping List</div>

          <q-list separator>
            <q-item v-for="(listing, index) in getShoppingList(user.id).listings" :key="index">
              <q-item-section avatar>
                <q-icon
                    :name="getItemIcon(listing.item)"
                    size="24px"
                    color="primary"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ getItemDisplayName(listing.item) }}</q-item-label>
                <q-item-label caption v-if="getItemBrand(listing.item)">
                  {{ getItemBrand(listing.item) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-badge color="primary" outline>
                  {{ listing.amount }}
                </q-badge>
              </q-item-section>
            </q-item>

            <q-item v-if="getShoppingList(user.id).listings.length === 0">
              <q-item-section>
                <q-item-label class="text-grey">No items in shopping list</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row items-center text-grey-8 text-caption">
            <div>
              <q-icon name="sym_r_event" size="14px" class="q-mr-xs" />
              Last shopping: {{ formatDate(user.lastShoppingDate) }}
            </div>
            <q-space />
            <div v-if="user.dietaryNotes">
              <q-icon name="sym_r_info" size="14px" class="q-mr-xs" />
              {{ user.dietaryNotes }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
  <div class="absolute-bottom-right fab-container">
    <q-btn fab icon="sym_r_shopping_cart" @click="router.push('/shopping-trip')" color="accent" />
  </div>
</template>

<style scoped>
li {
  font-size: 4rem;
}

</style>