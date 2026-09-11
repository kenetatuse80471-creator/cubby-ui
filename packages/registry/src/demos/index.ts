import type { Demo } from "@/registry/cubby/demos/demo";

import * as avatar from "@/registry/cubby/demos/avatar-demo";
import * as button from "@/registry/cubby/demos/button-demo";
import * as divider from "@/registry/cubby/demos/divider-demo";
import * as emptyState from "@/registry/cubby/demos/empty-state-demo";
import * as icon from "@/registry/cubby/demos/icon-demo";
import * as iconButton from "@/registry/cubby/demos/icon-button-demo";
import * as spinner from "@/registry/cubby/demos/spinner-demo";
import * as switchDemo from "@/registry/cubby/demos/switch-demo";
import * as tag from "@/registry/cubby/demos/tag-demo";

/** Order of the page: the foundation first, the composed ones last. */
export const demos: Demo[] = [
  icon,
  button,
  iconButton,
  tag,
  divider,
  avatar,
  spinner,
  emptyState,
  switchDemo,
];

export type { Demo };
