import {defineStore} from "pinia";
import {ref} from "vue";
import {Tray} from "@/models/Tray.ts";

// Assignment interface
interface TrayAssignment {
    trayId: string;
    userId: string | null;
}

export const useShoppingStore = defineStore('shopping', () => {
    const trayAssignments = ref<TrayAssignment[]>([]);
    const addedTrays = ref<Tray[]>([]);

    const clear = () => {
        trayAssignments.value = [];
        addedTrays.value = [];
    };

    return { trayAssignments, addedTrays, clear }
})