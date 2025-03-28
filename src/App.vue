<script setup lang="ts">
</script>

<template>
  <div class="router-view">
    <router-view/>
  </div>
  <q-tabs
      class="tabs-row"
      indicator-color="transparent"
      active-class="active">
    <q-route-tab
        icon="sym_r_home"
        to="/home"
        exact
    />
    <q-route-tab
        icon="sym_r_shopping_cart"
        to="/shopping-list"
        exact
    />
    <q-route-tab
        icon="sym_r_analytics"
        to="/stats"
        exact
    />
    <q-route-tab
        icon="sym_r_settings"
        to="/settings"
        exact
    />
  </q-tabs>
</template>

<style scoped lang="scss">

$bar-height: 4rem;

.router-view {
  max-height: calc(100vh - $bar-height);
}

.tabs-row {
  height: $bar-height;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;

}

.q-tab {
  font-variation-settings: 'FILL' 0;
  transition: font-variation-settings 200ms;
  border-top: 2px black solid;
}

.q-router-link--active {
  font-variation-settings: 'FILL' 1;
}

</style>