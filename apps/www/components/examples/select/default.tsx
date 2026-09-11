"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/cubby/ui/select";

const PRIORITIES: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

/**
 * The third field of "New task": text-input and text-area take what a
 * person types, this takes what they pick — closed by default so a short
 * list never costs more room than the row it sits in.
 */
export default function SelectDefault() {
  return (
    <div className="flex w-comp-popover-menu flex-col gap-2">
      <span className="text-ui-md text-text-1">Priority</span>
      <Select defaultValue="medium">
        <SelectTrigger aria-label="Priority">
          <SelectValue placeholder="Pick a priority">
            {(value: string | null) => (value ? PRIORITIES[value] : "Pick a priority")}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(PRIORITIES).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
