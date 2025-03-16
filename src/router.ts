import { createMemoryHistory, createRouter } from 'vue-router'

import HomeTab from "@/pages/HomeTab.vue";
import SettingsTab from "@/pages/SettingsTab.vue";
import ShoppingTab from "@/pages/ShoppingTab.vue";
import StatsTab from "@/pages/StatsTab.vue";

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  { path: '/home', component: HomeTab },
  { path: '/shopping-list', component: ShoppingTab },
  { path: '/stats', component: StatsTab },
  { path: '/settings', component: SettingsTab },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})