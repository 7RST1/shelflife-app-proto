import {Item} from "@/models/Item.ts";

export enum ExpirySource {
  Scanned,
  Estimated
}

type Expiry = {
  source: ExpirySource,
  date: Date;
};

export class StoredItem extends Item {
  weight: number;

  expiry: Expiry | null;
  // used if the original shopping list had this item as generic
  actsAs: string | null;

  constructor(id: string, name: string, weight: number, expiry?: Expiry, actsAs?: string) {
    super(id, name);
    this.weight = weight;
    this.expiry = expiry || null;
    this.actsAs = actsAs || null;
  }

  get icon(): string {
    if (this.name.includes('melk')) {
      return 'sym_r_water_full'
    } else if (this.name.includes('egg')) {
      return 'sym_r_egg'
    } else if (this.name.includes('frukt')) {
      return 'sym_r_nutrition'
    }
    return 'sym_r_grocery';
  }
}