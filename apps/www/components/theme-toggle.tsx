"use client";

import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { useTheme } from "next-themes";
import { Icon } from "@/registry/cubby/ui/icon";
import { IconButton } from "@/registry/cubby/ui/icon-button";

/**
 * Two states, one button. Dark is the canon, so the default is dark.
 *
 * Which glyph shows is decided by CSS from `data-theme` on `<html>`, not by React
 * state: next-themes writes that attribute from a blocking script before the first
 * paint, so the correct icon is already on screen with no mounted-flag, no effect and
 * no hydration mismatch. Nothing here renders off `resolvedTheme` — it is only read
 * inside the click handler, which by definition runs after hydration.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <IconButton
      variant="text"
      aria-label="Switch between the dark and the light theme"
      icon={
        <>
          <Icon icon={Sun03Icon} size="lg" className="[[data-theme='light']_&]:hidden" />
          <Icon
            icon={Moon02Icon}
            size="lg"
            className="hidden [[data-theme='light']_&]:block"
          />
        </>
      }
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
    />
  );
}
