import { useReducer } from "react"
import { FunctionIcon, GaugeIcon, TableIcon } from "@phosphor-icons/react"

import { AppHeader } from "@/components/layout/AppHeader"
import { AppShell } from "@/components/layout/AppShell"
import { ComparisonStage } from "@/components/layout/ComparisonStage"
import { ControlRail } from "@/components/layout/ControlRail"
import { PanelSection } from "@/components/layout/PanelSection"
import { FitmentDisclaimer } from "@/components/tire/FitmentDisclaimer"
import { TireSizeInput } from "@/components/tire/TireSizeInput"
import { TireSwatch } from "@/components/tire/TireSwatch"
import { TooltipProvider } from "@/components/ui/tooltip"
import { formatTireSize } from "@/lib/tire"
import { createInitialState, getInputIssues, tireInputsReducer } from "@/state/tireInputs"

const COMPARISON_ROWS = [
  "Section width",
  "Sidewall height",
  "Rim diameter",
  "Overall diameter",
  "Circumference",
  "Revolutions",
]

const TABLE_GRID = "grid grid-cols-[minmax(0,1fr)_repeat(3,4.5rem)] gap-x-2"

function App() {
  const [state, dispatch] = useReducer(tireInputsReducer, undefined, () => createInitialState())
  const originalLabel = formatTireSize(state.original.lastValid)
  const proposedLabel = formatTireSize(state.proposed.lastValid)

  return (
    <TooltipProvider delayDuration={300}>
      <AppShell
        header={
          <AppHeader
            units={state.units}
            onUnitsChange={(units) => dispatch({ type: "unitsChanged", units })}
          />
        }
        rail={
          <ControlRail
            original={<TireSizeInput tire="original" state={state.original} dispatch={dispatch} />}
            proposed={<TireSizeInput tire="proposed" state={state.proposed} dispatch={dispatch} />}
            invalid={{
              original: getInputIssues(state.original).hasVisibleErrors,
              proposed: getInputIssues(state.proposed).hasVisibleErrors,
            }}
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

function PlaceholderRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-8 items-center justify-between border-b border-border text-xs">
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
