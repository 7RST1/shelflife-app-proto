<script setup lang="ts">

import {ref} from "vue";

const hasPaid = ref(false);
setTimeout(()=>hasPaid.value = true, 3000)

</script>

<template>
  <div class="column items-center justify-center">
    <div class="q-ma-sm q-pa-sm q-mt-lg">
      <div class="q-mb-sm text-h6 text-center">
        Scan to pay:
      </div>
      <q-card class="qrcard"
              flat bordered
              style="border-radius:1.5rem;"
              @click="hasPaid = !hasPaid"
              :class="{haspaid:hasPaid}"
      >
        <transition name="bounce">
          <q-img v-if="!hasPaid" src="qr.png" width="200px" height="200px"/>
          <q-icon v-else size="200px" name="sym_r_done" class="icon"/>
        </transition>
      </q-card>
    </div>
  </div>
</template>

<style scoped lang="scss">

.qrcard {
  color: #c8eac8;
  transition: background-color 200ms;
  position: relative;
  height: 232px;
  width: 232px;
  padding: 16px;

  &>* {
    position: absolute
  }

  &.haspaid {
    background: #003a00;
  }
}


.bounce-enter-active.icon {
  animation: bounce-in 0.6s;
}
.bounce-leave-active.icon {
  animation: bounce-in 0.6s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}
</style>