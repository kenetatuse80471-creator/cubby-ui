"use client";

import { useEffect, useState } from "react";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";

import { demos } from "@/registry/cubby/demos";
import { Button } from "@/registry/cubby/ui/button";
import { Divider } from "@/registry/cubby/ui/divider";
import { Icon } from "@/registry/cubby/ui/icon";

type Theme = "dark" | "light";

function initialTheme(): Theme {
  const fromUrl = new URLSearchParams(window.location.search).get("theme");
  return fromUrl === "light" ? "light" : "dark";
}

export function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="min-h-screen bg-bg-app">
      <header className="flex items-center justify-between gap-4 px-6 py-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-heading-h2 text-text-1">Cubby UI — примитивы, партия A</h1>
          <p className="text-caption-sm text-text-2">
            Девять компонентов, все состояния. Тёмная тема — канон, светлая — черновик.
          </p>
        </div>
        <Button
          variant="secondary"
          iconStart={<Icon icon={theme === "dark" ? Sun03Icon : Moon02Icon} />}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "Светлая" : "Тёмная"}
        </Button>
      </header>

      <Divider />

      <main>
        {demos.map((demo) => (
          <section key={demo.name} data-demo={demo.name} className="bg-bg-app px-6 py-6">
            <div className="mb-6 flex items-baseline gap-3">
              <h2 className="text-heading-h3 text-text-1">{demo.title}</h2>
              <code className="text-caption-sm text-text-3">{demo.name}</code>
            </div>
            <demo.component />
          </section>
        ))}
      </main>
    </div>
  );
}
