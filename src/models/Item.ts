
export class Item {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
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

export const randomItems = [
  new Item("6378763232", "Butter"),
  new Item("3573563456", "Idun Ketchup"),
  new Item("3563563563", "Milk"),
  new Item("2678562343", "Eggs"),
  new Item("5844456884", "Salami"),
  new Item("4245688523", "Ham"),
  new Item("2336888888", "Strawberry Jam"),
  new Item("3232323323", "Raspberry Jam"),
]

export const randomItemsMap = new Map([
  ["6378763232", new Item("6378763232", "Butter")],
  ["3573563456", new Item("3573563456", "Idun Ketchup")],
  ["3563563563", new Item("3563563563", "Milk")],
  ["2678562343", new Item("2678562343", "Eggs")],
  ["5844456884", new Item("5844456884", "Salami")],
  ["4245688523", new Item("4245688523", "Ham")],
  ["2336888888", new Item("2336888888", "Strawberry Jam")],
  ["3232323323", new Item("3232323323", "Raspberry Jam")]
]);