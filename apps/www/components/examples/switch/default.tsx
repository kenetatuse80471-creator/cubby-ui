"use client";

import { useState } from "react";
import { Switch } from "@/registry/cubby/ui/switch";

/**
 * A settings row. The `<label>` holds the name and the control, so the whole line is
 * the hit area; the hint stays outside it, because a hint is not part of the thing's
 * name. The change is applied the moment it is made — there is no Save button next
 * to a switch.
 */
export default function SwitchDefault() {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="flex w-full flex-col gap-1">
      <label className="flex items-center justify-between gap-5">
        <span className="text-ui-md text-text-1">Email notifications</span>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </label>
      <p className="text-caption-sm text-text-2">A digest once a day, never more.</p>
    </div>
  );
}
