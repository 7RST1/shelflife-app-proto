import {Item} from "@/models/Item.ts";

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
  holding?: Item;
  type: SlotType;

  constructor(type: SlotType, holding?: Item) {
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
    } else if (this.holding.expiry.date.getTime() + 600000 < Date.now()) {
      return SlotStatus.Warning;
    }

    return SlotStatus.OK;
  }
}