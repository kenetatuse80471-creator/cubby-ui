"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/registry/cubby/ui/button";

/**
 * Waiting for the server. The label stays put, the leading icon slot becomes a
 * spinner and the button stops reacting — so the row never changes width and the
 * same press cannot be sent twice.
 */
export default function ButtonLoading() {
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <Button
      variant="primary"
      loading={saving}
      onClick={() => {
        setSaving(true);
        timer.current = setTimeout(() => setSaving(false), 1600);
      }}
    >
      Save changes
    </Button>
  );
}
