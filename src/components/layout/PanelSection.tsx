import { useId, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PanelSectionProps {
  title: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
  contentClassName?: string
  children: ReactNode
}

/** Reusable panel block: uppercase muted label row + content. A div (not section) to avoid landmark noise. */
export function PanelSection({
  title,
  icon,
  action,
  className,
  contentClassName,
  children,
}: PanelSectionProps) {
  const id = useId()

  return (
    <div role="group" aria-labelledby={id} className={cn("border-b border-border last:border-b-0", className)}>
      <div className="flex h-9 items-center gap-2 px-4">
        {icon && (
          <span
            aria-hidden
            className="flex size-4 items-center justify-center text-muted-foreground [&_svg]:size-4"
          >
            {icon}
          </span>
        )}
        <h2 id={id} className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {title}
        </h2>
        {action && <div className="ml-auto flex items-center gap-2">{action}</div>}
      </div>
      <div className={cn("px-4 pb-4", contentClassName)}>{children}</div>
    </div>
  )
}
