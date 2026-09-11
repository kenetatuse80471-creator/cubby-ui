import { Avatar } from "@/registry/cubby/ui/avatar";

const ASSIGNEES = [
  { name: "Mira Chen", initials: "MC", tone: "blue" as const },
  { name: "Noah Ito", initials: "NI", tone: "green" as const },
  { name: "Priya Rao", initials: "PR", tone: "purple" as const },
];

/**
 * Three people on one task: each avatar overlaps the last and wears a ring
 * the colour of the surface behind it, so the stack reads as one shape
 * instead of three circles that happen to touch.
 */
export default function AvatarDefault() {
  return (
    <div className="flex items-center">
      {ASSIGNEES.map((person, index) => (
        <Avatar
          key={person.name}
          name={person.name}
          initials={person.initials}
          tone={person.tone}
          className={
            index === 0
              ? "shadow-[0_0_0_var(--avatar-ring)_var(--bg-surface)]"
              : "ml-avatar-overlap shadow-[0_0_0_var(--avatar-ring)_var(--bg-surface)]"
          }
        />
      ))}
    </div>
  );
}
