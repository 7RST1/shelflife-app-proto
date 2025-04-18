<!-- ScannerPage.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { scan, Format, checkPermissions, requestPermissions } from '@tauri-apps/plugin-barcode-scanner';
import { Notify } from 'quasar';
import { Platform, platform } from '@tauri-apps/plugin-os';

enum ScannerStatus {
  Ready,
  ScanningMobile,
  ScanningBrowser,
  Completed
}

// Get props from route params or use defaults
const route = useRoute();
const router = useRouter();

const scanningPrompt = ref(route.query.scanningPrompt?.toString() || 'Camera is active, scanning...');
const manualInputTitle = ref(route.query.manualInputTitle?.toString() || 'No camera detected');
const manualInputPrompt = ref(route.query.manualInputPrompt?.toString() || 'Please enter code manually');
const scanSubject = ref(route.query.scanSubject?.toString() || 'Barcode');
const returnRoute = ref(route.query.returnRoute?.toString() || '/');

// Get formats from route params or use defaults
const defaultFormats = [
  Format.QRCode,
  Format.EAN13,
  Format.EAN8,
  Format.Code39,
  Format.Code128
];
const formats = ref<Format[]>(defaultFormats);

// Try to parse formats if they were passed in the route
if (route.query.formats) {
  try {
    const parsedFormats = JSON.parse(route.query.formats.toString());
    if (Array.isArray(parsedFormats)) {
      formats.value = parsedFormats;
    }
  } catch (e) {
    console.error('Failed to parse formats from route', e);
  }
}

const scannerStatus = ref<ScannerStatus>(ScannerStatus.Ready);
const showManualInputDialog = ref(false);
const manualInput = ref('');

// Update the status and trigger any necessary side effects
const updateStatus = (status: ScannerStatus) => {
  scannerStatus.value = status;
};

// Start barcode scanning
const startScan = async () => {
  if (scannerStatus.value === ScannerStatus.ScanningMobile ||
      scannerStatus.value === ScannerStatus.ScanningBrowser) return;

  try {
    const currentPlatform: Platform = platform();
    if (currentPlatform === 'android' || currentPlatform === 'ios') {
      updateStatus(ScannerStatus.ScanningMobile);

      // Check for camera permissions first
      const permissionStatus = await checkPermissions();
      if (!permissionStatus.granted) {
        await requestPermissions();
      }

      // Using the Tauri barcode scanner plugin
      const result = await scan({
        windowed: true,
        formats: formats.value
      });

      // Handle the scan result
      if (result) {
        handleScanSuccess(result.content);
      }
    } else {
      // We are in browser
      updateStatus(ScannerStatus.ScanningBrowser);
      showManualInputDialog.value = true;
    }
  } catch (error) {
    console.error('Error during scanning:', error);
    Notify.create({
      type: 'negative',
      message: 'Failed to start the scanner. Please check camera permissions.'
    });
  } finally {
    updateStatus(ScannerStatus.Ready);
  }
};

const handleScanSuccess = (result: string) => {
  // Return to the previous page with the scan result
  router.push({
    path: returnRoute.value,
    query: {
      scanResult: result,
      scanSuccess: 'true'
    }
  });
};

const submitManualInput = () => {
  if (manualInput.value.trim()) {
    handleScanSuccess(manualInput.value);
    manualInput.value = '';
    showManualInputDialog.value = false;
    updateStatus(ScannerStatus.Ready);
  }
};

const goBack = () => {
  router.back();
};

// Start scanning automatically when the page loads
onMounted(() => {
  // Small delay to ensure the page has fully loaded
  setTimeout(() => {
    startScan();
  }, 500);
});
</script>

<template>
  <q-page class="flex flex-center column">
    <div class="scanner-container q-pa-md">
      <h4 class="text-center q-mb-md">{{ scanSubject }} Scanner</h4>

      <!-- Loading indicator for mobile scanning -->
      <div v-if="scannerStatus === ScannerStatus.ScanningMobile" class="scanning-indicator">
        <q-spinner-ios size="50px" color="primary" />
        <div class="q-mt-sm text-body1">{{ scanningPrompt }}</div>
      </div>

      <!-- Controls -->
      <div class="q-mt-lg flex justify-center">
        <q-btn
            v-if="scannerStatus === ScannerStatus.Ready"
            color="primary"
            icon="qr_code_scanner"
            label="Start Scanning"
            @click="startScan"
        />
        <q-btn
            color="negative"
            icon="arrow_back"
            label="Go Back"
            @click="goBack"
            class="q-ml-md"
        />
      </div>

      <!-- Manual input dialog for browser -->
      <q-dialog v-model="showManualInputDialog">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">{{ manualInputTitle }}</div>
            <div class="q-mt-sm">{{ manualInputPrompt }}</div>
          </q-card-section>
          <q-card-section>
            <q-input
                v-model="manualInput"
                :label="scanSubject"
                autofocus
                @keyup.enter="submitManualInput"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="negative" v-close-popup />
            <q-btn label="Submit" color="primary" @click="submitManualInput" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<style scoped>
.scanner-container {
  width: 100%;
  max-width: 600px;
  text-align: center;
}

.scanning-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}
</style>