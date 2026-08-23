export type Category =
  | 'Dairy'
  | 'Produce'
  | 'Bakery'
  | 'Snacks'
  | 'Beverages'
  | 'Household'
  | 'Other';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  category: Category;
  addedAt: string;
  purchased: boolean;
}
