import {defineStore} from "pinia";
import {Product} from "@/models/ItemScanning.ts";
import {ref} from "vue";

export const useItemScanningStore = defineStore('itemScanning', () => {
    const addedProducts  = ref<Map<string, [amount: number, product: Product]>>(new Map());

    return { addedProducts }
})