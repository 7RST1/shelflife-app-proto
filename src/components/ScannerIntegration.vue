<!-- ScannerIntegration.vue -->
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Format } from '@tauri-apps/plugin-barcode-scanner';

const props = withDefaults(
    defineProps<{
      scanningPrompt?: string,
      manualInputTitle?: string,
      manualInputPrompt?: string,
      scanSubject?: string,
      formats?: Format[],
    }>(),
    {
      scanningPrompt: 'Camera is active, scanning...',
      manualInputTitle: 'No camera detected',
      manualInputPrompt: 'Please enter code manually',
      scanSubject: 'Barcode',
      formats: () => [
        Format.QRCode,
        Format.EAN13,
        Format.EAN8,
        Format.Code39,
        Format.Code128
      ],
    }
);

const emit = defineEmits(['scan-start', 'scan-success', 'scan-error', 'status-change']);
const route = useRoute();
const router = useRouter();
const scanResult = ref<string | null>(null);

// Watch for route changes to detect scan results
watch(
    () => route.query,
    (newQuery) => {
      if (newQuery.scanSuccess === 'true' && newQuery.scanResult) {
        scanResult.value = newQuery.scanResult.toString();
        console.log("scan int:",scanResult.value)

        // Emit the scan success event with the result
        emit('scan-success', scanResult.value);

        // Clean up the URL after processing the result
        const currentRoute = router.currentRoute.value;
        router.replace({
          path: currentRoute.path,
          query: {}
        });
      }
    },
    { immediate: true } // Check on component mount too
);

// Start barcode scanning
const startScan = () => {
  // Emit the scan start event
  emit('scan-start');

  // First record our current route
  const currentRoute = router.currentRoute.value.fullPath;

  // Navigate to the scanner page with all needed parameters
  router.push({
    path: '/scanner',
    query: {
      scanningPrompt: props.scanningPrompt,
      manualInputTitle: props.manualInputTitle,
      manualInputPrompt: props.manualInputPrompt,
      scanSubject: props.scanSubject,
      formats: JSON.stringify(props.formats),
      returnRoute: currentRoute
    }
  });
};

// Update status method for status changes
const updateStatus = (status: number) => {
  emit('status-change', status);
};

// Expose methods to parent component
defineExpose({
  startScan,
  scanResult
});
</script>

<template>
  <div>
    <!-- This component doesn't render anything by default -->
  </div>
</template>