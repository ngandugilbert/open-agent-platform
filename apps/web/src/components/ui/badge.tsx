import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary-hover transform hover:scale-105 transition-transform",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary-hover transform hover:scale-105 transition-transform",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive-hover focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 transform hover:scale-105 transition-transform",
        outline:
          "border-input text-foreground hover:border-primary hover:text-primary [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        accent:
          "border-transparent bg-accent text-accent-foreground [a&]:hover:bg-accent-hover transform hover:scale-105 transition-transform",
        info:
          "border-purple-500 bg-purple-50 text-purple-600 [a&]:hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800",
        success:
          "border-green-500 bg-green-50 text-green-600 [a&]:hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:border-green-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
