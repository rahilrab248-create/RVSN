"use client";

import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useAuthPrompt } from "@/contexts/auth-prompt-context";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useCurrency } from "@/hooks/use-currency";

const cartCheckoutButtonClassName =
  "mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-extrabold !text-[#05030b] shadow-[0_12px_34px_rgba(255,255,255,0.08)] transition hover:bg-violet-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200";

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
            className="fixed inset-0 z-50 bg-black/58 backdrop-blur-md"
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
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[440px] flex-col border-l border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.03)),radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.2),transparent_22rem),#05030b] text-white shadow-2xl shadow-black/60 backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-violet-100/55">Cart</p>
                <h2 className="mt-1 text-2xl font-normal tracking-[-0.05em] text-white">{itemCount} items</h2>
              </div>
              <button
                className="grid size-10 place-items-center rounded-[14px] border border-white/12 bg-white/[0.07] text-white transition hover:border-white/35 hover:bg-white/[0.14]"
                onClick={closeCart}
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5" data-lenis-prevent>
              {items.length ? (
                <motion.div className="grid gap-4">
                  {items.map((item, index) => (
                    <motion.article
                      key={item.id}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 18 }}
                      transition={{ duration: 0.28, delay: index * 0.04 }}
                      className="grid grid-cols-[92px_1fr] gap-4 rounded-[18px] border border-white/10 bg-white/[0.055] p-3 shadow-lg shadow-black/20 backdrop-blur-xl"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-[12px] bg-white/[0.08]">
                        <Image src={item.image} alt={item.title} fill sizes="92px" className="object-contain p-1.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-100/45">
                              {item.brand}
                            </p>
                            <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-white">{item.title}</h3>
                          </div>
                          <button
                            className="grid size-8 shrink-0 place-items-center rounded-full text-white/45 transition hover:bg-red-500/12 hover:text-red-200"
                            onClick={() => void removeItem(item.id)}
                            aria-label={`Remove ${item.title}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold text-white/45">Size {item.size}</p>
                          <p className="text-sm font-semibold text-white">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                        <div className="mt-3 inline-flex items-center overflow-hidden rounded-full border border-white/12 bg-white/[0.06]">
                          <button
                            className="grid size-9 place-items-center text-white transition hover:bg-white/10"
                            onClick={() => void updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={15} />
                          </button>
                          <span className="grid h-9 min-w-10 place-items-center border-x border-white/10 text-sm font-semibold text-white">
                            {item.quantity}
                          </span>
                          <button
                            className="grid size-9 place-items-center text-white transition hover:bg-white/10"
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
                    <span className="mx-auto grid size-16 place-items-center rounded-full border border-white/12 bg-white/[0.08] text-violet-100 shadow-[0_0_60px_rgba(124,58,237,0.22)]">
                      <ShoppingBag size={26} />
                    </span>
                    <h3 className="mt-5 text-xl font-normal tracking-[-0.04em] text-white">Your cart is empty</h3>
                    <p className="mt-2 text-sm text-white/52">Add a jersey, boot, or training essential to start.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 bg-black/18 p-5">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between text-white/55">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/55">
                  <span>Estimated shipping</span>
                  <span className="font-semibold text-white">{formatPrice(shipping)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-white/10 pt-3 text-lg font-semibold text-white">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              {items.length && isAuthenticated ? (
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className={cartCheckoutButtonClassName}
                >
                  Checkout
                </Link>
              ) : items.length ? (
                <button
                  className={cartCheckoutButtonClassName}
                  onClick={() => openAuthPrompt("To place the order, please login or sign up first.")}
                >
                  Checkout
                </button>
              ) : (
                <button
                  className="mt-5 inline-flex h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-white px-5 text-sm font-extrabold !text-[#05030b] opacity-45"
                  disabled
                >
                  Checkout
                </button>
              )}
              {items.length ? (
                <button
                  className="mt-3 h-10 w-full text-sm font-semibold text-white/45 transition hover:text-red-200"
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
