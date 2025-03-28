<template>
    <div class="column items-center q-gutter-y-md">
      <h4 class="text-h4 text-center q-mt-lg">Barcode Scanner</h4>

      <q-btn
          color="primary"
          icon="qr_code_scanner"
          label="Scan Barcode"
          :loading="isScanning"
          @click="startScan"
          size="lg"
      />

      <div v-if="lastScan" class="q-mt-md text-center">
        <div class="text-body1">Last scanned: {{ lastScan }}</div>
      </div>

      <q-inner-loading :showing="isScanning">
        <q-spinner-ios size="50px" color="primary" />
        <div class="q-mt-sm text-body1">Camera is active, scanning...</div>
      </q-inner-loading>
    </div>

    <!-- Product details dialog -->
    <q-dialog v-model="showProductDialog" persistent>
      <q-card style="min-width: 350px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ productData?.product?.product_name || 'Product Details' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="isLoadingProduct">
          <div class="flex flex-center q-pa-md">
            <q-spinner color="primary" size="3em" />
            <span class="q-ml-sm">Loading product details...</span>
          </div>
        </q-card-section>

        <q-card-section v-else-if="productError">
          <q-banner class="bg-red-1">
            <template v-slot:avatar>
              <q-icon name="error" color="negative" />
            </template>
            Error loading product: {{ productError }}
          </q-banner>
        </q-card-section>

        <q-card-section v-else-if="productData?.status === 0">
          <q-banner class="bg-orange-1">
            <template v-slot:avatar>
              <q-icon name="info" color="warning" />
            </template>
            Product not found in database.
          </q-banner>
        </q-card-section>

        <q-card-section v-else-if="productData?.product">
          <q-item>
            <q-item-section v-if="productData.product.image_url" avatar>
              <q-img
                  :src="productData.product.image_url"
                  style="height: 100px; max-width: 100px;"
                  fit="contain"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ productData.product.product_name }}</q-item-label>
              <q-item-label caption>{{ productData.product.brands || 'Unknown brand' }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <div v-if="productData.product.nutriscore_grade" class="q-mb-md">
            <div class="text-subtitle2">Nutri-Score:</div>
            <q-badge
                :color="getNutriscoreColor(productData.product.nutriscore_grade)"
                class="q-pa-sm text-white"
            >
              {{ productData.product.nutriscore_grade.toUpperCase() }}
            </q-badge>
          </div>

          <div v-if="productData.product.ingredients_text" class="q-mb-md">
            <div class="text-subtitle2">Ingredients:</div>
            <p class="text-body2">{{ productData.product.ingredients_text }}</p>
          </div>

          <div v-if="productData.product.nutriments" class="q-mb-md">
            <div class="text-subtitle2">Nutrition Facts (per 100g):</div>
            <q-list dense>
              <q-item v-if="productData.product.nutriments.energy_100g !== undefined">
                <q-item-section>Energy</q-item-section>
                <q-item-section side>{{ productData.product.nutriments.energy_100g }} {{ productData.product.nutriments.energy_unit }}</q-item-section>
              </q-item>
              <q-item v-if="productData.product.nutriments.proteins_100g !== undefined">
                <q-item-section>Proteins</q-item-section>
                <q-item-section side>{{ productData.product.nutriments.proteins_100g }}g</q-item-section>
              </q-item>
              <q-item v-if="productData.product.nutriments.carbohydrates_100g !== undefined">
                <q-item-section>Carbohydrates</q-item-section>
                <q-item-section side>{{ productData.product.nutriments.carbohydrates_100g }}g</q-item-section>
              </q-item>
              <q-item v-if="productData.product.nutriments.fat_100g !== undefined">
                <q-item-section>Fat</q-item-section>
                <q-item-section side>{{ productData.product.nutriments.fat_100g }}g</q-item-section>
              </q-item>
              <q-item v-if="productData.product.nutriments.salt_100g !== undefined">
                <q-item-section>Salt</q-item-section>
                <q-item-section side>{{ productData.product.nutriments.salt_100g }}g</q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { scan, Format } from '@tauri-apps/plugin-barcode-scanner';
import { Notify } from 'quasar';

// Types for OpenFoodFacts API response
interface Product {
  product_name: string;
  brands?: string;
  image_url?: string;
  nutriscore_grade?: string;
  ingredients_text?: string;
  nutriments?: {
    energy_100g?: number;
    energy_unit?: string;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    salt_100g?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

interface OpenFoodFactsResponse {
  status: number;
  product?: Product;
  status_verbose?: string;
  code?: string;
}

export default defineComponent({
  name: 'BarcodeScanner',

  setup() {
    const isScanning = ref(false);
    const lastScan = ref('');

    const showProductDialog = ref(false);
    const productData = ref<OpenFoodFactsResponse | null>(null);
    const isLoadingProduct = ref(false);
    const productError = ref('');

    // Start barcode scanning
    const startScan = async () => {
      if (isScanning.value) return;

      try {
        isScanning.value = true;

        // Using the Tauri barcode scanner plugin as per the documentation
        const result = await scan({
          windowed: true,
          formats: [
            Format.QRCode,
            Format.EAN13,
            Format.EAN8,
            Format.Code39,
            Format.Code128
          ]
        });

        // Handle the scan result
        if (result) {
          lastScan.value = result.content;
          await fetchProductInfo(result.content);
        }
      } catch (error) {
        console.error('Error during scanning:', error);
        Notify.create({
          type: 'negative',
          message: 'Failed to start the scanner. Please check camera permissions.'
        });
      } finally {
        isScanning.value = false;
      }
    };

    // Fetch product information from OpenFoodFacts API
    const fetchProductInfo = async (barcode: string) => {
      isLoadingProduct.value = true;
      productError.value = '';
      productData.value = null;
      showProductDialog.value = true;

      try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json() as OpenFoodFactsResponse;
        productData.value = data;
      } catch (error) {
        console.error('Error fetching product info:', error);
        productError.value = error instanceof Error ? error.message : 'Unknown error';
      } finally {
        isLoadingProduct.value = false;
      }
    };

    // Get color for nutriscore badge
    const getNutriscoreColor = (grade: string): string => {
      const gradeMap: Record<string, string> = {
        'a': 'green',
        'b': 'light-green',
        'c': 'yellow',
        'd': 'orange',
        'e': 'red'
      };

      return gradeMap[grade.toLowerCase()] || 'grey';
    };

    return {
      isScanning,
      lastScan,
      showProductDialog,
      productData,
      isLoadingProduct,
      productError,
      startScan,
      getNutriscoreColor
    };
  }
});
</script>