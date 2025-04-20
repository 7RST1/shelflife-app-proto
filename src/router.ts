import {createMemoryHistory, createRouter, RouteRecordRaw} from 'vue-router'

import HomeTab from "@/pages/HomeTab.vue";
import SettingsTab from "@/pages/SettingsTab.vue";
import ShoppingTab from "@/pages/ShoppingTab.vue";
import StatsTab from "@/pages/StatsTab.vue";
import ShoppingTripPage from "@/pages/ShoppingTripPage.vue";
import ScanItemPage from "@/pages/ScanItemPage.vue";
import BarcodeScannerPage from "@/pages/BarcodeScannerPage.vue";

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home'
  },
  { path: '/home', component: HomeTab },
  { path: '/shopping-list', component: ShoppingTab },
  { path: '/stats', component: StatsTab },
  { path: '/settings', component: SettingsTab },
  { path: '/shopping-trip', component: ShoppingTripPage },
  { path: '/scanner', component: BarcodeScannerPage },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})