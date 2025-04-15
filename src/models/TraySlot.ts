import {StoredItem} from "@/models/StoredItem.ts";

export enum SlotStatus {
  Empty,
  OK,
  Warning,
  Bad,
}

export enum SlotType {
  Square,
  LongVegetable,
}


export class TraySlot  {
  holding?: StoredItem;
  type: SlotType;

  constructor(type: SlotType, holding?: StoredItem) {
    this.holding = holding;
    this.type = type;
  }

  get status(): SlotStatus {
    if (this.holding == null) {
      return SlotStatus.Empty
    }
    if (this.holding.expiry == null) {
      return SlotStatus.OK;
    }

    if (this.holding.expiry.date.getTime() < Date.now()) {
      return SlotStatus.Bad;
    } else if (this.holding.expiry.date.getTime() + 1000*60*60*24*2 < Date.now()) {
      return SlotStatus.Warning;
    }

    return SlotStatus.OK;
  }
}