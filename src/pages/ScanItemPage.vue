<script setup lang="ts">
import { ref} from 'vue';
import { scan, Format } from '@tauri-apps/plugin-barcode-scanner';
import { Notify } from 'quasar';
import {Platform, platform} from '@tauri-apps/plugin-os';
import {OpenFoodFactsResponse, Product} from "@/models/ItemScanning.ts";
import Header from "@/components/Header.vue";
import {useItemScanningStore} from "@/stores/itemScanning.ts";
import {storeToRefs} from "pinia";

enum FlowStatus {
  BeforeScan,
  ItemScanMobile,
  ItemScanBrowser,
  ItemScanDone
}

const store = useItemScanningStore()

const { addedProducts } = storeToRefs(store)

const flowStatus = ref<FlowStatus>(FlowStatus.BeforeScan);

const lastScan = ref('');

const showItemInputDialog = ref(false);

// Scanned product dialog instance
const showProductDialog = ref(false);
const productData = ref<OpenFoodFactsResponse | null>(null);
const isLoadingProduct = ref(false);
const productError = ref('');
const amountToAdd = ref(1);

const barcodeManual = ref('');

// Start barcode scanning
const startScan = async () => {
  if (flowStatus.value == FlowStatus.ItemScanMobile || flowStatus.value == FlowStatus.ItemScanBrowser) return;

  try {

    const currentPlatform: Platform = platform();
    if (currentPlatform == 'android' || currentPlatform == 'ios') {
      flowStatus.value = FlowStatus.ItemScanMobile;
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
        flowStatus.value = FlowStatus.ItemScanDone;
      }
    } else {
      // We are in browser
      flowStatus.value = FlowStatus.ItemScanBrowser;
      showItemInputDialog.value = true;
    }

  } catch (error) {
    console.error('Error during scanning:', error);
    Notify.create({
      type: 'negative',
      message: 'Failed to start the scanner. Please check camera permissions.'
    });
  } finally {
    flowStatus.value = FlowStatus.ItemScanDone;
  }
};

// Fetch product information from OpenFoodFacts API
const fetchProductInfo = async (barcode: string) => {
  isLoadingProduct.value = true;
  productError.value = '';
  productData.value = null;
  showProductDialog.value = true;

  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v3/product/${barcode}.json`);

    if (!response.ok) {
      if (response.status == 404) {
        //handle normally
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    console.log(response.status);
    console.log(response.body);

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

const submitManual = async () => {
  await fetchProductInfo(barcodeManual.value);
  flowStatus.value = FlowStatus.ItemScanDone;
  showItemInputDialog.value = false;
};

const addShownProduct = () => {
  if (!productData.value?.product || amountToAdd.value == 0 || !productData.value.code) return;
  addedProducts.value.set(productData.value.code,[amountToAdd.value,productData.value.product]);
}
</script>

<template>
  <Header title="Handletur" />
  <div class="column items-center">

    <div class="full-width">
      <div v-for="[code, listing] of addedProducts" class="row product-row items-center justify-between q-pa-md no-wrap" :class="{strike: listing[0] == 0}" :key="code">
        <q-img
            :src="listing[1].image_url"
            style="height: 4rem; max-width: 2rem;"
            fit="contain"
        />
        <div class="product-name">{{listing[1].product_name}}</div>
        <div class="row items-center product-amount-control" style="flex-shrink: 0">
          <q-btn round icon="sym_r_remove" dense flat @click="listing[0] > 0 ? listing[0]-- : null" />
          <div class="q-mx-sm amount-number">{{listing[0]}}</div>
          <q-btn round icon="sym_r_add" dense flat @click="listing[0]++" />
        </div>
      </div>
    </div>

    <div v-if="lastScan" class="q-mt-md text-center">
      <div class="text-body1">Last scanned: {{ lastScan }}</div>
    </div>

    <q-inner-loading :showing="flowStatus == FlowStatus.ItemScanMobile">
      <q-spinner-ios size="50px" color="primary" />
      <div class="q-mt-sm text-body1">Camera is active, scanning...</div>
    </q-inner-loading>
  </div>

  <div class="absolute-bottom-right fab-container">
    <q-btn
        fab
        icon="sym_r_qr_code_scanner"
        label="Skann Varer"
        :loading="flowStatus == FlowStatus.ItemScanMobile || flowStatus == FlowStatus.ItemScanBrowser"
        @click="startScan"
        size="lg"
    />
  </div>

    <!-- Product details dialog -->
    <q-dialog v-model="showProductDialog" persistent>
      <q-card style="min-width: 350px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ productData?.product?.product_name || 'Product Details' }}</div>
          <q-space />
          <q-btn icon="sym_r_close" flat round dense v-close-popup />
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
              <q-icon name="sym_r_error" color="negative" />
            </template>
            Error loading product: {{ productError }}
          </q-banner>
        </q-card-section>

        <q-card-section v-else-if="productData?.status === 0">
          <q-banner class="bg-orange-1">
            <template v-slot:avatar>
              <q-icon name="sym_r_info" color="warning" />
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

        <q-card-actions>
          <q-btn flat label="+1" color="primary" />
          <q-space/>
          <div v-if="amountToAdd > 1">{{amountToAdd}}</div>
          <q-btn flat label="Legg til" color="primary" @click="addShownProduct" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  <q-dialog v-model="showItemInputDialog">
    <q-card>
      <q-card-section>
        <h4>No camera detected</h4>
        <p>Please enter code manually</p>
      </q-card-section>
      <q-card-actions>
        <q-input v-model="barcodeManual"/>
        <q-btn label="Submit" @click="()=>{submitManual()}"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="scss">
.product-row {
  transition: opacity 200ms;
  &.strike {
    opacity: 0.6;

    .product-name {
      text-decoration: line-through;
    }
  }

  .product-amount-control {
    background: rgba(29, 89, 149, 0.17);
    border-radius: 9999px;

    .amount-number {
      width: 20px;
      text-align: center;
    }
  }
}


</style>