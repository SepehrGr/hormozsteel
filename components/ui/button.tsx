import type { ComponentProps } from 'react'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-[color,background-color,opacity] duration-200 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:opacity-90',
        outline:
          'border border-border bg-background text-foreground hover:bg-muted',
        danger: 'bg-red-700 text-white hover:opacity-90 dark:bg-red-600',
        'danger-outline':
          'border border-border bg-background text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40',
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        link: 'text-foreground underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'px-4 py-2',
        lg: 'px-5 py-2.5',
        icon: 'h-8 w-8 shrink-0',
        'icon-lg': 'h-10 w-10 shrink-0',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Render the single child (e.g. a `<Link>`) with button styling. */
    asChild?: boolean
  }

/**
 * The one button. Icon-only buttons still need an `aria-label`.
 *
 * ```tsx
 * <Button variant='outline' size='icon' aria-label='Edit'><Edit /></Button>
 * <Button asChild><Link href='/x'>Go</Link></Button>
 * ```
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  type = 'button',
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      type={asChild ? undefined : type}
      {...props}
    />
  )
}

export { Button, buttonVariants }
