import type { ReactNode } from "react"
import { CheckCircleIcon, WarningIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  FITMENT_CAUTION_PERCENT,
  actualSpeed,
  formatLength,
  formatPercentDelta,
  formatSpeed,
  type TireComparison,
  type UnitSystem,
} from "@/lib/tire"
import { cn } from "@/lib/utils"

interface SimpleSummaryProps {
  comparison: TireComparison
  units: UnitSystem
  onShowDetails: () => void
}

/** Changes smaller than this read as "the same" in plain language. */
const SAME_MM = 0.5
const INDICATED_SPEED: Record<UnitSystem, number> = { imperial: 60, metric: 100 }

/** Plain-language answer to "will this size work, and what changes?" */
export function SimpleSummary({ comparison, units, onShowDetails }: SimpleSummaryProps) {
  const { original: o, proposed: p, deltas } = comparison
  const diameter = deltas.overallDiameterMm
  const indicated = INDICATED_SPEED[units]
  const actual = actualSpeed(comparison, indicated)

  return (
    <div className="flex flex-col gap-4 text-xs">
      <Verdict comparison={comparison} />

      <dl className="flex flex-col">
        <Fact
          label="Overall height"
          value={change(diameter.absolute, units, "taller", "shorter", "Same height")}
          detail={`${formatLength(o.overallDiameterMm, units)} → ${formatLength(p.overallDiameterMm, units)} (${formatPercentDelta(diameter.percent, 1)})`}
        />
        <Fact
          label="Tread width"
          value={change(deltas.sectionWidthMm.absolute, units, "wider", "narrower", "Same width")}
          detail={`${formatLength(o.sectionWidthMm, units)} → ${formatLength(p.sectionWidthMm, units)}`}
        />
        <Fact
          label="Ride height"
          value={change(comparison.rideHeightChangeMm, units, "higher", "lower", "No change")}
          detail="Approximate change at each corner of the vehicle"
        />
        <Fact
          label="Speedometer"
          value={
            Math.abs(actual - indicated) < 0.05
              ? "Reads correctly"
              : `${formatSpeed(indicated, units, 0)} shown = ${formatSpeed(actual, units, 1)} actual`
          }
          detail="Assumes the speedometer was calibrated for the original size"
        />
      </dl>

      <Button variant="outline" size="sm" className="self-start" onClick={onShowDetails}>
        Show full details
      </Button>
    </div>
  )
}

function change(
  deltaMm: number,
  units: UnitSystem,
  up: string,
  down: string,
  same: string,
): string {
  if (Math.abs(deltaMm) < SAME_MM) return same
  return `${formatLength(Math.abs(deltaMm), units)} ${deltaMm > 0 ? up : down}`
}

function Verdict({ comparison }: { comparison: TireComparison }) {
  const percent = formatPercentDelta(comparison.deltas.overallDiameterMm.percent, 1)
  const caution = comparison.fitmentCaution

  return (
    <div
      className={cn(
        "flex gap-3 border p-3",
        caution ? "border-destructive/40 bg-destructive/10" : "border-proposed/40 bg-proposed/10",
      )}
    >
      <span aria-hidden className={cn("mt-0.5", caution ? "text-destructive" : "text-proposed")}>
        {caution ? <WarningIcon weight="fill" className="size-5" /> : <CheckCircleIcon weight="fill" className="size-5" />}
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{caution ? "Big size change" : "Close match"}</p>
        <p className="text-xs/relaxed text-muted-foreground">
          {caution ? (
            <>
              Overall diameter changes by {percent}, beyond the common ±{FITMENT_CAUTION_PERCENT}%
              guideline. Expect speedometer error and check clearance with an installer.
            </>
          ) : (
            <>
              Overall diameter changes by {percent}, within the common ±{FITMENT_CAUTION_PERCENT}%
              guideline for a replacement size.
            </>
          )}
        </p>
      </div>
    </div>
  )
}

function Fact({ label, value, detail }: { label: string; value: ReactNode; detail: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-2.5 first:pt-0">
      <dt className="text-[10px] tracking-wider text-muted-foreground uppercase">{label}</dt>
      <dd className="text-sm tabular-nums">{value}</dd>
      <dd className="text-muted-foreground tabular-nums">{detail}</dd>
    </div>
  )
}
