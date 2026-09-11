"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/cubby/ui/select";

const STATUSES: Record<string, string> = {
  todo: "To do",
  doing: "In progress",
  done: "Done",
};

/**
 * PLACEHOLDER — renders, but it is not yet a product example.
 * NEXT EXECUTOR: replace with one short, real use, the way `button/default.tsx` is written.
 */
export default function SelectDefault() {
  return (
    <div className="w-comp-popover-menu">
      <Select defaultValue="doing">
        <SelectTrigger aria-label="Status">
          <SelectValue placeholder="Pick a status">
            {(value: string | null) => (value ? STATUSES[value] : "Pick a status")}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(STATUSES).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
