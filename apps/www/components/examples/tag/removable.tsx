"use client";

import { useState } from "react";
import { Tag } from "@/registry/cubby/ui/tag";

const ALL_FILTERS = [
  { id: "design", label: "Design", tone: "purple" as const },
  { id: "urgent", label: "Urgent", tone: "red" as const },
  { id: "this-week", label: "This week", tone: "blue" as const },
];

/**
 * A filter bar's own chips: the cross is the only way to clear one, so
 * pressing it has to actually remove the filter, not just look like it does.
 */
export default function TagRemovable() {
  const [filters, setFilters] = useState(ALL_FILTERS);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.length > 0 ? (
        filters.map((filter) => (
          <Tag
            key={filter.id}
            tone={filter.tone}
            removeLabel={`Remove ${filter.label} filter`}
            onRemove={() => setFilters((current) => current.filter((item) => item.id !== filter.id))}
          >
            {filter.label}
          </Tag>
        ))
      ) : (
        <span className="text-caption-sm text-text-2">No filters applied</span>
      )}
    </div>
  );
}
