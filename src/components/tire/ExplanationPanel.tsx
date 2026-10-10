import {
  formatLength,
  formatPercentDelta,
  formatTireSize,
  type TireComparison,
} from "@/lib/tire"

/** Short formulas with live substituted values (demo-friendly; not a full T19 spec sheet). */
export function ExplanationPanel({ comparison }: { comparison: TireComparison }) {
  const o = comparison.original
  const p = comparison.proposed

  return (
    <dl className="flex flex-col gap-2 text-xs/relaxed text-muted-foreground">
      <Row
        term="Sidewall"
        detail={`${o.size.width} × ${o.size.aspect}% = ${formatLength(o.sidewallMm, "metric")} (original); ${p.size.width} × ${p.size.aspect}% = ${formatLength(p.sidewallMm, "metric")} (proposed).`}
      />
      <Row
        term="Overall diameter"
        detail={`Rim + 2 × sidewall → ${formatLength(o.overallDiameterMm, "metric")} vs ${formatLength(p.overallDiameterMm, "metric")} (${formatPercentDelta(comparison.deltas.overallDiameterMm.percent, 2)}).`}
      />
      <Row
        term="Circumference ratio"
        detail={`C_proposed ÷ C_original = ${comparison.speedRatio.toFixed(5)} → speedometer/odometer error ${formatPercentDelta(comparison.readingErrorPercent, 2)}.`}
      />
      <Row
        term="Assumptions"
        detail={`Nominal unloaded sizes; speedometer calibrated for ${formatTireSize(o.size)}. Loaded-radius effects are not modeled.`}
      />
    </dl>
  )
}

function Row({ term, detail }: { term: string; detail: string }) {
  return (
    <div>
      <dt className="font-medium text-foreground">{term}</dt>
      <dd>{detail}</dd>
    </div>
  )
}
