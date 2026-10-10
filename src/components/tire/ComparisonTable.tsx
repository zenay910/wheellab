import {
  formatLengthDeltaValue,
  formatLengthValue,
  formatNumber,
  formatPercentDelta,
  formatSigned,
  lengthUnit,
  type DimensionKey,
  type TireComparison,
  type UnitSystem,
} from "@/lib/tire"

interface Row {
  label: string
  unit: string
  original: string
  proposed: string
  delta: string
  percent?: string
}

type LengthKey = Extract<
  DimensionKey,
  "sectionWidthMm" | "sidewallMm" | "rimDiameterMm" | "overallDiameterMm" | "circumferenceMm"
>

function lengthRow(
  comparison: TireComparison,
  system: UnitSystem,
  label: string,
  key: LengthKey,
): Row {
  const d = comparison.deltas[key]
  return {
    label,
    unit: lengthUnit(system),
    original: formatLengthValue(comparison.original[key], system),
    proposed: formatLengthValue(comparison.proposed[key], system),
    delta: formatLengthDeltaValue(d.absolute, system),
    percent: formatPercentDelta(d.percent),
  }
}

function buildRows(comparison: TireComparison, system: UnitSystem): Row[] {
  const revKey = system === "metric" ? "revsPerKm" : "revsPerMile"
  const revDelta = comparison.deltas[revKey]

  return [
    // Section width is always read in mm, like the size string (DESIGN.md, Units).
    lengthRow(comparison, "metric", "Section width", "sectionWidthMm"),
    lengthRow(comparison, system, "Sidewall height", "sidewallMm"),
    lengthRow(comparison, system, "Rim diameter", "rimDiameterMm"),
    lengthRow(comparison, system, "Overall diameter", "overallDiameterMm"),
    lengthRow(comparison, system, "Circumference", "circumferenceMm"),
    {
      label: "Revolutions",
      unit: system === "metric" ? "rev/km" : "rev/mi",
      original: formatNumber(comparison.original[revKey], 1),
      proposed: formatNumber(comparison.proposed[revKey], 1),
      delta: formatSigned(revDelta.absolute, 1),
      percent: formatPercentDelta(revDelta.percent),
    },
    {
      label: "Ride height",
      unit: `${lengthUnit(system)}, per corner`,
      original: "—",
      proposed: "—",
      delta: formatLengthDeltaValue(comparison.rideHeightChangeMm, system),
    },
  ]
}

interface ComparisonTableProps {
  comparison: TireComparison
  units: UnitSystem
}

/** Differences are proposed minus original; percent is relative to the original. */
export function ComparisonTable({ comparison, units }: ComparisonTableProps) {
  const rows = buildRows(comparison, units)

  return (
    <table className="w-full table-fixed border-collapse text-xs tabular-nums">
      <caption className="sr-only">
        Original and proposed tire dimensions with differences (proposed minus original)
      </caption>
      <colgroup>
        <col />
        <col className="w-[3.25rem] sm:w-16" />
        <col className="w-[3.25rem] sm:w-16" />
        <col className="w-[3.75rem] sm:w-[4.5rem]" />
      </colgroup>
      <thead>
        <tr className="text-muted-foreground uppercase">
          <th scope="col" className="pb-1 text-left font-normal">
            <span className="sr-only">Dimension</span>
          </th>
          <th scope="col" className="pb-1 text-right font-normal">
            Original
          </th>
          <th scope="col" className="pb-1 text-right font-normal text-proposed">
            Proposed
          </th>
          <th scope="col" className="pb-1 text-right font-normal">
            Δ
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-b border-border align-top">
            <th scope="row" className="py-1.5 pr-2 text-left font-normal">
              <span className="block">{row.label}</span>
              <span className="block text-muted-foreground">{row.unit}</span>
            </th>
            <td className="py-1.5 text-right text-muted-foreground">{row.original}</td>
            <td className="py-1.5 text-right">{row.proposed}</td>
            <td className="py-1.5 text-right">
              <span className="block">{row.delta}</span>
              {row.percent && <span className="block text-muted-foreground">{row.percent}</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
