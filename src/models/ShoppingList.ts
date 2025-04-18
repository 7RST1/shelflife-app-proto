// Shopping list associated with each user

import {Item, randomItems} from "@/models/Item.ts";

interface ShoppingListing {
  item: Item | string;
  amount: number;
}

export interface ShoppingList {
  listings: ShoppingListing[];
  owner: string;
};

export const shoppingListsT: ShoppingList[] = [
  {
    owner: "1",
    listings: [
      { item: randomItems[2], amount: 1 },
      { item: randomItems[0], amount: 2 },
    ]
  },
  {
    owner: "2",
    listings: [
      { item: randomItems[0], amount: 1 },
      { item: "Kaviar", amount: 2 },
    ]
  },
  {
    owner: "3",
    listings: [
      { item: randomItems[0], amount: 1 },
      { item: randomItems[2], amount: 4 },
      { item: randomItems[3], amount: 4 },
      { item: "Helmelk", amount: 1 },
      { item: "Smør", amount: 1 },
    ]
  },
  {
    owner: "4",
    listings: [
      { item: randomItems[1], amount: 1 },
      { item: randomItems[2], amount: 1 },
    ]
  },
  {
    owner: "5",
    listings: [
      { item: randomItems[1], amount: 1 },
      { item: randomItems[2], amount: 2 },
      { item: randomItems[4], amount: 1 },
    ]
  }
]