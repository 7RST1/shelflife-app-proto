import {SlotType, TraySlot} from "@/models/TraySlot.ts";
import {ExpirySource, Item} from "@/models/Item.ts";

export enum TraySize {
  Norm3x3, // 9 slots
  Norm4x4, // 16 slots
  Norm5x5, // 25 slots
  Vegetables5x5, // 23 slots
}

export class Tray {
  size: TraySize;
  slots: TraySlot[];

  constructor(size: TraySize, slotCount: number, slots?: TraySlot[]) {
    this.size = size;
    if (slots) {
      this.slots = slots;
    } else {
      this.slots = Array.from({ length: slotCount }, () => new TraySlot(SlotType.Square));
    }
  }
}

export class TrayFactory {
  static createTray(size: TraySize, slots?: TraySlot[]): Tray {
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

    return new Tray(size, slotCount, slots);
  }
}

// Example data

let traySlots = []
const items: (null | Item)[] = [
  null,
  new Item('0', 'melk', 1.5, { source: ExpirySource.Scanned, date: new Date('2023-10-25') }),
  null,
  new Item('1', 'egg', 0.5, { source: ExpirySource.Estimated, date: new Date('2023-11-01') }),
  new Item('2', 'smør', 0.25),
  null,
  new Item('3', 'ost', 0.3, { source: ExpirySource.Scanned, date: new Date('2023-11-10') }),
  new Item('4', 'yoghurt', 0.4, { source: ExpirySource.Scanned, date: new Date('2023-10-28') }),
  new Item('5', 'brød', 0.8, { source: ExpirySource.Estimated, date: new Date('2023-10-27') }),
  null,
  new Item('6', 'ketchup', 0.5),
  null,
  new Item('7', 'saus', 0.3),
  new Item('8', 'grønnsaker', 1.2, { source: ExpirySource.Estimated, date: new Date('2023-10-30') }),
  new Item('9', 'frukt', 1.0, { source: ExpirySource.Estimated, date: new Date('2023-10-29') }),
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