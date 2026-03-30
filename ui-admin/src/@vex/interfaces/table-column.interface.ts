export interface TableColumn<T> {
  label: string;
  property: string;
  parentProperty?: string;
  type: 'text' | 'image' | 'badge' | 'progress' | 'checkbox' | 'button' | 'boolean' | 'date' | 'child' | 'subChild' | 'subProperty' | 'balance';
  visible?: boolean;
  cssClasses?: string[];
}
