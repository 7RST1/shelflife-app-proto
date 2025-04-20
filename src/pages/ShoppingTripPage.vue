<script setup lang="ts">
import AssignTraysPart from "@/pages/AssignTraysPart.vue";
import Header from "@/components/Header.vue";
import {ref} from "vue";
import ScanItemPage from "@/pages/ScanItemPage.vue";
import ShoppingTasksPart from "@/pages/ShoppingTasksPart.vue";
import PaymentPart from "@/pages/PaymentPart.vue";
import RecieptPart from "@/pages/RecieptPart.vue";

enum FlowStatus {
  AssignTrays,
  ShoppingList,
  Receipt,
  Payment
}

const state = ref<FlowStatus>(FlowStatus.AssignTrays);

</script>

<template>
  <Header title="Shopping Trip" ></Header>
  <q-btn v-if="false" label="prev" @click="state--"/>
  <assign-trays-part v-if="state == FlowStatus.AssignTrays"/>
  <shopping-tasks-part v-if="state == FlowStatus.ShoppingList"/>
  <reciept-part v-if="state == FlowStatus.Receipt"/>
  <payment-part v-if="state == FlowStatus.Payment"/>
  <!-- Float Action Button (For mobile) -->
  <div class="absolute-bottom-right fab-container">
    <q-btn
        v-if="state == FlowStatus.AssignTrays"
        fab
        icon="sym_r_arrow_forward"
        label="Start"
        @click="state++"
    />
    <q-btn
        v-else-if="state == FlowStatus.ShoppingList"
        fab
        icon="sym_r_receipt"
        label="Receipt"
        @click="state++"
    />
    <q-btn
        v-else-if="state == FlowStatus.Receipt"
        fab
        icon="sym_r_wallet"
        label="Pay"
        @click="state++"
    />
  </div>
</template>

<style lang="scss">
.q-btn--fab {
  background: #b2d1b6;

  .q-btn__content > span {
    margin-left: 0.5rem !important;
  }
}
</style>