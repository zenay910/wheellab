import type { ReactNode } from "react"
import { TireIcon } from "@phosphor-icons/react"

interface ComparisonStageProps {
  /** Accessible description of what the stage shows (sizes, later the view mode). */
  label: string
  /** Short caption under the empty state, e.g. "205/55R16 vs 225/45R17". */
  caption?: string
  legend?: ReactNode
  /** View controls (T18). */
  toolbar?: ReactNode
  /** Scale bar / caution (T11, T12). */
  status?: ReactNode
  /** 2D silhouette (T11) or 3D scene (T13). Defaults to the empty state. */
  children?: ReactNode
}

export function ComparisonStage({
  label,
  caption,
  legend,
  toolbar,
  status,
  children,
}: ComparisonStageProps) {
  return (
    <section aria-label={label} className="absolute inset-0 overflow-hidden bg-stage">
      {children ?? <StageEmptyState caption={caption} />}

      {legend && (
        <div className="pointer-events-none absolute top-3 left-3 flex flex-col gap-1 text-xs">
          {legend}
        </div>
      )}
      {toolbar && <div className="absolute top-3 right-3">{toolbar}</div>}
      {status && <div className="absolute bottom-3 left-3">{status}</div>}
    </section>
  )
}

function StageEmptyState({ caption }: { caption?: string }) {
  return (
    <>
      <div className="absolute inset-x-0 top-0 bottom-[22%] flex flex-col items-center justify-center gap-2">
        <TireIcon aria-hidden weight="light" className="size-8 text-muted-foreground/50" />
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Comparison view
        </p>
        {caption && <p className="text-xs text-muted-foreground tabular-nums">{caption}</p>}
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-[22%] border-t border-dashed border-border">
        <span className="absolute top-1 right-3 text-xs text-muted-foreground uppercase">
          Ground
        </span>
      </div>
    </>
  )
}
