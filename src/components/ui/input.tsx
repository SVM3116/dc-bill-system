import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        data-slot="input"
        className={cn(
          "h-8 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-base transition-colors outline-none placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-1 aria-invalid:ring-red-500 md:text-sm dark:border-slate-800 dark:bg-slate-950 dark:focus-visible:border-blue-500 dark:aria-invalid:border-red-500",
          className
        )}
        {...props}
        type={type}
        ref={ref}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
