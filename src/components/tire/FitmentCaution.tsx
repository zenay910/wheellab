import { WarningIcon } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { FITMENT_CAUTION_PERCENT, formatPercentDelta, type TireComparison } from "@/lib/tire"

/** Caution badge shown when overall diameter changes by more than ±3%. Text, not color alone. */
export function FitmentCaution({ comparison }: { comparison: TireComparison }) {
  if (!comparison.fitmentCaution) return null

  return (
    <Badge variant="destructive" className="h-auto py-1 whitespace-normal">
      <WarningIcon aria-hidden weight="fill" />
      Caution: diameter change &gt;{FITMENT_CAUTION_PERCENT}% (
      {formatPercentDelta(comparison.deltas.overallDiameterMm.percent, 1)})
    </Badge>
  )
}

/** Longer explanation for the data panel, rendered next to the badge. */
export function FitmentCautionDetail({ comparison }: { comparison: TireComparison }) {
  if (!comparison.fitmentCaution) return null

  return (
    <div className="flex flex-col items-start gap-2 pb-3">
      <FitmentCaution comparison={comparison} />
      <p className="text-xs/relaxed text-muted-foreground">
        The overall diameter differs from the original by more than {FITMENT_CAUTION_PERCENT}%.
        Speedometer error, gearing, and clearance may be noticeably affected. Verify with a
        qualified installer before changing sizes.
      </p>
    </div>
  )
}
