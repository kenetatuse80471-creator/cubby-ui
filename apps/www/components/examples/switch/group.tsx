"use client";

import { useState } from "react";
import { Divider } from "@/registry/cubby/ui/divider";
import { Switch } from "@/registry/cubby/ui/switch";

const CHANNELS = [
  { id: "mentions", label: "Mentions", hint: "Someone writes your name in a task." },
  { id: "assigned", label: "Assigned to me", hint: "A task lands on you." },
  { id: "digest", label: "Weekly digest", hint: "Monday morning, one letter." },
] as const;

type ChannelId = (typeof CHANNELS)[number]["id"];

/**
 * Several switches in one block: a divider between the rows rather than a gap alone,
 * so a hint cannot be read as belonging to the row below it.
 */
export default function SwitchGroup() {
  const [on, setOn] = useState<Record<ChannelId, boolean>>({
    mentions: true,
    assigned: true,
    digest: false,
  });

  return (
    <div className="flex w-full flex-col">
      {CHANNELS.map((channel, index) => (
        <div key={channel.id} className="flex flex-col gap-1">
          {index > 0 ? <Divider tone="film" className="mb-3" /> : null}
          <label className="flex items-center justify-between gap-5">
            <span className="text-ui-md text-text-1">{channel.label}</span>
            <Switch
              checked={on[channel.id]}
              onCheckedChange={(checked) => setOn((state) => ({ ...state, [channel.id]: checked }))}
            />
          </label>
          <p className="pb-3 text-caption-sm text-text-2">{channel.hint}</p>
        </div>
      ))}
    </div>
  );
}
