export interface Setting {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  default: string | number | boolean; // Updated default to be more specific
  options?: string[]; // only for select
}

export interface Category {
  categoryName: string;
  settings: Setting[];
}
