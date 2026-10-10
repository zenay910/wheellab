import { useId, useState } from "react"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  actualDistance,
  actualSpeed,
  formatDistance,
  formatNumber,
  formatPercentDelta,
  formatSpeed,
  type TireComparison,
  type UnitSystem,
} from "@/lib/tire"

const SPEED_RANGE: Record<UnitSystem, { min: number; max: number; step: number }> = {
  imperial: { min: 10, max: 120, step: 5 },
  metric: { min: 20, max: 200, step: 5 },
}

/** Indicated odometer distance used for the "per 100" readout. */
const ODOMETER_REFERENCE = 100

interface SpeedometerPanelProps {
  comparison: TireComparison
  units: UnitSystem
}

export function SpeedometerPanel({ comparison, units }: SpeedometerPanelProps) {
  const labelId = useId()
  // Each system keeps its own value so toggling units never produces odd numbers (96.56 km/h).
  const [indicated, setIndicated] = useState<Record<UnitSystem, number>>({
    imperial: 60,
    metric: 100,
  })
  const range = SPEED_RANGE[units]
  const indicatedSpeed = indicated[units]
  const errorPercent = comparison.readingErrorPercent

  const summary =
    Math.abs(errorPercent) < 0.005
      ? "With the proposed tires, the speedometer and odometer read the same as with the original."
      : errorPercent > 0
        ? "With the proposed tires, the vehicle travels faster and farther than the speedometer and odometer indicate."
        : "With the proposed tires, the vehicle travels slower and a shorter distance than the speedometer and odometer indicate."

  return (
    <div className="flex flex-col gap-3 text-xs">
      {/* Radix only exposes labelling on the thumb, so the group carries the accessible name. */}
      <div role="group" aria-labelledby={labelId} className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label id={labelId} className="text-muted-foreground">
            Indicated speed
          </Label>
          <span className="tabular-nums">{formatSpeed(indicatedSpeed, units, 0)}</span>
        </div>
        <Slider
          min={range.min}
          max={range.max}
          step={range.step}
          value={[indicatedSpeed]}
          onValueChange={([value]) => setIndicated((prev) => ({ ...prev, [units]: value }))}
        />
      </div>

      <dl className="flex flex-col">
        <Readout
          label="Actual speed"
          value={formatSpeed(actualSpeed(comparison, indicatedSpeed), units, 1)}
          emphasized
        />
        <Readout label="Speedometer error" value={formatPercentDelta(errorPercent)} />
        <Readout
          label={`Odometer shows ${formatNumber(ODOMETER_REFERENCE, 0)} ${units === "metric" ? "km" : "mi"}`}
          value={`Actual ${formatDistance(actualDistance(comparison, ODOMETER_REFERENCE), units, 1)}`}
        />
      </dl>

      <p className="text-xs/relaxed text-muted-foreground">
        {summary} Assumes the speedometer was calibrated for the original size.
      </p>
    </div>
  )
}

function Readout({
  label,
  value,
  emphasized,
}: {
  label: string
  value: string
  emphasized?: boolean
}) {
  return (
    <div className="flex min-h-8 items-center justify-between gap-2 border-b border-border">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={emphasized ? "text-sm tabular-nums" : "tabular-nums"}>{value}</dd>
    </div>
  )
}
