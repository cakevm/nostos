import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white dark:ring-offset-slate-950 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/30 dark:focus-visible:ring-amber-400/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-amber-600/80 to-amber-700/80 dark:from-amber-700/40 dark:to-amber-800/40 text-white hover:from-amber-600 hover:to-amber-700 dark:hover:from-amber-700/50 dark:hover:to-amber-800/50 shadow-sm hover:shadow-md font-medium",
        destructive:
          "bg-red-600 dark:bg-red-900/60 text-white hover:bg-red-700 dark:hover:bg-red-800/60 shadow-sm",
        outline:
          "border border-slate-300 dark:border-slate-700/50 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/30 text-slate-700 dark:text-stone-300",
        secondary:
          "bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-stone-300 hover:bg-slate-200 dark:hover:bg-slate-900/50 border border-slate-200 dark:border-slate-800/30",
        ghost: "hover:bg-slate-100 dark:hover:bg-slate-800/30 text-slate-600 dark:text-stone-300/80",
        link: "text-amber-700 dark:text-amber-300/60 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }