"use client";

import { type Dispatch, type FormEvent, type ReactNode, type SetStateAction, useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  Boxes,
  CheckCircle2,
  Edit3,
  Loader2,
  PackagePlus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { catalogProducts } from "@/config/products";
import { CustomSelect } from "@/components/ui/custom-select";
import { createProduct, deleteProduct, getProducts, updateProduct, upsertProduct } from "@/lib/firebase/products";
import { getOrders, updateOrderStatus } from "@/lib/firebase/orders";
import { getUsers, updateUserProfile } from "@/lib/firebase/users";
import { uploadFile } from "@/lib/firebase/storage";
import { cn } from "@/lib/utils";
import { createEmptyProductForm, productFormToInput, type AdminTab, type ProductFormState } from "@/types/admin";
import type { Order, OrderStatus, Product } from "@/types/ecommerce";
import type { UserProfile, UserRole } from "@/types/user";

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products" },
  { id: "orders", label: "Orders" },
  { id: "users", label: "Users" },
  { id: "inventory", label: "Inventory" },
];

const orderFulfillmentStatuses: OrderStatus[] = ["approved", "processing", "shipped", "delivered", "cancelled"];
const orderStatusOptions = orderFulfillmentStatuses.map((status) => ({ label: getOrderStatusLabel(status), value: status }));
const userRoleOptions = [
  { label: "User", value: "user" },
  { label: "Admin", value: "admin" },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [form, setForm] = useState<ProductFormState>(createEmptyProductForm);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState<"success" | "error">("success");

  useEffect(() => {
    void loadAdminData();
  }, []);

  async function loadAdminData() {
    setIsLoading(true);
    setNotice("");
    try {
      const [productsResult, ordersResult, usersResult] = await Promise.allSettled([
        withTimeout(getProducts(), "Products took too long to load."),
        withTimeout(getOrders(), "Orders took too long to load."),
        withTimeout(getUsers(), "Users took too long to load."),
      ]);
      const errors: string[] = [];

      if (productsResult.status === "fulfilled") {
        setProducts(productsResult.value);
      } else {
        errors.push(getAdminErrorMessage(productsResult.reason));
      }

      if (ordersResult.status === "fulfilled") {
        setOrders(ordersResult.value);
      } else {
        errors.push(getAdminErrorMessage(ordersResult.reason));
      }

      if (usersResult.status === "fulfilled") {
        setUsers(usersResult.value);
      } else {
        errors.push(getAdminErrorMessage(usersResult.reason));
      }

      if (errors.length) {
        setNoticeTone("error");
        setNotice(Array.from(new Set(errors)).join(" "));
      }
    } catch (error) {
      setNoticeTone("error");
      setNotice(getAdminErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  const analytics = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + (order.status === "cancelled" ? 0 : order.total), 0);
    const paidOrders = orders.filter((order) => order.status === "paid" || order.status === "delivered").length;
    const lowStock = products.filter((product) => product.stock <= 5).length;
    const inventoryValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);

    return { revenue, paidOrders, lowStock, inventoryValue };
  }, [orders, products]);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return products;
    }

    return products.filter((product) =>
      [product.title, product.brand, product.category].some((value) => value.toLowerCase().includes(term)),
    );
  }, [products, query]);

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setNotice("");

    try {
      const input = productFormToInput(form);

      if (!input.title || !input.brand || !input.category || !input.images.length) {
        throw new Error("Title, brand, category, and image are required.");
      }

      if (!Number.isFinite(input.price) || input.price <= 0) {
        throw new Error("Add a valid product price.");
      }

      if (!Number.isFinite(input.stock) || input.stock < 0) {
        throw new Error("Add a valid stock amount.");
      }

      if (!input.sizes.length) {
        throw new Error("Add at least one product size.");
      }

      if (form.id) {
        await withTimeout(updateProduct(form.id, input), "Product update timed out. Check your admin role and Firestore rules.");
        setNotice("Product updated.");
      } else {
        await withTimeout(createProduct(input), "Product save timed out. Check your admin role and Firestore rules.");
        setNotice("Product added.");
      }

      setNoticeTone("success");
      setForm(createEmptyProductForm());
      try {
        setProducts(await withTimeout(getProducts(), "Product saved, but the catalog refresh timed out."));
      } catch (refreshError) {
        setNoticeTone("error");
        setNotice(`${getAdminErrorMessage(refreshError)} Refresh the dashboard to see the saved product.`);
      }
    } catch (error) {
      setNoticeTone("error");
      setNotice(getAdminErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadProductImage(file: File | null) {
    if (!file) {
      return;
    }

    setIsSaving(true);
    setNotice("");

    try {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
      const result = await withTimeout(
        uploadFile(`products/${Date.now()}-${safeName}`, file, { contentType: file.type }),
        "Image upload timed out. Check your admin role and Storage rules.",
      );
      setForm((current) => ({
        ...current,
        imageUrls: [current.imageUrls, result.url].filter(Boolean).join("\n"),
      }));
      setNoticeTone("success");
      setNotice("Image uploaded.");
    } catch (error) {
      setNoticeTone("error");
      setNotice(getAdminErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function removeProduct(productId?: string) {
    if (!productId) {
      return;
    }

    setIsSaving(true);
    try {
      await withTimeout(deleteProduct(productId), "Product delete timed out. Check your admin role and Firestore rules.");
      setProducts((current) => current.filter((product) => product.id !== productId));
      setNoticeTone("success");
      setNotice("Product deleted.");
    } catch (error) {
      setNoticeTone("error");
      setNotice(getAdminErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function seedStarterProducts() {
    setIsSaving(true);
    setNotice("");

    try {
      await withTimeout(
        Promise.all(
          catalogProducts.map((product) =>
            upsertProduct(product.id, {
              title: product.title,
              description: product.description,
              images: product.images.length ? product.images : [product.imageUrl],
              category: product.category,
              brand: product.brand,
              sizes: product.sizes,
              stock: product.stock,
              price: product.price,
              rating: product.rating,
              featured: product.featured,
            }),
          ),
        ),
        "Starter products took too long to create. Check your admin role and Firestore rules.",
      );

      setProducts(await withTimeout(getProducts(), "Starter products were created, but the catalog refresh timed out."));
      setNoticeTone("success");
      setNotice(`Starter product database created with ${catalogProducts.length} products.`);
    } catch (error) {
      setNoticeTone("error");
      setNotice(getAdminErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function changeOrderStatus(orderId: string | undefined, status: OrderStatus) {
    if (!orderId) {
      return;
    }

    setIsSaving(true);
    try {
      await withTimeout(updateOrderStatus(orderId, status), "Order update timed out. Check your admin role and Firestore rules.");
      setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status } : order)));
      setNoticeTone("success");
      setNotice("Order status updated.");
    } catch (error) {
      setNoticeTone("error");
      setNotice(getAdminErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function changeUserRole(uid: string, role: UserRole) {
    setIsSaving(true);
    try {
      await withTimeout(updateUserProfile(uid, { role }), "User role update timed out. Check your admin role and Firestore rules.");
      setUsers((current) => current.map((user) => (user.uid === uid ? { ...user, role } : user)));
      setNoticeTone("success");
      setNotice("User role updated.");
    } catch (error) {
      setNoticeTone("error");
      setNotice(getAdminErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] pt-24 text-slate-950">
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-lime-700">Admin control room</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Football commerce dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
              Manage products, stock, orders, customers, and payment-driven sales from one responsive admin surface.
            </p>
          </div>
          <button
            onClick={() => void loadAdminData()}
            className="h-11 bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-lime-500 hover:text-slate-950"
          >
            Refresh data
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={<BadgeDollarSign size={21} />} label="Revenue" value={`$${analytics.revenue.toFixed(0)}`} />
          <Metric icon={<ShoppingBag size={21} />} label="Orders" value={orders.length.toString()} />
          <Metric icon={<Boxes size={21} />} label="Inventory value" value={`$${analytics.inventoryValue.toFixed(0)}`} />
          <Metric icon={<ShieldCheck size={21} />} label="Low stock" value={analytics.lowStock.toString()} danger={analytics.lowStock > 0} />
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "h-12 shrink-0 px-4 text-sm font-black transition",
                activeTab === tab.id
                  ? "border-b-2 border-lime-500 text-slate-950"
                  : "text-slate-500 hover:text-slate-950",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {notice ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={cn(
                "mt-5 flex items-start gap-3 border p-4 text-sm font-bold",
                noticeTone === "success" ? "border-lime-300 bg-lime-50 text-lime-800" : "border-red-200 bg-red-50 text-red-700",
              )}
            >
              <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
              <span>{notice}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid min-h-80 place-items-center">
            <Loader2 className="animate-spin text-lime-600" size={28} />
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="mt-6"
          >
            {activeTab === "overview" ? <Overview products={products} orders={orders} users={users} paidOrders={analytics.paidOrders} /> : null}
            {activeTab === "products" ? (
              <ProductsPanel
                form={form}
                setForm={setForm}
                products={filteredProducts}
                query={query}
                setQuery={setQuery}
                isSaving={isSaving}
                submitProduct={submitProduct}
                uploadProductImage={uploadProductImage}
                editProduct={(product) => {
                  setForm({
                    id: product.id,
                    title: product.title,
                    description: product.description,
                    imageUrls: product.images.join("\n"),
                    category: product.category,
                    brand: product.brand,
                    sizes: product.sizes.join(", "),
                    stock: String(product.stock),
                    price: String(product.price),
                    rating: String(product.rating),
                    featured: product.featured,
                  });
                }}
                removeProduct={removeProduct}
                seedStarterProducts={seedStarterProducts}
              />
            ) : null}
            {activeTab === "orders" ? <OrdersPanel orders={orders} changeOrderStatus={changeOrderStatus} /> : null}
            {activeTab === "users" ? <UsersPanel users={users} changeUserRole={changeUserRole} /> : null}
            {activeTab === "inventory" ? <InventoryPanel products={products} /> : null}
          </motion.div>
        )}
      </section>
    </main>
  );
}

function Metric({ icon, label, value, danger = false }: { icon: ReactNode; label: string; value: string; danger?: boolean }) {
  return (
    <article className="border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
      <div className="flex items-center justify-between">
        <span className={cn("grid size-11 place-items-center", danger ? "bg-red-50 text-red-600" : "bg-lime-100 text-slate-950")}>
          {icon}
        </span>
        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
      </div>
      <p className="mt-5 text-3xl font-black">{value}</p>
    </article>
  );
}

function Overview({ products, orders, users, paidOrders }: { products: Product[]; orders: Order[]; users: UserProfile[]; paidOrders: number }) {
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <Panel title="Sales analytics" eyebrow="Performance">
        <div className="grid gap-4 sm:grid-cols-3">
          <MiniStat label="Conversion orders" value={paidOrders.toString()} />
          <MiniStat label="Average order" value={`$${orders.length ? (orders.reduce((sum, order) => sum + order.total, 0) / orders.length).toFixed(0) : 0}`} />
          <MiniStat label="Customers" value={users.length.toString()} />
        </div>
        <div className="mt-6 grid gap-3">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between border border-slate-100 bg-slate-50 p-4">
              <div>
                <p className="text-sm font-black">{order.shippingAddress.name}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{order.items.length} items / {order.status}</p>
              </div>
              <p className="text-sm font-black text-lime-700">${order.total}</p>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Inventory watch" eyebrow="Stock health">
        <div className="grid gap-3">
          {products
            .slice()
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 6)
            .map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-3">
                <span className="line-clamp-1 text-sm font-bold text-slate-700">{product.title}</span>
                <span className={cn("text-sm font-black", product.stock <= 5 ? "text-red-600" : "text-slate-950")}>{product.stock}</span>
              </div>
            ))}
        </div>
      </Panel>
    </div>
  );
}

function ProductsPanel(props: {
  form: ProductFormState;
  setForm: Dispatch<SetStateAction<ProductFormState>>;
  products: Product[];
  query: string;
  setQuery: (value: string) => void;
  isSaving: boolean;
  submitProduct: (event: FormEvent<HTMLFormElement>) => void;
  uploadProductImage: (file: File | null) => void;
  editProduct: (product: Product) => void;
  removeProduct: (productId?: string) => void;
  seedStarterProducts: () => void;
}) {
  const { form, setForm, products, query, setQuery, isSaving, submitProduct, uploadProductImage, editProduct, removeProduct, seedStarterProducts } = props;

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <Panel title={form.id ? "Edit product" : "Add product"} eyebrow="Product manager">
        <form onSubmit={submitProduct} className="grid gap-4">
          <AdminInput label="Title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} />
          <AdminInput label="Brand" value={form.brand} onChange={(value) => setForm((current) => ({ ...current, brand: value }))} />
          <AdminInput label="Category" value={form.category} onChange={(value) => setForm((current) => ({ ...current, category: value }))} />
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Image URLs</span>
            <textarea
              value={form.imageUrls}
              onChange={(event) => setForm((current) => ({ ...current, imageUrls: event.target.value }))}
              placeholder={"Add one image URL per line\n/images/products/front.webp\n/images/products/back.webp\n/images/products/detail.webp"}
              className="min-h-28 border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-950 outline-none focus:border-lime-500"
            />
            <span className="text-xs font-semibold text-slate-500">Use three different image URLs for front, back, and detail gallery images.</span>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Upload image</span>
            <span className="flex h-12 cursor-pointer items-center justify-center gap-2 border border-dashed border-slate-300 bg-slate-50 text-sm font-black text-slate-700 transition hover:border-lime-500 hover:bg-lime-50">
              <Upload size={17} /> Choose product image
              <input type="file" accept="image/*" className="hidden" onChange={(event) => void uploadProductImage(event.target.files?.[0] ?? null)} />
            </span>
          </label>
          <textarea
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Product description"
            className="min-h-28 border border-slate-200 bg-slate-50 p-3 text-sm font-semibold outline-none focus:border-lime-500"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminInput label="Sizes" value={form.sizes} onChange={(value) => setForm((current) => ({ ...current, sizes: value }))} />
            <AdminInput label="Stock" value={form.stock} onChange={(value) => setForm((current) => ({ ...current, stock: value }))} />
            <AdminInput label="Price" value={form.price} onChange={(value) => setForm((current) => ({ ...current, price: value }))} />
            <AdminInput label="Rating" value={form.rating} onChange={(value) => setForm((current) => ({ ...current, rating: value }))} />
          </div>
          <label className="flex items-center gap-3 text-sm font-bold text-slate-700">
            <input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} className="size-4 accent-lime-500" />
            Featured product
          </label>
          <button disabled={isSaving} className="h-12 bg-slate-950 text-sm font-black text-white transition hover:bg-lime-500 hover:text-slate-950 disabled:opacity-50">
            {isSaving ? "Saving product..." : form.id ? "Update product" : "Add product"}
          </button>
        </form>
      </Panel>
      <Panel title="Product catalog" eyebrow="Manage">
        <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="h-12 w-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-bold outline-none focus:border-lime-500" />
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void seedStarterProducts()}
            className="h-12 bg-lime-400 px-4 text-xs font-black uppercase tracking-[0.16em] text-slate-950 transition hover:bg-slate-950 hover:text-white disabled:opacity-50"
          >
            {isSaving ? "Creating..." : "Seed products"}
          </button>
        </div>
        {!products.length ? (
          <div className="mb-4 border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
            Firestore has no product documents yet. Use Seed products or add a product manually.
          </div>
        ) : null}
        <div className="grid gap-3">
          {products.map((product) => (
            <article key={product.id} className="grid gap-4 border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[72px_1fr_auto] sm:items-center">
              <div className="relative aspect-square overflow-hidden bg-white">
                {product.images[0] ? <Image src={product.images[0]} alt={product.title} fill sizes="72px" className="object-cover" /> : null}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{product.brand}</p>
                <h3 className="mt-1 font-black">{product.title}</h3>
                <p className="mt-1 text-xs font-bold text-slate-500">{product.category} / ${product.price} / stock {product.stock}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => editProduct(product)} className="grid size-10 place-items-center bg-white text-slate-700 transition hover:bg-lime-100" aria-label="Edit product">
                  <Edit3 size={17} />
                </button>
                <button onClick={() => void removeProduct(product.id)} className="grid size-10 place-items-center bg-white text-red-600 transition hover:bg-red-50" aria-label="Delete product">
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function OrdersPanel({ orders, changeOrderStatus }: { orders: Order[]; changeOrderStatus: (orderId: string | undefined, status: OrderStatus) => void }) {
  return (
    <Panel title="Manage orders" eyebrow="Fulfillment">
      <div className="grid gap-3">
        {orders.map((order) => (
          <article key={order.id} className="grid gap-4 border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[minmax(0,1fr)_auto_220px] lg:items-center">
            <div>
              <p className="text-sm font-black">{order.shippingAddress.name}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{order.id} / {order.items.length} items / ${order.total}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{order.shippingAddress.email}</p>
            </div>
            <span className={cn("w-fit px-3 py-2 text-xs font-black uppercase tracking-[0.14em]", getOrderStatusClassName(order.status))}>
              {getOrderStatusLabel(order.status)}
            </span>
            <CustomSelect
              label="Update status"
              value={orderFulfillmentStatuses.includes(order.status) ? order.status : ""}
              placeholder="Choose next step"
              options={orderStatusOptions}
              onChange={(value) => changeOrderStatus(order.id, value as OrderStatus)}
            />
          </article>
        ))}
      </div>
    </Panel>
  );
}

function UsersPanel({ users, changeUserRole }: { users: UserProfile[]; changeUserRole: (uid: string, role: UserRole) => void }) {
  return (
    <Panel title="Manage users" eyebrow="Access">
      <div className="grid gap-3">
        {users.map((user) => (
          <article key={user.uid} className="grid gap-4 border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="min-w-0">
              <p className="font-black">{user.name}</p>
              <p className="mt-1 truncate text-xs font-semibold text-slate-500">{user.email}</p>
            </div>
            <CustomSelect
              className="min-w-[180px]"
              value={user.role}
              options={userRoleOptions}
              onChange={(value) => changeUserRole(user.uid, value as UserRole)}
            />
          </article>
        ))}
      </div>
    </Panel>
  );
}

function InventoryPanel({ products }: { products: Product[] }) {
  return (
    <Panel title="Inventory management" eyebrow="Stock">
      <div className="grid gap-3">
        {products
          .slice()
          .sort((a, b) => a.stock - b.stock)
          .map((product) => (
            <article key={product.id} className="grid gap-3 border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_180px] sm:items-center">
              <div>
                <p className="font-black">{product.title}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{product.brand} / {product.category}</p>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                  <span>Stock</span>
                  <span className={product.stock <= 5 ? "text-red-600" : "text-slate-950"}>{product.stock}</span>
                </div>
                <div className="mt-2 h-2 bg-slate-200">
                  <div className={cn("h-full", product.stock <= 5 ? "bg-red-500" : "bg-lime-500")} style={{ width: `${Math.min(100, product.stock * 4)}%` }} />
                </div>
              </div>
            </article>
          ))}
      </div>
    </Panel>
  );
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <section className="border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-black">{title}</h2>
        </div>
        <PackagePlus className="text-lime-600" size={24} />
      </div>
      {children}
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-black">{value}</p>
    </div>
  );
}

function AdminInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-11 border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-lime-500" />
    </label>
  );
}

function withTimeout<T>(promise: Promise<T>, message: string, ms = 15000): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });

  return Promise.race([
    promise.finally(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }),
    timeout,
  ]);
}

function getAdminErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("permission") || lowerMessage.includes("permission_denied")) {
    return 'Firebase blocked this admin action. Confirm the signed-in user document exists in users/{uid} with role: "admin", then deploy Firestore and Storage rules.';
  }

  if (lowerMessage.includes("firestore is not configured")) {
    return "Firestore is not configured. Check your Firebase environment variables and restart the dev server.";
  }

  return message || "Admin action failed. Check Firebase configuration and try again.";
}

function getOrderStatusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    pending: "Waiting approval",
    approved: "Approved",
    paid: "Paid",
    processing: "Waiting shipment",
    shipped: "Delivering",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return labels[status];
}

function getOrderStatusClassName(status: OrderStatus) {
  if (status === "cancelled") {
    return "bg-red-50 text-red-700";
  }

  if (status === "delivered") {
    return "bg-lime-100 text-lime-800";
  }

  if (status === "shipped") {
    return "bg-sky-50 text-sky-700";
  }

  if (status === "approved" || status === "paid" || status === "processing") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-white text-slate-600";
}
