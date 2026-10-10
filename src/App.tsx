import { useMemo, useReducer } from "react"
import { FunctionIcon, GaugeIcon, ListChecksIcon, TableIcon } from "@phosphor-icons/react"

import { AppHeader } from "@/components/layout/AppHeader"
import { AppShell } from "@/components/layout/AppShell"
import { ControlRail } from "@/components/layout/ControlRail"
import { PanelSection } from "@/components/layout/PanelSection"
import { ComparisonStageView } from "@/components/three/ComparisonStageView"
import { ComparisonTable } from "@/components/tire/ComparisonTable"
import { FitmentCaution, FitmentCautionDetail } from "@/components/tire/FitmentCaution"
import { FitmentDisclaimer } from "@/components/tire/FitmentDisclaimer"
import { ExplanationPanel } from "@/components/tire/ExplanationPanel"
import { SimpleSummary } from "@/components/tire/SimpleSummary"
import { SpeedometerPanel } from "@/components/tire/SpeedometerPanel"
import { TireSizeInput } from "@/components/tire/TireSizeInput"
import { TireSwatch } from "@/components/tire/TireSwatch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useDetailLevel, useTheme, type DetailLevel } from "@/hooks/usePreferences"
import { compareTires, formatTireSize } from "@/lib/tire"
import { createInitialState, getInputIssues, tireInputsReducer } from "@/state/tireInputs"

function App() {
  const [state, dispatch] = useReducer(tireInputsReducer, undefined, () => createInitialState())
  const [theme, setTheme] = useTheme()
  const [detail, setDetail] = useDetailLevel()
  const originalSize = state.original.lastValid
  const proposedSize = state.proposed.lastValid
  const originalLabel = formatTireSize(originalSize)
  const proposedLabel = formatTireSize(proposedSize)
  const comparison = useMemo(
    () => compareTires(originalSize, proposedSize),
    [originalSize, proposedSize],
  )

  return (
    <TooltipProvider delayDuration={300}>
      <AppShell
        header={
          <AppHeader
            units={state.units}
            onUnitsChange={(units) => dispatch({ type: "unitsChanged", units })}
            theme={theme}
            onThemeChange={setTheme}
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
          <ComparisonStageView
            comparison={comparison}
            units={state.units}
            theme={theme}
            label={`Tire comparison: ${originalLabel} original vs ${proposedLabel} proposed`}
            legend={
              <>
                <LegendRow tire="original" name="Original" size={originalLabel} />
                <LegendRow tire="proposed" name="Proposed" size={proposedLabel} />
              </>
            }
            status={<FitmentCaution comparison={comparison} />}
          />
        }
        data={
          <>
            <DetailToggle value={detail} onChange={setDetail} />
            {detail === "simple" ? (
              <PanelSection title="Summary" icon={<ListChecksIcon />}>
                <SimpleSummary
                  comparison={comparison}
                  units={state.units}
                  onShowDetails={() => setDetail("detailed")}
                />
              </PanelSection>
            ) : (
              <>
                <PanelSection title="Comparison" icon={<TableIcon />}>
                  <FitmentCautionDetail comparison={comparison} />
                  <ComparisonTable comparison={comparison} units={state.units} />
                </PanelSection>

                <PanelSection title="Speedometer" icon={<GaugeIcon />}>
                  <SpeedometerPanel comparison={comparison} units={state.units} />
                </PanelSection>

                <PanelSection title="Calculations" icon={<FunctionIcon />}>
                  <ExplanationPanel comparison={comparison} />
                </PanelSection>
              </>
            )}
          </>
        }
        footer={<FitmentDisclaimer />}
      />
    </TooltipProvider>
  )
}

const DETAIL_ITEM_CLASS = "flex-1 text-muted-foreground data-[state=on]:text-foreground"

function DetailToggle({
  value,
  onChange,
}: {
  value: DetailLevel
  onChange: (value: DetailLevel) => void
}) {
  return (
    <div className="border-b border-border px-4 py-3">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        spacing={0}
        value={value}
        onValueChange={(v) => v && onChange(v as DetailLevel)}
        aria-label="Level of detail"
        className="w-full"
      >
        <ToggleGroupItem value="simple" className={DETAIL_ITEM_CLASS}>
          Simple
        </ToggleGroupItem>
        <ToggleGroupItem value="detailed" className={DETAIL_ITEM_CLASS}>
          Detailed
        </ToggleGroupItem>
      </ToggleGroup>
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
