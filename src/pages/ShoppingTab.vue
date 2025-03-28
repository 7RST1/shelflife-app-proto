<script setup lang="ts">

import {useRouter} from "vue-router";

const router = useRouter();

</script>

<template>
  <h1>Handleliste</h1>
  <ul>
    <li>Melk</li>
    <li>Egg</li>
  </ul>
  <q-btn @click="router.push('/scan-item')"/>
</template>

<style scoped>

</style>