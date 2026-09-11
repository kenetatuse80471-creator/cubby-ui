"use client";

import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/registry/cubby/ui/icon";
import { IconButton } from "@/registry/cubby/ui/icon-button";

/** Copies the text it is given and says so for two seconds. */
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <IconButton
      variant="text"
      size="compact"
      aria-label={copied ? "Copied" : label}
      icon={<Icon icon={copied ? Tick02Icon : Copy01Icon} />}
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          timer.current = setTimeout(() => setCopied(false), 2000);
        });
      }}
    />
  );
}
