import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/site/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
};

/**
 * `suppressHydrationWarning` is required by next-themes: its blocking script writes
 * `data-theme` on `<html>` before React hydrates, which is exactly the mismatch the
 * warning is for, and exactly how the first paint avoids a flash.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            {/*
              The header is `fixed`, so the page scrolls *under* it — that is the
              whole point of the transparent-until-scrolled treatment (reference
              spec §1.5). The padding here is what keeps the first screen of every
              page out from behind it.
            */}
            <main className="flex-1 pt-site-header">{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
