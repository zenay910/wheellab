import { cn } from "@/lib/utils"

interface TireSwatchProps {
  tire: "original" | "proposed"
  className?: string
}

/** Hollow = original, filled accent = proposed, so identity never relies on color alone. */
export function TireSwatch({ tire, className }: TireSwatchProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-2.5 shrink-0",
        tire === "original" ? "border border-muted-foreground" : "bg-proposed",
        className,
      )}
    />
  )
}
