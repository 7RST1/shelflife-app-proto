import {defineStore} from "pinia";
import {ref} from "vue";
import {Tray} from "@/models/Tray.ts";

export const useScanningStore = defineStore('scanning', () => {
    const isScanning = ref<boolean>(false);

    const clear = () => {
        isScanning.value = false;
    };

    return { isScanning, clear }
})