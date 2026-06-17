"use client";

import { ThemeProvider } from "next-themes";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CursorEffect } from "@/components/layout/cursor-effect";
import { PageEntry } from "@/components/layout/page-entry";
import { AuthPromptProvider } from "@/contexts/auth-prompt-context";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import { CurrencyProvider } from "@/contexts/currency-context";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <AuthProvider>
        <AuthPromptProvider>
          <CurrencyProvider>
            <CartProvider>
              <CursorEffect />
              <PageEntry>{children}</PageEntry>
              <CartDrawer />
            </CartProvider>
          </CurrencyProvider>
        </AuthPromptProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
