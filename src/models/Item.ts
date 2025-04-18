export class Item {
  id: string;
  name: string;
  brands?: string;
  image_url?: string;
  nutriscore_grade?: string;
  ingredients_text?: string;
  nutriments?: {
    energy_100g?: number;
    energy_unit?: string;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    salt_100g?: number;
    [key: string]: any;
  };
  [key: string]: any;

  constructor(
    id: string,
    name: string,
    options: {
      brands?: string;
      image_url?: string;
      nutriscore_grade?: string;
      ingredients_text?: string;
      nutriments?: {
        energy_100g?: number;
        energy_unit?: string;
        proteins_100g?: number;
        carbohydrates_100g?: number;
        fat_100g?: number;
        salt_100g?: number;
        [key: string]: any;
      };
      [key: string]: any;
    } = {}
  ) {
    this.id = id;
    this.name = name;
    this.brands = options.brands;
    this.image_url = options.image_url;
    this.nutriscore_grade = options.nutriscore_grade;
    this.ingredients_text = options.ingredients_text;
    this.nutriments = options.nutriments;

    // Copy any additional properties
    Object.keys(options).forEach(key => {
      if (!['brands', 'image_url', 'nutriscore_grade', 'ingredients_text', 'nutriments'].includes(key)) {
        this[key] = options[key];
      }
    });
  }

  get icon(): string {
    if (this.name.toLowerCase().includes('melk') || this.name.toLowerCase().includes('milk')) {
      return 'sym_r_water_full'
    } else if (this.name.toLowerCase().includes('egg')) {
      return 'sym_r_egg'
    } else if (
      this.name.toLowerCase().includes('frukt') ||
      this.name.toLowerCase().includes('jam') ||
      this.name.toLowerCase().includes('berry')
    ) {
      return 'sym_r_nutrition'
    }
    return 'sym_r_grocery';
  }

  // Factory method to create an Item from OpenFoodFactsResponse
  static fromOpenFoodFactsResponse(response: {
    status: number;
    product?: {
      product_name: string;
      brands?: string;
      image_url?: string;
      nutriscore_grade?: string;
      ingredients_text?: string;
      nutriments?: {
        energy_100g?: number;
        energy_unit?: string;
        proteins_100g?: number;
        carbohydrates_100g?: number;
        fat_100g?: number;
        salt_100g?: number;
        [key: string]: any;
      };
      [key: string]: any;
    };
    status_verbose?: string;
    code?: string;
  }): Item | null {
    if (response.status !== 1 || !response.product || !response.code) {
      return null;
    }

    return new Item(
      response.code,
      response.product.product_name,
      {
        brands: response.product.brands,
        image_url: response.product.image_url,
        nutriscore_grade: response.product.nutriscore_grade,
        ingredients_text: response.product.ingredients_text,
        nutriments: response.product.nutriments
      }
    );
  }
}

export const randomItems = [
  new Item("7038010002151", "Skummet Melk", {
    brands: "Tine",
    nutriscore_grade: "D",
    nutriments: { fat_100g: 81, proteins_100g: 0.6, salt_100g: 0.1 }
  }),
  new Item("7039010081337", "Tomatketchup", {
    brands: "Idun",
    nutriscore_grade: "C",
    ingredients_text: "Tomatoes, sugar, vinegar, salt, spices"
  }),
  new Item("7036110210889", "Smør", {
    brands: "Olivero",
    nutriscore_grade: "A",
    nutriments: { fat_100g: 3.5, proteins_100g: 3.4, carbohydrates_100g: 4.7 }
  }),
  new Item("7039610006730", "Økologiske egg", {
    brands: "Prior",
    nutriscore_grade: "A"
  }),
  new Item("7037204192128", "Salami", {
    brands: "Gilde",
    nutriscore_grade: "D",
    nutriments: { fat_100g: 45, proteins_100g: 15, salt_100g: 3.0 }
  }),
  new Item("7037204742323", "Ham", {
    brands: "Gilde",
    nutriscore_grade: "C",
    nutriments: { fat_100g: 3, proteins_100g: 18, salt_100g: 2.0 }
  }),
  new Item("7039010599467", "Jordbærsyltetøy", {
    brands: "Nora",
    nutriscore_grade: "C",
    ingredients_text: "Strawberries, sugar, pectin"
  }),
  new Item("7070841001767", "Bringebærsyltetøy", {
    brands: "Lerum",
    nutriscore_grade: "C",
    ingredients_text: "Raspberries, sugar, pectin"
  }),
];

export const randomItemsMap = new Map(
  randomItems.map(item => [item.id, item])
);