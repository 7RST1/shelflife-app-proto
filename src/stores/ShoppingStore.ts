import {defineStore} from "pinia";
import {ref} from "vue";
import {Tray} from "@/models/Tray.ts";

// Assignment interface
export interface TrayAssignment {
    trayId: string;
    userId: string | null;
}

export const useShoppingStore = defineStore('shopping', () => {
    const trayAssignments = ref<TrayAssignment[]>([]);
    const addedTrays = ref(new Map<string,Tray>());

    const clear = () => {
        trayAssignments.value = [];
        addedTrays.value.clear();
    };

    return { trayAssignments, addedTrays, clear }
})