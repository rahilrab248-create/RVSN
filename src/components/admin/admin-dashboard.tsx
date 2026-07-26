"use client";

import { type Dispatch, type FormEvent, type ReactNode, type SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BadgeDollarSign,
  Bell,
  Boxes,
  CheckCircle2,
  Clipboard,
  Edit3,
  PackagePlus,
  ReceiptText,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Trash2,
  Upload,
  X,
  UserPlus,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";
import { catalogProducts, type CatalogProduct } from "@/config/products";
import { CustomSelect } from "@/components/ui/custom-select";
import { createProduct, deleteProduct, getProducts, upsertProduct } from "@/lib/firebase/products";
import { getOrders, updateOrderFulfillment, updateOrderPaymentStatus, updateOrderStatus } from "@/lib/firebase/orders";
import { getUsers, updateUserProfile } from "@/lib/firebase/users";
import { sendOrderWhatsAppNotification } from "@/lib/notifications/whatsapp-client";
import { cn } from "@/lib/utils";
import { createEmptyProductForm, productFormToInput, type AdminTab, type ProductFormState } from "@/types/admin";
import type { Order, OrderFulfillmentUpdate, OrderStatus, PaymentStatus, Product } from "@/types/ecommerce";
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
const paymentStatusOptions: Array<{ label: string; value: PaymentStatus }> = [
  { label: "Unpaid", value: "unpaid" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];
const userRoleOptions = [
  { label: "User", value: "user" },
  { label: "Shipper", value: "shipper" },
  { label: "Admin", value: "admin" },
];
const adminNotificationStorageKey = "rvsn-admin-read-notifications-v1";
const maxProductGalleryImages = 4;

type AdminNotification = {
  id: string;
  type: "user" | "order";
  title: string;
  message: string;
  timestamp: number;
};

type OrderDetailsForm = {
  status: OrderStatus;
  courierName: string;
  trackingNumber: string;
  trackingUrl: string;
  adminNote: string;
};

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [tabHighlight, setTabHighlight] = useState({ x: 0, width: 0, visible: false });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [form, setForm] = useState<ProductFormState>(createEmptyProductForm);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState<"success" | "error">("success");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [visibleNotifications, setVisibleNotifications] = useState<AdminNotification[]>([]);
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    void loadAdminData();
  }, []);

  useEffect(() => {
    moveTabHighlight(activeTab, true);

    function handleResize() {
      moveTabHighlight(activeTab, true);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTab]);

  useEffect(() => {
    try {
      const storedIds = window.localStorage.getItem(adminNotificationStorageKey);
      setReadNotificationIds(storedIds ? JSON.parse(storedIds) as string[] : []);
    } catch {
      setReadNotificationIds([]);
    }
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
        setProducts(mergeCatalogAndFirestoreProducts(productsResult.value));
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

  const notifications = useMemo(() => buildAdminNotifications(users, orders), [users, orders]);
  const unreadNotificationCount = notifications.filter((notification) => !readNotificationIds.includes(notification.id)).length;

  function openNotifications() {
    setIsNotificationOpen((current) => {
      const nextOpen = !current;

      if (nextOpen) {
        const unreadNotifications = notifications.filter((notification) => !readNotificationIds.includes(notification.id));
        setVisibleNotifications(unreadNotifications);

        if (!unreadNotifications.length) {
          return nextOpen;
        }

        const nextReadIds = Array.from(new Set([...readNotificationIds, ...unreadNotifications.map((notification) => notification.id)])).slice(-80);
        setReadNotificationIds(nextReadIds);
        window.localStorage.setItem(adminNotificationStorageKey, JSON.stringify(nextReadIds));
      }

      return nextOpen;
    });
  }

  function moveTabHighlight(tabId: AdminTab, visible = true) {
    const button = tabButtonRefs.current[tabId];

    if (!button) {
      setTabHighlight((current) => ({ ...current, visible: false }));
      return;
    }

    setTabHighlight({
      x: button.offsetLeft,
      width: button.offsetWidth,
      visible,
    });
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>): Promise<boolean> {
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
        await withTimeout(upsertProduct(form.id, input), "Product update timed out. Check your admin role and Firestore rules.");
        setNotice("Product updated.");
      } else {
        await withTimeout(createProduct(input), "Product save timed out. Check your admin role and Firestore rules.");
        setNotice("Product added.");
      }

      clearProductCache();
      setNoticeTone("success");
      setForm(createEmptyProductForm());
      try {
        const refreshedProducts = await withTimeout(getProducts(), "Product saved, but the catalog refresh timed out.");
        setProducts(mergeCatalogAndFirestoreProducts(refreshedProducts));
      } catch (refreshError) {
        setNoticeTone("error");
        setNotice(`${getAdminErrorMessage(refreshError)} Refresh the dashboard to see the saved product.`);
      }
      return true;
    } catch (error) {
      setNoticeTone("error");
      setNotice(getAdminErrorMessage(error));
      return false;
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
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file.");
      }

      if (file.size > 8 * 1024 * 1024) {
        throw new Error("Image is too large. Please upload an image under 8 MB.");
      }

      const currentImages = parseProductImageUrls(form.imageUrls);

      if (currentImages.length >= maxProductGalleryImages) {
        throw new Error(`You can add up to ${maxProductGalleryImages} images per product. Remove one image before uploading another.`);
      }

      const imageUrl = await compressImageForFirestore(file);

      setForm((current) => ({
        ...current,
        imageUrls: serializeProductImageUrls([...parseProductImageUrls(current.imageUrls), imageUrl]),
      }));
      setNoticeTone("success");
      setNotice("Image compressed and ready for Firestore-only mode.");
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
      clearProductCache();
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

      clearProductCache();
      const refreshedProducts = await withTimeout(getProducts(), "Starter products were created, but the catalog refresh timed out.");
      setProducts(mergeCatalogAndFirestoreProducts(refreshedProducts));
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

    const currentOrder = orders.find((order) => order.id === orderId);
    setIsSaving(true);
    try {
      await withTimeout(updateOrderStatus(orderId, status), "Order update timed out. Check your admin role and Firestore rules.");
      setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status } : order)));
      if (currentOrder) {
        void sendOrderWhatsAppNotification({
          event: "order_status_changed",
          orderId,
          order: {
            ...currentOrder,
            status,
          },
          previousStatus: currentOrder.status,
          nextStatus: status,
        });
      }
      setNoticeTone("success");
      setNotice("Order status updated.");
    } catch (error) {
      setNoticeTone("error");
      setNotice(getAdminErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function saveOrderFulfillment(orderId: string | undefined, data: OrderFulfillmentUpdate) {
    if (!orderId) {
      return;
    }

    const currentOrder = orders.find((order) => order.id === orderId);
    setIsSaving(true);
    try {
      await withTimeout(updateOrderFulfillment(orderId, data), "Order fulfillment update timed out. Check your admin role and Firestore rules.");
      setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, ...data } : order)));
      if (currentOrder && data.status && data.status !== currentOrder.status) {
        void sendOrderWhatsAppNotification({
          event: "order_status_changed",
          orderId,
          order: {
            ...currentOrder,
            ...data,
            status: data.status,
          },
          previousStatus: currentOrder.status,
          nextStatus: data.status,
        });
      }
      setNoticeTone("success");
      setNotice("Order fulfillment details updated.");
    } catch (error) {
      setNoticeTone("error");
      setNotice(getAdminErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function changeOrderPaymentStatus(orderId: string | undefined, paymentStatus: PaymentStatus) {
    if (!orderId) {
      return;
    }

    setIsSaving(true);
    try {
      await withTimeout(updateOrderPaymentStatus(orderId, paymentStatus), "Payment update timed out. Check your admin role and Firestore rules.");
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                paymentStatus,
                payment: order.payment ? { ...order.payment, status: paymentStatus } : order.payment,
              }
            : order,
        ),
      );
      setNoticeTone("success");
      setNotice(paymentStatus === "paid" ? "Payment marked as paid." : "Payment status updated.");
    } catch (error) {
      setNoticeTone("error");
      setNotice(getAdminErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function bulkChangeOrderStatus(orderIds: string[], status: OrderStatus) {
    const uniqueOrderIds = Array.from(new Set(orderIds.filter(Boolean)));

    if (!uniqueOrderIds.length) {
      return;
    }

    setIsSaving(true);
    try {
      await withTimeout(
        Promise.all(uniqueOrderIds.map((orderId) => updateOrderStatus(orderId, status))),
        "Bulk order update timed out. Check your admin role and Firestore rules.",
      );
      setOrders((current) => current.map((order) => (order.id && uniqueOrderIds.includes(order.id) ? { ...order, status } : order)));
      setNoticeTone("success");
      setNotice(`${uniqueOrderIds.length} ${uniqueOrderIds.length === 1 ? "order" : "orders"} updated.`);
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
    <main className="purple-page-shell min-h-screen border-b border-white/10 pt-24 text-white">
      <section className="container-shell w-full pb-16">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-100/56">Admin control room</p>
            <h1 className="mt-3 text-4xl font-normal leading-none tracking-[-0.06em] text-white sm:text-5xl">RVSN Commerce dashboard</h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-violet-100/62">
              Manage products, stock, orders, customers, and payment-driven sales from one responsive admin surface.
            </p>
          </div>
          <div className="relative flex items-center gap-3">
            <button
              type="button"
              onClick={openNotifications}
              className="relative grid size-11 place-items-center rounded-full border border-white/14 bg-white/8 text-white transition hover:border-violet-200/45 hover:bg-white/14"
              aria-label="Open admin notifications"
              aria-expanded={isNotificationOpen}
            >
              <Bell size={18} />
              {unreadNotificationCount ? (
                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-violet-200 px-1.5 py-0.5 text-[0.65rem] font-black text-black shadow-lg shadow-violet-500/25">
                  {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                </span>
              ) : null}
            </button>
            <button
              onClick={() => void loadAdminData()}
              className="h-11 rounded-full border border-white/14 bg-white/8 px-5 text-sm font-semibold text-white transition hover:border-violet-200/45 hover:bg-white/14"
            >
              Refresh data
            </button>
            <AdminNotificationsPanel
              isOpen={isNotificationOpen}
              notifications={visibleNotifications}
              onClose={() => setIsNotificationOpen(false)}
            />
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={<BadgeDollarSign size={21} />} label="Revenue" value={`$${analytics.revenue.toFixed(0)}`} />
          <Metric icon={<ShoppingBag size={21} />} label="Orders" value={orders.length.toString()} />
          <Metric icon={<Boxes size={21} />} label="Inventory value" value={`$${analytics.inventoryValue.toFixed(0)}`} />
          <Metric icon={<ShieldCheck size={21} />} label="Low stock" value={analytics.lowStock.toString()} danger={analytics.lowStock > 0} />
        </div>

        <div
          className="admin-tab-pill mt-8 flex gap-2 overflow-x-auto rounded-[24px] border border-white/10 p-2 backdrop-blur-xl"
          onPointerLeave={() => moveTabHighlight(activeTab, true)}
        >
          <span
            className="admin-tab-highlight"
            style={{
              transform: `translateX(${tabHighlight.x}px)`,
              width: `${tabHighlight.width}px`,
              opacity: tabHighlight.visible ? 1 : 0,
            }}
            aria-hidden="true"
          />
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(node) => {
                tabButtonRefs.current[tab.id] = node;
              }}
              onClick={() => setActiveTab(tab.id)}
              onPointerEnter={() => moveTabHighlight(tab.id)}
              onFocus={() => moveTabHighlight(tab.id)}
              className={cn(
                "admin-tab-link relative z-10 h-11 shrink-0 rounded-[16px] px-5 text-sm font-semibold transition",
                activeTab === tab.id
                  ? "text-white"
                  : "text-violet-100/55 hover:text-white",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AdminToast notice={notice} tone={noticeTone} onClose={() => setNotice("")} />

        {isLoading ? (
          <AdminDashboardSkeleton />
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
            {activeTab === "orders" ? (
              <OrdersPanel
                orders={orders}
                isSaving={isSaving}
                changeOrderStatus={changeOrderStatus}
                saveOrderFulfillment={saveOrderFulfillment}
                changeOrderPaymentStatus={changeOrderPaymentStatus}
                bulkChangeOrderStatus={bulkChangeOrderStatus}
              />
            ) : null}
            {activeTab === "users" ? <UsersPanel users={users} changeUserRole={changeUserRole} /> : null}
            {activeTab === "inventory" ? <InventoryPanel products={products} /> : null}
          </motion.div>
        )}
      </section>
    </main>
  );
}

function AdminToast({ notice, tone, onClose }: { notice: string; tone: "success" | "error"; onClose: () => void }) {
  return (
    <AnimatePresence>
      {notice ? (
        <motion.div
          initial={{ opacity: 0, y: -18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="fixed right-4 top-24 z-[90] w-[min(calc(100vw-2rem),420px)] sm:right-6"
          role="status"
          aria-live="polite"
        >
          <div
            className={cn(
              "flex items-start gap-3 rounded-[24px] border p-4 pr-12 text-sm font-semibold shadow-2xl shadow-black/35 backdrop-blur-2xl",
              tone === "success"
                ? "border-emerald-200/24 bg-[linear-gradient(135deg,rgba(16,185,129,0.22),rgba(12,10,20,0.9))] text-emerald-50"
                : "border-red-200/24 bg-[linear-gradient(135deg,rgba(248,113,113,0.22),rgba(12,10,20,0.92))] text-red-50",
            )}
          >
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-2xl border",
                tone === "success" ? "border-emerald-200/24 bg-emerald-300/14" : "border-red-200/24 bg-red-300/14",
              )}
            >
              <CheckCircle2 size={19} />
            </span>
            <span className="pt-2 leading-5">{notice}</span>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 grid size-8 place-items-center rounded-full border border-white/10 bg-white/8 text-white/70 transition hover:bg-white/14 hover:text-white"
              aria-label="Close notification"
            >
              x
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function AdminNotificationsPanel({
  isOpen,
  notifications,
  onClose,
}: {
  isOpen: boolean;
  notifications: AdminNotification[];
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="absolute right-0 top-[calc(100%+0.75rem)] z-[95] w-[min(calc(100vw-2rem),430px)] overflow-hidden rounded-[28px] border border-white/12 bg-[#08040f]/94 shadow-[0_28px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        >
          <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-100/48">Notifications</p>
              <h2 className="mt-1 text-xl font-normal tracking-[-0.04em] text-white">Admin activity</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/8 text-white/70 transition hover:bg-white/14 hover:text-white"
              aria-label="Close notifications"
            >
              x
            </button>
          </div>
          <div data-lenis-prevent className="max-h-[420px] overflow-y-auto overscroll-contain p-3">
            {notifications.length ? (
              <div className="grid gap-2">
                {notifications.map((notification) => (
                  <article key={notification.id} className="flex gap-3 rounded-[22px] border border-white/10 bg-white/[0.055] p-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-violet-200/20 bg-violet-300/12 text-violet-100">
                      {notification.type === "order" ? <ReceiptText size={18} /> : <UserPlus size={18} />}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">{notification.title}</h3>
                        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-violet-100/42">
                          {formatNotificationTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold leading-5 text-violet-100/62">{notification.message}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="grid min-h-40 place-items-center rounded-[22px] border border-white/10 bg-white/[0.045] p-6 text-center">
                <div>
                  <Bell className="mx-auto text-violet-100/55" size={24} />
                  <p className="mt-3 text-sm font-semibold text-white">No notifications yet.</p>
                  <p className="mt-1 text-xs font-semibold text-violet-100/44">New signups and orders will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_380px]" aria-label="Loading admin dashboard">
      <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
        <div className="mb-6">
          <SkeletonBlock className="h-3 w-28 rounded-full" />
          <SkeletonBlock className="mt-3 h-8 w-56 rounded-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-[18px] border border-white/10 bg-white/[0.055] p-4">
              <SkeletonBlock className="h-3 w-24 rounded-full" />
              <SkeletonBlock className="mt-4 h-8 w-16 rounded-full" />
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, panelIndex) => (
            <div key={panelIndex}>
              <SkeletonBlock className="mb-3 h-3 w-28 rounded-full" />
              <div className="grid gap-3">
                {Array.from({ length: 4 }).map((__, rowIndex) => (
                  <div key={rowIndex} className="rounded-[18px] border border-white/10 bg-white/[0.055] p-4">
                    <SkeletonBlock className="h-4 w-40 rounded-full" />
                    <SkeletonBlock className="mt-2 h-3 w-56 max-w-full rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
        <SkeletonBlock className="h-3 w-24 rounded-full" />
        <SkeletonBlock className="mt-3 h-8 w-44 rounded-full" />
        <div className="mt-6 grid gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid gap-2">
              <div className="flex items-center justify-between gap-4">
                <SkeletonBlock className="h-4 w-40 rounded-full" />
                <SkeletonBlock className="h-4 w-8 rounded-full" />
              </div>
              <SkeletonBlock className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={cn("skeleton-shimmer bg-white/[0.075]", className)} />;
}

function buildAdminNotifications(users: UserProfile[], orders: Order[]): AdminNotification[] {
  const userNotifications = users.map((user) => ({
    id: `user:${user.uid}`,
    type: "user" as const,
    title: "New user signup",
    message: `${user.name || "Football member"} joined with ${user.email}.`,
    timestamp: profileTimestampMillis(user.createdAt),
  }));

  const orderNotifications = orders.map((order) => ({
    id: `order:${order.id ?? order.orderNumber ?? order.createdAt?.seconds ?? order.shippingAddress.email}`,
    type: "order" as const,
    title: "New product order",
    message: `${order.shippingAddress.name} ordered ${order.items.length} ${order.items.length === 1 ? "item" : "items"} for $${order.total}. Status: ${getOrderStatusLabel(order.status)}.`,
    timestamp: ecommerceTimestampMillis(order.createdAt),
  }));

  return [...userNotifications, ...orderNotifications]
    .filter((notification) => notification.timestamp > 0)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20);
}

function ecommerceTimestampMillis(value: Order["createdAt"] | undefined) {
  if (!value) {
    return 0;
  }

  if ("toMillis" in value && typeof value.toMillis === "function") {
    return value.toMillis();
  }

  return 0;
}

function formatNotificationTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return "Just now";
  }

  if (diff < hour) {
    return `${Math.max(1, Math.floor(diff / minute))}m ago`;
  }

  if (diff < day) {
    return `${Math.floor(diff / hour)}h ago`;
  }

  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(timestamp));
}

function mergeCatalogAndFirestoreProducts(firestoreProducts: Product[]) {
  const merged = new Map<string, Product>();

  catalogProducts.forEach((product) => {
    merged.set(product.id, catalogProductToAdminProduct(product));
  });

  firestoreProducts.forEach((product) => {
    if (product.id) {
      merged.set(product.id, product);
    } else {
      merged.set(`${product.brand}-${product.title}`, product);
    }
  });

  return Array.from(merged.values());
}

function catalogProductToAdminProduct(product: CatalogProduct): Product {
  const timestamp = Timestamp.fromMillis(0);

  return {
    id: product.id,
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
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function Metric({ icon, label, value, danger = false }: { icon: ReactNode; label: string; value: string; danger?: boolean }) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <span className={cn("grid size-11 place-items-center rounded-2xl border", danger ? "border-red-300/30 bg-red-400/12 text-red-100" : "border-violet-200/20 bg-white/10 text-violet-100")}>
          {icon}
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-100/42">{label}</span>
      </div>
      <p className="mt-5 text-3xl font-normal tracking-[-0.05em] text-white">{value}</p>
    </article>
  );
}

function Overview({ products, orders, users, paidOrders }: { products: Product[]; orders: Order[]; users: UserProfile[]; paidOrders: number }) {
  const recentOrders = orders.slice(0, 5);
  const recentUsers = users
    .slice()
    .sort((a, b) => profileTimestampMillis(b.lastLoginAt ?? b.createdAt) - profileTimestampMillis(a.lastLoginAt ?? a.createdAt))
    .slice(0, 5);

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <Panel title="Sales analytics" eyebrow="Performance">
        <div className="grid gap-4 sm:grid-cols-4">
          <MiniStat label="Conversion orders" value={paidOrders.toString()} />
          <MiniStat label="Average order" value={`$${orders.length ? (orders.reduce((sum, order) => sum + order.total, 0) / orders.length).toFixed(0) : 0}`} />
          <MiniStat label="Customers" value={users.length.toString()} />
          <MiniStat label="COD pending" value={orders.filter((order) => order.paymentStatus === "unpaid").length.toString()} />
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/48">Recent orders</p>
            <div className="grid gap-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-white/[0.055] p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{order.shippingAddress.name}</p>
                    <p className="mt-1 text-xs font-semibold text-violet-100/46">
                      {order.orderNumber ?? order.id} / {order.paymentMethod ?? "cash_on_delivery"} / {order.paymentStatus ?? "unpaid"}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-violet-100">${order.total}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/48">Recent users</p>
            <div className="grid gap-3">
              {recentUsers.map((user) => (
                <div key={user.uid} className="flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-white/[0.055] p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-violet-100/46">{user.email}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold uppercase text-violet-100">{user.provider ?? "password"}</p>
                    <p className="mt-1 text-xs font-semibold text-violet-100/46">{user.loginCount ?? 0} logins</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
                <span className="line-clamp-1 text-sm font-semibold text-violet-100/76">{product.title}</span>
                <span className={cn("text-sm font-semibold", product.stock <= 5 ? "text-red-200" : "text-white")}>{product.stock}</span>
              </div>
            ))}
        </div>
      </Panel>
    </div>
  );
}

function profileTimestampMillis(value: UserProfile["createdAt"] | undefined) {
  if (!value) {
    return 0;
  }

  if ("toMillis" in value && typeof value.toMillis === "function") {
    return value.toMillis();
  }

  return value instanceof Date ? value.getTime() : 0;
}

function ProductsPanel(props: {
  form: ProductFormState;
  setForm: Dispatch<SetStateAction<ProductFormState>>;
  products: Product[];
  query: string;
  setQuery: (value: string) => void;
  isSaving: boolean;
  submitProduct: (event: FormEvent<HTMLFormElement>) => Promise<boolean>;
  uploadProductImage: (file: File | null) => void;
  editProduct: (product: Product) => void;
  removeProduct: (productId?: string) => void;
  seedStarterProducts: () => void;
}) {
  const { form, setForm, products, query, setQuery, isSaving, submitProduct, uploadProductImage, editProduct, removeProduct, seedStarterProducts } = props;
  const galleryImages = parseProductImageUrls(form.imageUrls);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  function setGalleryImages(images: string[]) {
    setForm((current) => ({ ...current, imageUrls: serializeProductImageUrls(images) }));
  }

  function removeGalleryImage(index: number) {
    setGalleryImages(galleryImages.filter((_, imageIndex) => imageIndex !== index));
  }

  function moveGalleryImage(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= galleryImages.length) {
      return;
    }

    const nextImages = [...galleryImages];
    const [image] = nextImages.splice(index, 1);
    nextImages.splice(nextIndex, 0, image);
    setGalleryImages(nextImages);
  }

  function makeCoverImage(index: number) {
    if (index === 0) {
      return;
    }

    const nextImages = [...galleryImages];
    const [image] = nextImages.splice(index, 1);
    setGalleryImages([image, ...nextImages]);
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    const wasEditing = Boolean(form.id);
    const didSave = await submitProduct(event);

    if (wasEditing && didSave) {
      setIsEditModalOpen(false);
    }
  }

  function closeEditModal() {
    setIsEditModalOpen(false);
    setForm(createEmptyProductForm());
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <Panel title="Add product" eyebrow="Product manager">
        <ProductEditorForm
          form={form}
          setForm={setForm}
          galleryImages={galleryImages}
          isSaving={isSaving}
          submitProduct={handleProductSubmit}
          uploadProductImage={uploadProductImage}
          removeGalleryImage={removeGalleryImage}
          moveGalleryImage={moveGalleryImage}
          makeCoverImage={makeCoverImage}
        />
      </Panel>
      <Panel title="Product catalog" eyebrow="Manage">
        <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-100/44" size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="h-12 w-full rounded-full border border-white/10 bg-white/[0.055] pl-10 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-violet-100/34 focus:border-violet-200/45 focus:bg-white/10" />
          </div>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void seedStarterProducts()}
            className="h-12 rounded-full border border-white/14 bg-white/8 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:border-violet-200/45 hover:bg-white/14 disabled:opacity-50"
          >
            {isSaving ? "Creating..." : "Seed products"}
          </button>
        </div>
        {!products.length ? (
          <div className="mb-4 rounded-[18px] border border-amber-300/30 bg-amber-300/10 p-4 text-sm font-semibold text-amber-100">
            Firestore has no product documents yet. Use Seed products or add a product manually.
          </div>
        ) : null}
        <div className="grid gap-3">
          {products.map((product) => (
            <article key={product.id} className="grid gap-4 rounded-[20px] border border-white/10 bg-white/[0.055] p-3 sm:grid-cols-[72px_1fr_auto] sm:items-center">
              <div className="relative aspect-square overflow-hidden rounded-[14px] bg-white/8">
                {product.images[0] ? <Image src={product.images[0]} alt={product.title} fill unoptimized={product.images[0].startsWith("data:")} sizes="72px" className="object-cover" /> : null}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-100/42">{product.brand}</p>
                <h3 className="mt-1 font-semibold text-white">{product.title}</h3>
                <p className="mt-1 text-xs font-semibold text-violet-100/48">{product.category} / ${product.price} / stock {product.stock}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    editProduct(product);
                    setIsEditModalOpen(true);
                  }}
                  className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/8 text-white transition hover:bg-white/14"
                  aria-label="Edit product"
                >
                  <Edit3 size={17} />
                </button>
                <button onClick={() => void removeProduct(product.id)} className="grid size-10 place-items-center rounded-full border border-red-300/20 bg-red-400/10 text-red-100 transition hover:bg-red-400/16" aria-label="Delete product">
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </Panel>
      <ProductEditModal
        isOpen={isEditModalOpen}
        form={form}
        setForm={setForm}
        galleryImages={galleryImages}
        isSaving={isSaving}
        onClose={closeEditModal}
        submitProduct={handleProductSubmit}
        uploadProductImage={uploadProductImage}
        removeGalleryImage={removeGalleryImage}
        moveGalleryImage={moveGalleryImage}
        makeCoverImage={makeCoverImage}
      />
    </div>
  );
}

function ProductEditModal({
  isOpen,
  form,
  setForm,
  galleryImages,
  isSaving,
  onClose,
  submitProduct,
  uploadProductImage,
  removeGalleryImage,
  moveGalleryImage,
  makeCoverImage,
}: {
  isOpen: boolean;
  form: ProductFormState;
  setForm: Dispatch<SetStateAction<ProductFormState>>;
  galleryImages: string[];
  isSaving: boolean;
  onClose: () => void;
  submitProduct: (event: FormEvent<HTMLFormElement>) => void;
  uploadProductImage: (file: File | null) => void;
  removeGalleryImage: (index: number) => void;
  moveGalleryImage: (index: number, direction: -1 | 1) => void;
  makeCoverImage: (index: number) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[85] grid place-items-center bg-black/72 px-3 py-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.section
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-white/14 bg-[#08040f]/96 p-5 text-white shadow-2xl shadow-black/60 backdrop-blur-2xl sm:p-6"
            data-lenis-prevent
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-100/48">Edit product</p>
                <h2 className="mt-2 text-3xl font-normal tracking-[-0.05em] text-white">{form.title || "Product details"}</h2>
                <p className="mt-2 text-sm font-semibold text-violet-100/52">Update the product without jumping back to the top of the admin page.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-white/12 bg-white/8 text-white transition hover:bg-white/14"
                aria-label="Close product editor"
              >
                <X size={18} />
              </button>
            </div>
            <ProductEditorForm
              form={form}
              setForm={setForm}
              galleryImages={galleryImages}
              isSaving={isSaving}
              submitProduct={submitProduct}
              uploadProductImage={uploadProductImage}
              removeGalleryImage={removeGalleryImage}
              moveGalleryImage={moveGalleryImage}
              makeCoverImage={makeCoverImage}
            />
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ProductEditorForm({
  form,
  setForm,
  galleryImages,
  isSaving,
  submitProduct,
  uploadProductImage,
  removeGalleryImage,
  moveGalleryImage,
  makeCoverImage,
}: {
  form: ProductFormState;
  setForm: Dispatch<SetStateAction<ProductFormState>>;
  galleryImages: string[];
  isSaving: boolean;
  submitProduct: (event: FormEvent<HTMLFormElement>) => void;
  uploadProductImage: (file: File | null) => void;
  removeGalleryImage: (index: number) => void;
  moveGalleryImage: (index: number, direction: -1 | 1) => void;
  makeCoverImage: (index: number) => void;
}) {
  return (
    <form onSubmit={submitProduct} className="grid gap-4">
      <AdminInput label="Title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} />
      <AdminInput label="Brand" value={form.brand} onChange={(value) => setForm((current) => ({ ...current, brand: value }))} />
      <AdminInput label="Category" value={form.category} onChange={(value) => setForm((current) => ({ ...current, category: value }))} />
      <label className="grid gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/48">Product images</span>
        <span className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-dashed border-white/18 bg-white/[0.055] text-sm font-semibold text-white transition hover:border-violet-200/45 hover:bg-white/10">
          <Upload size={17} /> {galleryImages.length ? "Add another image" : "Choose product image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={galleryImages.length >= maxProductGalleryImages}
            onChange={(event) => {
              void uploadProductImage(event.target.files?.[0] ?? null);
              event.currentTarget.value = "";
            }}
          />
        </span>
        <span className="text-xs font-semibold text-violet-100/44">
          Upload one image at a time. First image is the product cover. Max {maxProductGalleryImages} images.
        </span>
      </label>
      {galleryImages.length ? (
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/48">Gallery manager</span>
            <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-xs font-semibold text-violet-100/62">
              {galleryImages.length}/{maxProductGalleryImages}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {galleryImages.map((image, index) => (
              <div key={`${image}-${index}`} className="group relative overflow-hidden rounded-[18px] border border-white/10 bg-white/8">
                <div className="relative aspect-square">
                  <Image src={image} alt={`Product gallery image ${index + 1}`} fill unoptimized={image.startsWith("data:")} sizes="180px" className="object-cover" />
                </div>
                <div className="absolute inset-x-2 top-2 flex items-center justify-between gap-2">
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.64rem] font-black uppercase tracking-[0.12em]", index === 0 ? "bg-white text-black" : "bg-black/50 text-white backdrop-blur")}>
                    {index === 0 ? <Star size={11} fill="currentColor" /> : null}
                    {index === 0 ? "Cover" : `Image ${index + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="grid size-7 place-items-center rounded-full bg-black/55 text-white opacity-90 backdrop-blur transition hover:bg-red-400 hover:text-black"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1 border-t border-white/10 bg-black/22 p-2">
                  <button
                    type="button"
                    onClick={() => moveGalleryImage(index, -1)}
                    disabled={index === 0}
                    className="grid h-8 place-items-center rounded-full border border-white/10 bg-white/8 text-white transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label={`Move image ${index + 1} left`}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => makeCoverImage(index)}
                    disabled={index === 0}
                    className="h-8 rounded-full border border-white/10 bg-white/8 px-2 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Cover
                  </button>
                  <button
                    type="button"
                    onClick={() => moveGalleryImage(index, 1)}
                    disabled={index === galleryImages.length - 1}
                    className="grid h-8 place-items-center rounded-full border border-white/10 bg-white/8 text-white transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label={`Move image ${index + 1} right`}
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <textarea
        value={form.description}
        onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
        placeholder="Product description"
        className="min-h-28 rounded-[18px] border border-white/10 bg-white/[0.055] p-3 text-sm font-semibold text-white outline-none transition placeholder:text-violet-100/34 focus:border-violet-200/45 focus:bg-white/10"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminInput label="Sizes" value={form.sizes} onChange={(value) => setForm((current) => ({ ...current, sizes: value }))} />
        <AdminInput label="Stock" value={form.stock} onChange={(value) => setForm((current) => ({ ...current, stock: value }))} />
        <AdminInput label="Price" value={form.price} onChange={(value) => setForm((current) => ({ ...current, price: value }))} />
        <AdminInput label="Rating" value={form.rating} onChange={(value) => setForm((current) => ({ ...current, rating: value }))} />
      </div>
      <label className="flex items-center gap-3 text-sm font-semibold text-violet-100/70">
        <input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} className="size-4 accent-lime-500" />
        Featured product
      </label>
      <button disabled={isSaving} className="h-12 rounded-full bg-white text-sm font-semibold text-black transition hover:bg-violet-100 disabled:opacity-50">
        {isSaving ? "Saving product..." : form.id ? "Update product" : "Add product"}
      </button>
    </form>
  );
}

function OrdersPanel({
  orders,
  isSaving,
  changeOrderStatus,
  saveOrderFulfillment,
  changeOrderPaymentStatus,
  bulkChangeOrderStatus,
}: {
  orders: Order[];
  isSaving: boolean;
  changeOrderStatus: (orderId: string | undefined, status: OrderStatus) => void;
  saveOrderFulfillment: (orderId: string | undefined, data: OrderFulfillmentUpdate) => void;
  changeOrderPaymentStatus: (orderId: string | undefined, paymentStatus: PaymentStatus) => void;
  bulkChangeOrderStatus: (orderIds: string[], status: OrderStatus) => void;
}) {
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>("processing");
  const [openOrder, setOpenOrder] = useState<Order | null>(null);
  const selectableOrders = orders.filter((order) => order.id);
  const selectedCount = selectedOrderIds.length;

  function toggleOrder(orderId?: string) {
    if (!orderId) {
      return;
    }

    setSelectedOrderIds((current) =>
      current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId],
    );
  }

  function toggleAll() {
    setSelectedOrderIds((current) =>
      current.length === selectableOrders.length ? [] : selectableOrders.map((order) => order.id as string),
    );
  }

  return (
    <Panel title="Manage orders" eyebrow="Fulfillment">
      <div className="mb-4 grid gap-3 rounded-[22px] border border-white/10 bg-white/[0.045] p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <button
          type="button"
          onClick={toggleAll}
          className="h-11 rounded-full border border-white/12 bg-white/8 px-4 text-sm font-semibold text-white transition hover:border-violet-200/45 hover:bg-white/14"
        >
          {selectedCount === selectableOrders.length && selectableOrders.length ? "Clear selection" : "Select all"}
        </button>
        <p className="text-sm font-semibold text-violet-100/58">
          {selectedCount ? `${selectedCount} selected for bulk fulfillment.` : "Select orders to update many deliveries at once."}
        </p>
        <div className="grid gap-2 sm:grid-cols-[190px_auto]">
          <CustomSelect
            value={bulkStatus}
            options={orderStatusOptions}
            onChange={(value) => setBulkStatus(value as OrderStatus)}
          />
          <button
            type="button"
            disabled={!selectedCount || isSaving}
            onClick={() => void bulkChangeOrderStatus(selectedOrderIds, bulkStatus)}
            className="h-12 rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/32"
          >
            Apply bulk status
          </button>
        </div>
      </div>
      <div className="grid gap-3">
        {orders.map((order) => (
          <article key={order.id} className="grid gap-4 rounded-[24px] border border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.035))] p-4 shadow-xl shadow-black/18 backdrop-blur-xl lg:grid-cols-[minmax(0,1fr)_auto_240px] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleOrder(order.id)}
                  className={cn(
                    "grid size-8 place-items-center rounded-full border text-xs font-black transition",
                    order.id && selectedOrderIds.includes(order.id)
                      ? "border-violet-200 bg-violet-200 text-black"
                      : "border-white/12 bg-white/8 text-white/50 hover:border-white/35 hover:text-white",
                  )}
                  aria-label={`Select order ${order.orderNumber ?? order.id}`}
                >
                  {order.id && selectedOrderIds.includes(order.id) ? <CheckCircle2 size={16} /> : null}
                </button>
                <p className="text-base font-semibold tracking-[-0.02em] text-white">{order.shippingAddress.name}</p>
                <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-violet-100/70">
                  {order.items.length} {order.items.length === 1 ? "item" : "items"}
                </span>
              </div>
              <p className="mt-2 max-w-full truncate font-mono text-xs font-semibold text-violet-100/62">
                {order.orderNumber ?? order.id}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-violet-100/54">
                <span className="truncate">{order.shippingAddress.email}</span>
                <span>${order.total}</span>
                <span>{order.paymentMethod ?? "cash_on_delivery"}</span>
                <span>{order.paymentStatus ?? "unpaid"}</span>
                {order.trackingNumber ? <span>Track: {order.trackingNumber}</span> : null}
              </div>
              <button
                type="button"
                onClick={() => setOpenOrder(order)}
                className="mt-3 inline-flex h-9 items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 text-xs font-semibold text-white transition hover:border-violet-200/45 hover:bg-white/14"
              >
                <ReceiptText size={15} /> View details
              </button>
            </div>
            <span className={cn("w-fit px-3 py-2 text-xs font-black uppercase tracking-[0.14em]", getOrderStatusClassName(order.status))}>
              {getOrderStatusLabel(order.status)}
            </span>
            <div className="grid min-w-0 gap-2">
              <CustomSelect
                label="Update status"
                value={orderFulfillmentStatuses.includes(order.status) ? order.status : ""}
                placeholder="Choose next step"
                options={orderStatusOptions}
                onChange={(value) => changeOrderStatus(order.id, value as OrderStatus)}
              />
              {order.paymentMethod === "cash_on_delivery" || !order.paymentMethod ? (
                <button
                  type="button"
                  disabled={order.paymentStatus === "paid" || isSaving}
                  onClick={() => void changeOrderPaymentStatus(order.id, "paid")}
                  className="h-11 rounded-full border border-emerald-200/24 bg-emerald-300/10 px-4 text-sm font-semibold text-emerald-50 transition hover:border-emerald-200/50 hover:bg-emerald-300/16 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/6 disabled:text-white/32"
                >
                  {order.paymentStatus === "paid" ? "COD paid" : "Mark COD paid"}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      <OrderDetailsModal
        order={openOrder}
        isSaving={isSaving}
        onClose={() => setOpenOrder(null)}
        onSave={saveOrderFulfillment}
        onPaymentChange={changeOrderPaymentStatus}
      />
    </Panel>
  );
}

function OrderDetailsModal({
  order,
  isSaving,
  onClose,
  onSave,
  onPaymentChange,
}: {
  order: Order | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (orderId: string | undefined, data: OrderFulfillmentUpdate) => void;
  onPaymentChange: (orderId: string | undefined, paymentStatus: PaymentStatus) => void;
}) {
  const [form, setForm] = useState<OrderDetailsForm>(() => createOrderDetailsForm(order));

  useEffect(() => {
    setForm(createOrderDetailsForm(order));
  }, [order]);

  if (!order) {
    return null;
  }

  const fullAddress = [
    order.shippingAddress.line1,
    order.shippingAddress.line2,
    order.shippingAddress.city,
    order.shippingAddress.state,
    order.shippingAddress.postalCode,
    order.shippingAddress.country,
  ].filter(Boolean).join(", ");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  function submitFulfillment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(order?.id, {
      status: form.status,
      courierName: normalizeOptionalText(form.courierName),
      trackingNumber: normalizeOptionalText(form.trackingNumber),
      trackingUrl: normalizeOptionalText(form.trackingUrl),
      adminNote: normalizeOptionalText(form.adminNote),
    });
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] grid place-items-center bg-black/70 px-4 py-8 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.section
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.22 }}
          className="max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-[30px] border border-white/14 bg-[#08040f]/96 p-5 text-white shadow-2xl shadow-black/60 backdrop-blur-2xl sm:p-6"
          data-lenis-prevent
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-100/48">Order details</p>
              <h3 className="mt-2 text-3xl font-normal tracking-[-0.05em] text-white">{order.orderNumber ?? order.id}</h3>
              <p className="mt-2 text-sm font-semibold text-violet-100/56">
                {order.shippingAddress.name} / {order.shippingAddress.email} / ${order.total}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid size-11 place-items-center rounded-full border border-white/12 bg-white/8 text-white transition hover:border-white/35 hover:bg-white/14"
              aria-label="Close order details"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="grid gap-5">
              <section className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/44">Customer location</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-white/70">{fullAddress}</p>
                    {order.shippingAddress.phone ? (
                      <p className="mt-1 text-sm font-semibold text-violet-100/56">Phone: {order.shippingAddress.phone}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void navigator.clipboard?.writeText(fullAddress)}
                      className="grid size-10 place-items-center rounded-full border border-white/12 bg-white/8 text-white transition hover:bg-white/14"
                      aria-label="Copy address"
                    >
                      <Clipboard size={17} />
                    </button>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 text-xs font-semibold text-white transition hover:bg-white/14"
                    >
                      Open maps
                    </a>
                  </div>
                </div>
              </section>

              <section className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/44">Products</p>
                <div className="mt-4 grid gap-3">
                  {order.items.map((item) => (
                    <article key={`${item.productId}-${item.size}`} className="grid grid-cols-[58px_1fr_auto] items-center gap-3 rounded-[16px] border border-white/10 bg-black/18 p-2">
                      <div className="relative aspect-square overflow-hidden rounded-[12px] bg-white/8">
                        {item.image ? <Image src={item.image} alt={item.title} fill unoptimized={item.image.startsWith("data:")} sizes="58px" className="object-cover" /> : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-xs font-semibold text-violet-100/48">{item.brand} / {item.size} / Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-white">${item.price * item.quantity}</p>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <div className="grid gap-5">
              <form onSubmit={submitFulfillment} className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Truck className="text-violet-100" size={18} />
                  <p className="text-sm font-semibold text-white">Shipping control</p>
                </div>
                <div className="grid gap-3">
                  <CustomSelect
                    label="Order status"
                    value={form.status}
                    options={orderStatusOptions}
                    onChange={(value) => setForm((current) => ({ ...current, status: value as OrderStatus }))}
                  />
                  <AdminInput label="Courier name" value={form.courierName} onChange={(value) => setForm((current) => ({ ...current, courierName: value }))} />
                  <AdminInput label="Tracking number" value={form.trackingNumber} onChange={(value) => setForm((current) => ({ ...current, trackingNumber: value }))} />
                  <AdminInput label="Tracking URL" value={form.trackingUrl} onChange={(value) => setForm((current) => ({ ...current, trackingUrl: value }))} />
                  <label className="grid gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/48">Admin note</span>
                    <textarea
                      value={form.adminNote}
                      onChange={(event) => setForm((current) => ({ ...current, adminNote: event.target.value }))}
                      className="min-h-24 rounded-[18px] border border-white/10 bg-white/[0.055] p-3 text-sm font-semibold text-white outline-none transition placeholder:text-violet-100/34 focus:border-violet-200/45 focus:bg-white/10"
                    />
                  </label>
                  <button
                    disabled={isSaving}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-violet-100 disabled:opacity-50"
                  >
                    <Send size={16} /> Save shipping details
                  </button>
                </div>
              </form>

              <section className="rounded-[22px] border border-white/10 bg-white/[0.055] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/44">Payment</p>
                <div className="mt-4 grid gap-3">
                  <div className="flex items-center justify-between rounded-[16px] border border-white/10 bg-black/18 p-3">
                    <span className="text-sm font-semibold text-violet-100/62">Method</span>
                    <span className="text-sm font-semibold text-white">{order.paymentMethod ?? "cash_on_delivery"}</span>
                  </div>
                  <CustomSelect
                    label="Payment status"
                    value={(order.paymentStatus as PaymentStatus | undefined) ?? "unpaid"}
                    options={paymentStatusOptions}
                    onChange={(value) => onPaymentChange(order.id, value as PaymentStatus)}
                  />
                  {order.paymentMethod === "cash_on_delivery" || !order.paymentMethod ? (
                    <button
                      type="button"
                      disabled={order.paymentStatus === "paid" || isSaving}
                      onClick={() => onPaymentChange(order.id, "paid")}
                      className="h-11 rounded-full border border-emerald-200/24 bg-emerald-300/10 px-4 text-sm font-semibold text-emerald-50 transition hover:border-emerald-200/50 hover:bg-emerald-300/16 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/6 disabled:text-white/32"
                    >
                      {order.paymentStatus === "paid" ? "Cash received" : "Mark cash received"}
                    </button>
                  ) : null}
                </div>
              </section>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}

function createOrderDetailsForm(order: Order | null): OrderDetailsForm {
  return {
    status: order?.status && orderFulfillmentStatuses.includes(order.status) ? order.status : "approved",
    courierName: order?.courierName ?? "",
    trackingNumber: order?.trackingNumber ?? "",
    trackingUrl: order?.trackingUrl ?? "",
    adminNote: order?.adminNote ?? "",
  };
}

function normalizeOptionalText(value: string) {
  return value.trim() || null;
}

function UsersPanel({ users, changeUserRole }: { users: UserProfile[]; changeUserRole: (uid: string, role: UserRole) => void }) {
  return (
    <Panel title="Manage users" eyebrow="Access">
      <div className="grid gap-3">
        {users.map((user) => (
          <article key={user.uid} className="grid gap-4 rounded-[20px] border border-white/10 bg-white/[0.055] p-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="min-w-0">
              <p className="font-semibold text-white">{user.name}</p>
              <p className="mt-1 truncate text-xs font-semibold text-violet-100/48">
                {user.email} / {user.provider ?? "password"} / {user.loginCount ?? 0} logins
              </p>
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
            <article key={product.id} className="grid gap-3 rounded-[20px] border border-white/10 bg-white/[0.055] p-4 sm:grid-cols-[1fr_180px] sm:items-center">
              <div>
                <p className="font-semibold text-white">{product.title}</p>
                <p className="mt-1 text-xs font-semibold text-violet-100/48">{product.brand} / {product.category}</p>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-violet-100/48">
                  <span>Stock</span>
                  <span className={product.stock <= 5 ? "text-red-200" : "text-white"}>{product.stock}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div className={cn("h-full rounded-full", product.stock <= 5 ? "bg-red-300" : "bg-violet-200")} style={{ width: `${Math.min(100, product.stock * 4)}%` }} />
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
    <section className="rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-100/48">{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-normal tracking-[-0.04em] text-white">{title}</h2>
        </div>
        <PackagePlus className="text-violet-100/72" size={24} />
      </div>
      {children}
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.055] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/46">{label}</p>
      <p className="mt-3 text-2xl font-normal tracking-[-0.04em] text-white">{value}</p>
    </div>
  );
}

function AdminInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/48">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-full border border-white/10 bg-white/[0.055] px-3 text-sm font-semibold text-white outline-none transition placeholder:text-violet-100/34 focus:border-violet-200/45 focus:bg-white/10" />
    </label>
  );
}

function parseProductImageUrls(imageUrls: string) {
  return imageUrls
    .split(/\r?\n/)
    .map((image) => image.trim())
    .filter(Boolean);
}

function serializeProductImageUrls(images: string[]) {
  return images
    .map((image) => image.trim())
    .filter(Boolean)
    .slice(0, maxProductGalleryImages)
    .join("\n");
}

function compressImageForFirestore(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const maxSide = 980;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Image compression failed. Please try a different image."));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      let quality = 0.78;
      let dataUrl = canvas.toDataURL("image/webp", quality);
      const maxFirestoreImageLength = 450_000;

      while (dataUrl.length > maxFirestoreImageLength && quality > 0.34) {
        quality -= 0.08;
        dataUrl = canvas.toDataURL("image/webp", quality);
      }

      if (dataUrl.length > maxFirestoreImageLength) {
        reject(new Error("Image is still too large after compression. Please upload a smaller image."));
        return;
      }

      resolve(dataUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image could not be read. Please try another image."));
    };

    image.src = objectUrl;
  });
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

  if (lowerMessage.includes("storage/unauthorized")) {
    return 'Firebase Storage blocked this upload. Confirm your user document has role: "admin", then deploy Storage rules with firebase deploy --only storage.';
  }

  if (lowerMessage.includes("storage/canceled")) {
    return "Image upload was cancelled. Please try again.";
  }

  if (lowerMessage.includes("storage/retry-limit-exceeded") || lowerMessage.includes("network")) {
    return "Image upload could not finish because the connection was unstable. Try a smaller image or retry on a stronger connection.";
  }

  if (lowerMessage.includes("firestore is not configured")) {
    return "Firestore is not configured. Check your Firebase environment variables and restart the dev server.";
  }

  if (lowerMessage.includes("storage is not configured")) {
    return "Firebase Storage is not configured. Check your Firebase environment variables and restart the dev server.";
  }

  return message || "Admin action failed. Check Firebase configuration and try again.";
}

function clearProductCache() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem("rvsn-firestore-products-v1");
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
    return "rounded-full border border-red-300/30 bg-red-400/10 text-red-100";
  }

  if (status === "delivered") {
    return "rounded-full border border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "shipped") {
    return "rounded-full border border-sky-300/30 bg-sky-300/10 text-sky-100";
  }

  if (status === "approved" || status === "paid" || status === "processing") {
    return "rounded-full border border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "rounded-full border border-white/10 bg-white/8 text-violet-100/72";
}
