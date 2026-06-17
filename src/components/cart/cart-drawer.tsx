"use client";

import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useAuthPrompt } from "@/contexts/auth-prompt-context";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useCurrency } from "@/hooks/use-currency";

export function CartDrawer() {
  const { items, isCartOpen, closeCart, removeItem, updateQuantity, subtotal, clearCart, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const { openAuthPrompt } = useAuthPrompt();
  const { formatPrice } = useCurrency();
  const shipping = subtotal > 0 ? 15 : 0;
  const total = subtotal + shipping;

  return (
    <AnimatePresence>
      {isCartOpen ? (
        <>
          <motion.button
            aria-label="Close cart"
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[440px] flex-col border-l border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Cart</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">{itemCount} items</h2>
              </div>
              <button
                className="grid size-10 place-items-center border border-slate-200 bg-slate-50 text-slate-950"
                onClick={closeCart}
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length ? (
                <motion.div className="grid gap-4">
                  {items.map((item, index) => (
                    <motion.article
                      key={item.id}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 18 }}
                      transition={{ duration: 0.28, delay: index * 0.04 }}
                      className="grid grid-cols-[92px_1fr] gap-4 border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="relative aspect-square overflow-hidden bg-white">
                        <Image src={item.image} alt={item.title} fill sizes="92px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                              {item.brand}
                            </p>
                            <h3 className="mt-1 line-clamp-2 text-sm font-black text-slate-950">{item.title}</h3>
                          </div>
                          <button
                            className="grid size-8 shrink-0 place-items-center text-slate-500 transition hover:text-red-600"
                            onClick={() => void removeItem(item.id)}
                            aria-label={`Remove ${item.title}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold text-slate-500">Size {item.size}</p>
                          <p className="text-sm font-black text-slate-950">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                        <div className="mt-3 inline-flex items-center border border-slate-200 bg-white">
                          <button
                            className="grid size-9 place-items-center text-slate-950"
                            onClick={() => void updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={15} />
                          </button>
                          <span className="grid h-9 min-w-10 place-items-center border-x border-slate-200 text-sm font-bold text-slate-950">
                            {item.quantity}
                          </span>
                          <button
                            className="grid size-9 place-items-center text-slate-950"
                            onClick={() => void updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              ) : (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <span className="mx-auto grid size-16 place-items-center rounded-full bg-lime-200 text-slate-950">
                      <ShoppingBag size={26} />
                    </span>
                    <h3 className="mt-5 text-xl font-black text-slate-950">Your cart is empty</h3>
                    <p className="mt-2 text-sm text-slate-600">Add a jersey, boot, or training essential to start.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 p-5">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-950">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated shipping</span>
                  <span className="font-bold text-slate-950">{formatPrice(shipping)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 text-lg font-black text-slate-950">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              {items.length && isAuthenticated ? (
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="mt-5 grid h-12 w-full place-items-center bg-slate-950 text-sm font-extrabold text-white transition hover:bg-lime-500 hover:text-slate-950"
                >
                  Checkout
                </Link>
              ) : items.length ? (
                <button
                  className="mt-5 h-12 w-full bg-slate-950 text-sm font-extrabold text-white transition hover:bg-lime-500 hover:text-slate-950"
                  onClick={() => openAuthPrompt("To place the order, please login or sign up first.")}
                >
                  Checkout
                </button>
              ) : (
                <button
                  className="mt-5 h-12 w-full cursor-not-allowed bg-slate-950 text-sm font-extrabold text-white opacity-50"
                  disabled
                >
                  Checkout
                </button>
              )}
              {items.length ? (
                <button
                  className="mt-3 h-10 w-full text-sm font-semibold text-slate-500 transition hover:text-red-600"
                  onClick={() => void clearCart()}
                >
                  Clear cart
                </button>
              ) : null}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
