"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/registry/cubby/ui/tabs";

interface Board {
  value: string;
  label: string;
  /** Archive carries no count — nothing there is waiting for anyone. */
  count?: number;
  body: string;
}

const BOARDS: Board[] = [
  { value: "active", label: "Active", count: 27, body: "Everything a person is working on now." },
  { value: "backlog", label: "Backlog", count: 112, body: "Not scheduled yet, not forgotten either." },
  { value: "archive", label: "Archive", body: "Closed boards, kept for the record." },
];

/**
 * The board switcher of a task tracker: a count next to the name, because the number
 * is the reason a person picks one board over another.
 */
export default function TabsDefault() {
  const [value, setValue] = useState<string>("active");

  return (
    <div className="flex w-full flex-col gap-4">
      <Tabs value={value} onValueChange={(next) => setValue(String(next))}>
        <TabsList>
          {BOARDS.map((board) => (
            <TabsTab key={board.value} value={board.value} count={board.count}>
              {board.label}
            </TabsTab>
          ))}
        </TabsList>
        {BOARDS.map((board) => (
          <TabsPanel key={board.value} value={board.value} className="pt-3">
            <p className="text-body-md text-text-body">{board.body}</p>
          </TabsPanel>
        ))}
      </Tabs>
    </div>
  );
}
