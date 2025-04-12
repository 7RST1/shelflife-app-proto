// Types for OpenFoodFacts API response
export interface Product {
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
}

export interface OpenFoodFactsResponse {
    status: number;
    product?: Product;
    status_verbose?: string;
    code?: string;
}