import productsCatalog from '../data/products.json';
import type { Category } from '../types/ShoppingItem';
import type { VoiceCommand } from '../types/voice';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: Category;
  tags: string[];
}

export const PRODUCTS_CATALOG: Product[] = productsCatalog.products as Product[];

/**
 * Searches and filters the product catalog based on parsed voice command attributes:
 * item name keyword, brand, maxPrice, minPrice, and tags.
 */
export function searchProducts(command: VoiceCommand): Product[] {
  let results = [...PRODUCTS_CATALOG];

  const itemNorm = (command.item || '').toLowerCase().trim();

  // 1. Filter by Item Name / Category keyword
  if (itemNorm) {
    results = results.filter((p) => {
      const nameLower = p.name.toLowerCase();
      const brandLower = p.brand.toLowerCase();
      const catLower = p.category.toLowerCase();
      return (
        nameLower.includes(itemNorm) ||
        itemNorm.includes(nameLower) ||
        brandLower.includes(itemNorm) ||
        catLower.includes(itemNorm)
      );
    });
  }

  // 2. Filter by Brand if specified
  if (command.brand) {
    const brandNorm = command.brand.toLowerCase();
    results = results.filter((p) => p.brand.toLowerCase().includes(brandNorm));
  }

  // 3. Filter by Max Price
  if (command.maxPrice !== undefined) {
    results = results.filter((p) => p.price <= command.maxPrice!);
  }

  // 4. Filter by Min Price
  if (command.minPrice !== undefined) {
    results = results.filter((p) => p.price >= command.minPrice!);
  }

  // 5. Filter by Tags (e.g. 'organic')
  if (command.tags && command.tags.length > 0) {
    results = results.filter((p) =>
      command.tags!.every(
        (tag) =>
          p.tags.some((t) => t.toLowerCase() === tag.toLowerCase()) ||
          p.name.toLowerCase().includes(tag.toLowerCase())
      )
    );
  }

  return results;
}
