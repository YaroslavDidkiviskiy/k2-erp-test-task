import * as api from "./api";
import type { Product } from "./types";

export function renderApp(): void {
  const app = document.getElementById("app")!;
  app.innerHTML = `
    <header>
      <h1>ERP Orders</h1>
      <nav>
        <button class="tab-btn active" data-tab="clients">Клієнти</button>
        <button class="tab-btn" data-tab="products">Товари</button>
        <button class="tab-btn" data-tab="orders">Замовлення</button>
      </nav>
    </header>
    <main>
      <div id="tab-clients" class="tab active"></div>
      <div id="tab-products" class="tab"></div>
      <div id="tab-orders" class="tab"></div>
    </main>
    <div id="toast"></div>
  `;

  setupTabs();
  renderClients();
  renderProducts();
  renderOrders();
}

function setupTabs(): void {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      btn.classList.add("active");
      const tab = (btn as HTMLElement).dataset.tab!;
      document.getElementById(`tab-${tab}`)!.classList.add("active");
    });
  });
}

function showToast(msg: string, error = false): void {
  const toast = document.getElementById("toast")!;
  toast.textContent = msg;
  toast.className = error ? "error" : "success";
  setTimeout(() => (toast.className = ""), 3000);
}

// ── CLIENTS ──────────────────────────────────────────────────────────────────

function renderClients(): void {
  const el = document.getElementById("tab-clients")!;
  el.innerHTML = `
    <section>
      <h2>Новий клієнт</h2>
      <form id="client-form">
        <input name="name" placeholder="Ім'я" required />
        <input name="email" type="email" placeholder="Email" required />
        <input name="phone" placeholder="+380991234567" maxlength="20" />
        <button type="submit">Створити</button>
      </form>
    </section>
    <section>
      <h2>Клієнти</h2>
      <div id="clients-list">Завантаження...</div>
    </section>
  `;

  loadClients();

  document.getElementById("client-form")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    try {
      await api.createClient({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
      });
      form.reset();
      showToast("Клієнта створено");
      loadClients();
    } catch (err) {
      showToast((err as Error).message, true);
    }
  });
}

async function loadClients(): Promise<void> {
  const el = document.getElementById("clients-list")!;
  try {
    const clients = await api.getClients();
    if (!clients.length) {
      el.innerHTML = "<p>Клієнтів ще немає</p>";
      return;
    }
    el.innerHTML = `
      <table>
        <thead><tr><th>Ім'я</th><th>Email</th><th>Телефон</th><th></th></tr></thead>
        <tbody>
          ${clients.map((c) => `
            <tr>
              <td>${c.name}</td>
              <td>${c.email}</td>
              <td>${c.phone ?? "—"}</td>
              <td><button class="btn-delete" data-id="${c.id}">Видалити</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    el.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = (btn as HTMLElement).dataset.id!;
        try {
          await api.deleteClient(id);
          showToast("Клієнта видалено");
          loadClients();
        } catch (err) {
          showToast((err as Error).message, true);
        }
      });
    });
  } catch {
    el.innerHTML = "<p>Помилка завантаження</p>";
  }
}

// ── PRODUCTS ─────────────────────────────────────────────────────────────────

function renderProducts(): void {
  const el = document.getElementById("tab-products")!;
  el.innerHTML = `
    <section>
      <h2>Новий товар</h2>
      <form id="product-form">
        <input name="name" placeholder="Назва" required />
        <input name="description" placeholder="Опис (необов'язково)" />
        <input name="price" type="number" step="0.01" min="0.01" placeholder="Ціна" required />
        <button type="submit">Створити</button>
      </form>
    </section>
    <section>
      <h2>Товари</h2>
      <div id="products-list">Завантаження...</div>
    </section>
  `;

  loadProducts();

  document.getElementById("product-form")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    try {
      await api.createProduct({
        name: data.name,
        description: data.description || undefined,
        price: parseFloat(data.price),
      });
      form.reset();
      showToast("Товар створено");
      loadProducts();
    } catch (err) {
      showToast((err as Error).message, true);
    }
  });
}

async function loadProducts(): Promise<void> {
  const el = document.getElementById("products-list")!;
  try {
    const products = await api.getProducts();
    if (!products.length) {
      el.innerHTML = "<p>Товарів ще немає</p>";
      return;
    }
    el.innerHTML = `
      <table>
        <thead><tr><th>Назва</th><th>Опис</th><th>Ціна</th><th></th></tr></thead>
        <tbody>
          ${products.map((p) => `
            <tr>
              <td>${p.name}</td>
              <td>${p.description ?? "—"}</td>
              <td>${parseFloat(p.price).toFixed(2)} ₴</td>
              <td><button class="btn-delete" data-id="${p.id}">Видалити</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    el.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = (btn as HTMLElement).dataset.id!;
        try {
          await api.deleteProduct(id);
          showToast("Товар видалено");
          loadProducts();
        } catch (err) {
          showToast((err as Error).message, true);
        }
      });
    });
  } catch {
    el.innerHTML = "<p>Помилка завантаження</p>";
  }
}

// ── ORDERS ───────────────────────────────────────────────────────────────────

let selectedProducts: { product: Product; quantity: number }[] = [];

function renderOrders(): void {
  const el = document.getElementById("tab-orders")!;
  el.innerHTML = `
    <section>
      <h2>Нове замовлення</h2>
      <form id="order-form">
        <select name="client_id" required>
          <option value="">Оберіть клієнта</option>
        </select>
        <div id="product-selector">
          <select id="product-select">
            <option value="">Оберіть товар</option>
          </select>
          <input id="product-qty" type="number" min="1" value="1" placeholder="Кількість" />
          <button type="button" id="add-product-btn">Додати товар</button>
        </div>
        <div id="selected-products"></div>
        <input name="comment" placeholder="Коментар (необов'язково)" />
        <button type="submit">Створити замовлення</button>
      </form>
    </section>
    <section>
      <h2>Замовлення по клієнту</h2>
      <div id="orders-client-selector">
        <select id="orders-client-select">
          <option value="">Оберіть клієнта</option>
        </select>
        <button id="load-orders-btn">Показати</button>
      </div>
      <div id="orders-list"></div>
    </section>
  `;

  selectedProducts = [];
  loadOrderFormData();

  document.getElementById("add-product-btn")!.addEventListener("click", () => {
    const select = document.getElementById("product-select") as HTMLSelectElement;
    const qtyInput = document.getElementById("product-qty") as HTMLInputElement;
    const id = select.value;
    const name = select.options[select.selectedIndex]?.text;
    const qty = parseInt(qtyInput.value);
    if (!id || qty < 1) return;

    const existing = selectedProducts.find((p) => p.product.id === id);
    if (existing) {
      existing.quantity += qty;
    } else {
      const price = select.options[select.selectedIndex].dataset.price!;
      selectedProducts.push({ product: { id, name, price } as Product, quantity: qty });
    }
    renderSelectedProducts();
  });

  document.getElementById("order-form")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    if (!selectedProducts.length) {
      showToast("Додайте хоча б один товар", true);
      return;
    }

    try {
      const order = await api.createOrder({
        client_id: data.client_id,
        items: selectedProducts.map((p) => ({ product_id: p.product.id, quantity: p.quantity })),
        comment: data.comment || undefined,
      });
      selectedProducts = [];
      renderSelectedProducts();
      form.reset();
      showToast(`Замовлення створено. Сума: ${parseFloat(order.total_amount).toFixed(2)} ₴`);
    } catch (err) {
      showToast((err as Error).message, true);
    }
  });

  document.getElementById("load-orders-btn")!.addEventListener("click", async () => {
    const select = document.getElementById("orders-client-select") as HTMLSelectElement;
    const clientId = select.value;
    if (!clientId) return;
    const el = document.getElementById("orders-list")!;
    try {
      const orders = await api.getOrdersByClient(clientId);
      if (!orders.length) {
        el.innerHTML = "<p>Замовлень ще немає</p>";
        return;
      }
      el.innerHTML = `
        <table>
          <thead><tr><th>ID</th><th>Сума</th><th>Коментар</th><th>Дата</th></tr></thead>
          <tbody>
            ${orders.map((o) => `
              <tr>
                <td>${o.id.slice(0, 8)}...</td>
                <td>${parseFloat(o.total_amount).toFixed(2)} ₴</td>
                <td>${o.comment ?? "—"}</td>
                <td>${new Date(o.created_at).toLocaleDateString("uk-UA")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } catch (err) {
      showToast((err as Error).message, true);
    }
  });
}

async function loadOrderFormData(): Promise<void> {
  const [clients, products] = await Promise.all([api.getClients(), api.getProducts()]);

  const clientSelect = document.querySelector<HTMLSelectElement>("#order-form select[name=client_id]")!;
  clients.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    clientSelect.appendChild(opt);
  });

  const productSelect = document.getElementById("product-select") as HTMLSelectElement;
  products.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.name} — ${parseFloat(p.price).toFixed(2)} ₴`;
    opt.dataset.price = p.price;
    productSelect.appendChild(opt);
  });

  const ordersClientSelect = document.getElementById("orders-client-select") as HTMLSelectElement;
  clients.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    ordersClientSelect.appendChild(opt);
  });
}

function renderSelectedProducts(): void {
  const el = document.getElementById("selected-products")!;
  if (!selectedProducts.length) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = `
    <ul>
      ${selectedProducts.map((p, i) => `
        <li>
          ${p.product.name} × ${p.quantity}
          <button type="button" class="btn-remove" data-index="${i}">✕</button>
        </li>
      `).join("")}
    </ul>
  `;
  el.querySelectorAll(".btn-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt((btn as HTMLElement).dataset.index!);
      selectedProducts.splice(idx, 1);
      renderSelectedProducts();
    });
  });
}