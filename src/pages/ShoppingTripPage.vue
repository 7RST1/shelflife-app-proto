<script setup lang="ts">
import AssignTraysPart from "@/pages/AssignTraysPart.vue";
import Header from "@/components/Header.vue";
import {ref} from "vue";
import ScanItemPage from "@/pages/ScanItemPage.vue";
import ShoppingTasksPart from "@/pages/ShoppingTasksPart.vue";

enum FlowStatus {
  AssignTrays,
  ShoppingList,
  Payment
}

const state = ref<FlowStatus>(FlowStatus.AssignTrays);

</script>

<template>
  <Header title="Shopping Trip" ></Header>
  <q-btn v-if="false" label="prev" @click="state--"/>
  <assign-trays-part v-if="state == FlowStatus.AssignTrays"/>
  <shopping-tasks-part v-if="state == FlowStatus.ShoppingList"/>
  <div v-if="state == FlowStatus.Payment" class="column items-center justify-center">
    <div class="q-ma-sm q-pa-sm">
      <q-img src="qr.png"/>
      <div>Scan this to pay</div>
    </div>
  </div>
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
        v-else-if="state == FlowStatus.ShoppingList"
        fab
        icon="sym_r_wallet"
        label="Pay"
        @click="state++"
    />
  </div>
</template>

<style scoped lang="scss">

</style>