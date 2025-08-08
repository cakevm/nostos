import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-slate-300 dark:border-slate-700/30 bg-white dark:bg-slate-900/30 px-3 py-2 text-sm text-slate-700 dark:text-stone-200 ring-offset-white dark:ring-offset-slate-950 placeholder:text-slate-400 dark:placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/30 dark:focus-visible:ring-amber-400/20 focus-visible:border-amber-600/50 dark:focus-visible:border-amber-400/30 transition-all disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }