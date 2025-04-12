<script setup lang="ts">

import {useRouter} from "vue-router";
import Header from "@/components/Header.vue";

const router = useRouter();

</script>

<template>
  <Header title="Handleliste"/>
  <ul>
    <li>Melk</li>
    <li>Egg</li>
    <li>Melk</li>
    <li>Egg</li>
    <li>Melk</li>
    <li>Egg</li>
    <li>Egg</li>
    <li>Melk</li>
    <li>Egg</li>
  </ul>
  <div class="absolute-bottom-right fab-container">
    <q-btn fab icon="sym_r_shopping_cart" @click="router.push('/scan-item')" color="accent" />
  </div>
</template>

<style scoped>
li {
  font-size: 4rem;
}

</style>