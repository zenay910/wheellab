import { useState } from "react"
import { FunctionIcon, GaugeIcon, TableIcon } from "@phosphor-icons/react"

import { AppHeader } from "@/components/layout/AppHeader"
import { AppShell } from "@/components/layout/AppShell"
import { ComparisonStage } from "@/components/layout/ComparisonStage"
import { ControlRail } from "@/components/layout/ControlRail"
import { PanelSection } from "@/components/layout/PanelSection"
import { FitmentDisclaimer } from "@/components/tire/FitmentDisclaimer"
import { TireSwatch } from "@/components/tire/TireSwatch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  DEFAULT_ORIGINAL,
  DEFAULT_PROPOSED,
  formatTireSize,
  type TireSize,
  type UnitSystem,
} from "@/lib/tire"

const COMPARISON_ROWS = [
  "Section width",
  "Sidewall height",
  "Rim diameter",
  "Overall diameter",
  "Circumference",
  "Revolutions",
]

const ROW_CLASS = "flex min-h-8 items-center justify-between border-b border-border text-xs"
const TABLE_GRID = "grid grid-cols-[minmax(0,1fr)_repeat(3,4.5rem)] gap-x-2"

function App() {
  const [units, setUnits] = useState<UnitSystem>("imperial")
  const originalLabel = formatTireSize(DEFAULT_ORIGINAL)
  const proposedLabel = formatTireSize(DEFAULT_PROPOSED)

  return (
    <TooltipProvider delayDuration={300}>
      <AppShell
        header={<AppHeader units={units} onUnitsChange={setUnits} />}
        rail={
          <ControlRail
            original={<SizePlaceholder id="original-size" size={DEFAULT_ORIGINAL} />}
            proposed={<SizePlaceholder id="proposed-size" size={DEFAULT_PROPOSED} />}
          />
        }
        stage={
          <ComparisonStage
            label={`Tire comparison: ${originalLabel} original vs ${proposedLabel} proposed`}
            caption={`${originalLabel} vs ${proposedLabel}`}
            legend={
              <>
                <LegendRow tire="original" name="Original" size={originalLabel} />
                <LegendRow tire="proposed" name="Proposed" size={proposedLabel} />
              </>
            }
          />
        }
        data={
          <>
            <PanelSection title="Comparison" icon={<TableIcon />}>
              <div className={`${TABLE_GRID} pb-1 text-xs text-muted-foreground uppercase`}>
                <span />
                <span className="text-right">Original</span>
                <span className="text-right">Proposed</span>
                <span className="text-right">Δ</span>
              </div>
              {COMPARISON_ROWS.map((label) => (
                <div
                  key={label}
                  className={`${TABLE_GRID} min-h-8 items-center border-b border-border text-xs`}
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-right text-muted-foreground">—</span>
                  <span className="text-right text-muted-foreground">—</span>
                  <span className="text-right text-muted-foreground">—</span>
                </div>
              ))}
            </PanelSection>

            <PanelSection title="Speedometer" icon={<GaugeIcon />}>
              <PlaceholderRow label="Indicated" value="—" />
              <PlaceholderRow label="Actual" value="—" />
            </PanelSection>

            <PanelSection title="Calculations" icon={<FunctionIcon />}>
              <p className="text-xs/relaxed text-muted-foreground">
                Formulas and assumptions for each value.
              </p>
            </PanelSection>
          </>
        }
        footer={<FitmentDisclaimer />}
      />
    </TooltipProvider>
  )
}

function SizePlaceholder({ id, size }: { id: string; size: TireSize }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id}>Tire size</Label>
        <Input id={id} readOnly value={formatTireSize(size)} className="tabular-nums" />
      </div>
      <div>
        <PlaceholderRow label="Width" value={`${size.width} mm`} />
        <PlaceholderRow label="Aspect" value={`${size.aspect}`} />
        <PlaceholderRow label="Rim" value={`${size.rim} in`} />
      </div>
    </div>
  )
}

function PlaceholderRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={ROW_CLASS}>
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}

function LegendRow({
  tire,
  name,
  size,
}: {
  tire: "original" | "proposed"
  name: string
  size: string
}) {
  return (
    <div className="flex items-center gap-2">
      <TireSwatch tire={tire} />
      <span>{name}</span>
      <span className="text-muted-foreground tabular-nums">{size}</span>
    </div>
  )
}

export default App
