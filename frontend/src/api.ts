import type {
    Client, ClientCreate,
    Product, ProductCreate,
    Order, OrderCreate,
    OrderListItem,
} from "./types";
  
  const BASE = "/api";
  
  async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${url}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Помилка сервера" }));
      throw new Error(typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail));
    }
  
    if (res.status === 204) return null as T;
    return res.json();
  }
  
  // Clients
  export const getClients = () => request<Client[]>("/clients/");
  export const createClient = (data: ClientCreate) =>
    request<Client>("/clients/", { method: "POST", body: JSON.stringify(data) });
  export const deleteClient = (id: string) =>
    request<null>(`/clients/${id}`, { method: "DELETE" });
  
  // Products
  export const getProducts = () => request<Product[]>("/products/");
  export const createProduct = (data: ProductCreate) =>
    request<Product>("/products/", { method: "POST", body: JSON.stringify(data) });
  export const deleteProduct = (id: string) =>
    request<null>(`/products/${id}`, { method: "DELETE" });
  
  // Orders
  export const createOrder = (data: OrderCreate) =>
    request<Order>("/orders/", { method: "POST", body: JSON.stringify(data) });
  export const getOrdersByClient = (clientId: string) =>
    request<OrderListItem[]>(`/orders/client/${clientId}`);