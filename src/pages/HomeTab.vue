<script setup lang="ts">

import {installedTrays} from "@/models/Tray.ts";
import TrayGrid from "@/components/TrayGrid.vue";
import {SlotStatus} from "@/models/TraySlot.ts";
import {ref} from "vue";
import Header from "@/components/Header.vue";

const trays = installedTrays
const expandedTray = ref<number | null>(null);

</script>

<template>
  <Header title="Kjøleskap" desc="Her finner du oversikten over innholdet"/>
<div class="column tray-list">
  <div
      v-for="(tray, i) of trays" :class="{
        warning: tray.slots.some(v=>v.status!==SlotStatus.OK),
        expanded: expandedTray == i
      }"
      @click="expandedTray = i"
      class="tray-holder q-pa-sm relative-position"
  >
    <div class="">
      Skuff {{i}}:
    </div>
    <div class="grid-holder">
      <transition>
        <tray-grid :tray="tray" v-if="expandedTray == i">
        </tray-grid>
        <div v-else class="tray-summary q-pa-sm">
          {{tray.slots.filter(v=>v.status==SlotStatus.Bad).length}} utgåtte produkter
        </div>
      </transition>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">

$tray-list-margin: 0.8rem;
.tray-list {

  margin: $tray-list-margin;
  gap: 0.4rem;

  .tray-holder {
    font-weight: 500;
    font-size: 1.2rem;
    color: black;

    .grid-holder {
      border-radius: 0.5rem;
      height: 3rem;
      background-color: #003a00;
      transition: height 0.4s, background-color 0.2s;
      overflow:hidden;
      position: relative;

      &>div {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        height: 100%;
      }
    }

    .tray-summary {
      color: white;
    }

    &.expanded {

      .grid-holder {
        background-color: rgba(0, 58, 0, 0);
        height: calc(100vw - $tray-list-margin);
      }
    }
  }
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>