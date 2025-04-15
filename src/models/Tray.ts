import {SlotType, TraySlot} from "@/models/TraySlot.ts";
import {ExpirySource, StoredItem} from "@/models/StoredItem.ts";
import {uid} from "quasar";

export enum TraySize {
  Norm3x3, // 9 slots
  Norm4x4, // 16 slots
  Norm5x5, // 25 slots
  Vegetables5x5, // 23 slots
}

export const slotCountMap = {
  [TraySize.Norm3x3]: 9,
  [TraySize.Norm4x4]: 16,
  [TraySize.Norm5x5]: 25,
  [TraySize.Vegetables5x5]: 23,
};

export class Tray {
  // id is part of what is scanned on tray
  id: string;
  size: TraySize;
  slots: TraySlot[];

  constructor(id: string, size: TraySize, slotCount: number, slots?: TraySlot[]) {
    this.id = id;
    this.size = size;
    if (slots) {
      this.slots = slots;
    } else {
      this.slots = Array.from({ length: slotCount }, () => new TraySlot(SlotType.Square));
    }
  }

  get capacity(): number {
    return slotCountMap[this.size] ?? 0;
  }
}

export class TrayFactory {
  // Creates a mock tray with random id
  static createTray(size: TraySize, slots?: TraySlot[]): Tray {
    const slotCount = slotCountMap[size];
    if (slotCount === undefined) {
      throw new Error(`Invalid tray size: ${size}`);
    }
    const id = uid();

    return new Tray(id, size, slotCount, slots);
  }
  // Adds tray into system with provided ID
  static importTray(id: string, size: TraySize, slots?: TraySlot[]): Tray {
    const slotCountMap = {
      [TraySize.Norm3x3]: 9,
      [TraySize.Norm4x4]: 16,
      [TraySize.Norm5x5]: 25,
      [TraySize.Vegetables5x5]: 23,
    };

    const slotCount = slotCountMap[size];
    if (slotCount === undefined) {
      throw new Error(`Invalid tray size: ${size}`);
    }

    return new Tray(id, size, slotCount, slots);
  }
}

// Example data

let traySlots = []
const items: (null | StoredItem)[] = [
  null,
  new StoredItem('0', 'melk', 1.5, { source: ExpirySource.Scanned, date: new Date('2023-10-25') }),
  null,
  new StoredItem('1', 'egg', 0.5, { source: ExpirySource.Estimated, date: new Date('2023-11-01') }),
  new StoredItem('2', 'smør', 0.25),
  null,
  new StoredItem('3', 'ost', 0.3, { source: ExpirySource.Scanned, date: new Date('2023-11-10') }),
  new StoredItem('4', 'yoghurt', 0.4, { source: ExpirySource.Scanned, date: new Date('2023-10-28') }),
  new StoredItem('5', 'brød', 0.8, { source: ExpirySource.Estimated, date: new Date('2023-10-27') }),
  null,
  new StoredItem('6', 'ketchup', 0.5),
  null,
  new StoredItem('7', 'saus', 0.3),
  new StoredItem('8', 'grønnsaker', 1.2, { source: ExpirySource.Estimated, date: new Date('2023-10-30') }),
  new StoredItem('9', 'frukt', 1.0, { source: ExpirySource.Estimated, date: new Date('2023-10-29') }),
];
for (let i = 0; i < 16; i++) {
  traySlots[i] = new TraySlot(SlotType.Square,
    items[i] ?? undefined
    );
}

export const installedTrays = [
  TrayFactory.createTray(TraySize.Norm4x4, traySlots),
  TrayFactory.createTray(TraySize.Vegetables5x5),
];