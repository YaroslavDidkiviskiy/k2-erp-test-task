export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    created_at: string;
}
  
export interface Product {
    id: string;
    name: string;
    description: string | null;
    price: string;
    created_at: string;
}
  
export interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: string;
}
  
export interface Order {
    id: string;
    client_id: string;
    client: Client;
    items: OrderItem[];
    total_amount: string;
    comment: string | null;
    created_at: string;
}
  
export interface OrderListItem {
    id: string;
    client_id: string;
    total_amount: string;
    comment: string | null;
    created_at: string;
}
  
export interface ClientCreate {
    name: string;
    email: string;
    phone?: string;
}
  
export interface ProductCreate {
    name: string;
    description?: string;
    price: number;
}
  
export interface OrderCreate {
    client_id: string;
    items: { product_id: string; quantity: number }[];
    comment?: string;
}
