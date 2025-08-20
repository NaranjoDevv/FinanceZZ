import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "brutal-input h-12 font-medium border-black w-full px-4 py-3 bg-white text-black placeholder:text-gray-500 transition-all duration-200 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "focus:ring-2 focus:ring-black focus:border-black",
        "aria-invalid:ring-red-500 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Input }
