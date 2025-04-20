<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import {scan, Format, checkPermissions, requestPermissions} from '@tauri-apps/plugin-barcode-scanner';
import { Notify } from 'quasar';
import { Platform, platform } from '@tauri-apps/plugin-os';
import {useScanningStore} from "@/stores/scannerStore.ts";

enum ScannerStatus {
  Ready,
  ScanningMobile,
  ScanningBrowser,
  Completed
}

const props = withDefaults(
  defineProps<{
    scanningPrompt?: string,
    manualInputTitle?: string,
    manualInputPrompt?: string,
    scanSubject?: string,
    formats?: () => Format[],
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
)

const emit = defineEmits(['scan-start', 'scan-success', 'scan-error', 'status-change']);

const scannerStatus = ref<ScannerStatus>(ScannerStatus.Ready);
const showManualInputDialog = ref(false);
const manualInput = ref('');

const scanningStore = useScanningStore();

// Expose the current status to parent components
const updateStatus = (status: ScannerStatus) => {
  scannerStatus.value = status;
  scanningStore.isScanning = status == ScannerStatus.ScanningMobile;
  emit('status-change', status);
};

// Start barcode scanning
const startScan = async () => {
  if (scannerStatus.value === ScannerStatus.ScanningMobile ||
      scannerStatus.value === ScannerStatus.ScanningBrowser) return;


  emit('scan-start');

  try {
    const currentPlatform: Platform = platform();
    if (currentPlatform === 'android' || currentPlatform === 'ios') {
      updateStatus(ScannerStatus.ScanningMobile);
      // Using the Tauri barcode scanner plugin
      const result = await scan({
        windowed: true,
        formats: props.formats
      });

      // Handle the scan result
      if (result) {
        emit('scan-success', result.content);
        updateStatus(ScannerStatus.Completed);
      }
    } else {
      // We are in browser
      updateStatus(ScannerStatus.ScanningBrowser);
      showManualInputDialog.value = true;
    }
  } catch (error) {
    console.error('Error during scanning:', error);
    emit('scan-error', error instanceof Error ? error.message : 'Unknown error');
    Notify.create({
      type: 'negative',
      message: 'Failed to start the scanner. Please check camera permissions.'
    });
  } finally {
    updateStatus(ScannerStatus.Ready);
  }
};

const submitManualInput = () => {
  if (manualInput.value.trim()) {
    emit('scan-success', manualInput.value);
    manualInput.value = '';
    showManualInputDialog.value = false;
    updateStatus(ScannerStatus.Ready);
  }
};

// Make our methods accessible to the parent component
defineExpose({
  startScan,
  ScannerStatus,
  currentStatus: scannerStatus
});
</script>

<template>
  <div>
    <!-- Loading indicator for mobile scanning -->

    <!-- Manual input dialog for browser -->
    <q-dialog v-model="showManualInputDialog">
      <q-card>
        <q-card-section>
          <h4>{{ manualInputTitle }}</h4>
          <p>{{ manualInputPrompt }}</p>
        </q-card-section>
        <q-card-section>
          <q-input v-model="manualInput" :label="scanSubject" @keyup.enter="submitManualInput" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="negative" v-close-popup />
          <q-btn label="Submit" @click="submitManualInput" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>