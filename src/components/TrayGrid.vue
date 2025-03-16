<script setup lang="ts">
import {Tray, TraySize} from "@/models/Tray.ts";
import {SlotStatus} from "@/models/TraySlot.ts";

defineProps<{
  tray: Tray
}>()

</script>

<template>
  <div
    class="container"
    :class="{
      container3x3: tray.size == TraySize.Norm3x3,
      container4x4: tray.size == TraySize.Norm4x4,
      container5x5: tray.size == TraySize.Norm5x5,
      containerveg5x5: tray.size == TraySize.Vegetables5x5,
    }"
  >
    <template v-if="tray.size == TraySize.Vegetables5x5">
      <div v-for="(slot,i) of tray.slots"  :class="{v1: i == 0, v2: i == 2, warn: slot.status == SlotStatus.Warning, bad: slot.status == SlotStatus.Bad, empty: slot.status == SlotStatus.Empty}">
        <q-icon :name="slot.holding?.icon" size="3rem"/>
      </div>
    </template>
    <template v-else>
      <div v-for="slot of tray.slots" :class="{warn: slot.status == SlotStatus.Warning, bad: slot.status == SlotStatus.Bad, empty: slot.status == SlotStatus.Empty}">
        <q-icon :name="slot.holding?.icon" size="3rem"/>
        <q-icon v-if="slot.status == SlotStatus.Bad" name="sym_r_remove" size="15rem" class="cross-out-bad"/>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">

.container {
  display: grid;
  gap: 0.6rem;

  //default OK
  &>div {
    background-color: green;
    border-radius: 0.4rem;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    overflow: hidden;

    &.warn {
      background-color: yellow;
    }

    &.bad {
      background-color: red;
    }

    &.empty {
      background-color: transparent;
      border: 2px solid gray;
    }

    .cross-out-bad {
      position: absolute;
      transform: rotate(-45deg);
      font-variation-settings: 'wght' 100;
      opacity: 0.7;
    }
  }
}

.container3x3 {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-areas:
    ". . ."
    ". . ."
    ". . .";
}

.container4x4 {
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr;
  grid-template-areas:
    ". . . ."
    ". . . ."
    ". . . ."
    ". . . .";
}

.container5x5 {
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
  grid-template-areas:
    ". . . . ."
    ". . . . ."
    ". . . . ."
    ". . . . ."
    ". . . . .";
}
.containerveg5x5 {
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
  grid-template-areas:
    ". . . . ."
    ". v1 . v2 ."
    ". v1 . v2 ."
    ". . . . ."
    ". . . . .";
}
.v1 { grid-area: v1; }
.v2 { grid-area: v2; }
</style>