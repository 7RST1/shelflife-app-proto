<script setup lang="ts">
import AssignTraysPart from "@/pages/AssignTraysPart.vue";
import Header from "@/components/Header.vue";
import {ref} from "vue";
import ScanItemPage from "@/pages/ScanItemPage.vue";
import ShoppingTasksPart from "@/pages/ShoppingTasksPart.vue";

enum FlowStatus {
  AssignTrays,
  ShoppingList,
  ScanItem,
  Payment
}

const state = ref<FlowStatus>(FlowStatus.AssignTrays);

</script>

<template>
  <Header title="Shopping Trip" ></Header>
  <q-btn v-if="false" label="prev" @click="state--"/>
  <assign-trays-part v-if="state == FlowStatus.AssignTrays"/>
  <shopping-tasks-part v-if="state == FlowStatus.ShoppingList"/>
  <scan-item-page v-if="state == FlowStatus.ScanItem"/>
  <!-- Float Action Button (For mobile) -->
  <div class="absolute-bottom-right fab-container">
    <q-btn
        v-if="state == FlowStatus.AssignTrays"
        fab
        icon="sym_r_save"
        label="Next"
        @click="state++"
    />
    <q-btn
        v-else-if="state == FlowStatus.ScanItem"
        fab
        icon="sym_r_save"
        label="Pay"
        @click="state++"
    />
  </div>
</template>

<style scoped lang="scss">

</style>