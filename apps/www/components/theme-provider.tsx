"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Dark is the canon and the `:root` default of the tokens, light is an override on
 * `[data-theme="light"]` — so `attribute="data-theme"` is not a preference here, it
 * is what the token files are written against.
 *
 * `enableSystem` is off on purpose: the library has an opinion about which theme it
 * was designed in, and the toggle is one click away. next-themes writes the
 * attribute from a blocking inline script, so the first paint is already correct
 * and there is no flash — which is also why `<html>` needs `suppressHydrationWarning`.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
