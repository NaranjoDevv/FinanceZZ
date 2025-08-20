import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "brutal-button inline-flex items-center justify-center gap-2 whitespace-nowrap font-black uppercase tracking-wide transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none border-black",
  {
    variants: {
      variant: {
        default:
          "bg-white text-black border-black hover:bg-black hover:text-white",
        destructive:
        "bg-red-500 text-white border-red-500 hover:bg-red-600",
        outline:
        "border-black bg-white hover:bg-black hover:text-white",
        secondary:
          "bg-gray-100 text-black border-black hover:bg-black hover:text-white",
        ghost:
        "border-transparent hover:bg-black hover:text-white hover:border-black",
        link: "text-black underline-offset-4 hover:underline border-transparent",
      },
      size: {
        default: "h-12 px-4 py-3 has-[>svg]:px-3",
        sm: "h-10 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-14 px-6 has-[>svg]:px-4",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
