import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * shadcn-style class name combiner. Merges Tailwind utility classes while
 * removing conflicts (e.g. `p-2 p-4` becomes `p-4`).
 *
 * Extended to recognize our custom typography size tokens from `globals.css`
 * (`text-default`, `text-meta`, etc.). Without this, `tailwind-merge` treats
 * `text-default` as a `text-*` color class and strips `text-white` from
 * Button variants like `primary`, causing the text to render in the page's
 * inherited body color (dark navy) instead of white.
 */
const twMerge = extendTailwindMerge({
  extend: {
      classGroups: {
        "font-size": [
          { text: ["default", "meta", "lead", "body", "subheading", "card-title", "section", "page-title", "hero"] },
        ],
      },
    },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
