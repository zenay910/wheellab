import { useMemo, useState, type ReactNode } from "react"

import { ComparisonStage } from "@/components/layout/ComparisonStage"
import { TireSilhouette2D } from "@/components/tire/TireSilhouette2D"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { TireComparison, UnitSystem } from "@/lib/tire"

import { TireScene, type ComparisonViewMode } from "./TireScene"
import { isWebGLAvailable } from "./webgl"

interface ComparisonStageViewProps {
  comparison: TireComparison
  units: UnitSystem
  label: string
  legend: ReactNode
  status: ReactNode
}

export function ComparisonStageView({
  comparison,
  units,
  label,
  legend,
  status,
}: ComparisonStageViewProps) {
  const webgl = useMemo(() => isWebGLAvailable(), [])
  const [mode, setMode] = useState<ComparisonViewMode>("sideBySide")

  return (
    <ComparisonStage
      label={label}
      legend={legend}
      status={status}
      toolbar={
        webgl ? (
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            spacing={0}
            value={mode}
            onValueChange={(v) => {
              if (v === "sideBySide" || v === "overlay") setMode(v)
            }}
            aria-label="Comparison view mode"
          >
            <ToggleGroupItem
              value="sideBySide"
              className="text-muted-foreground data-[state=on]:text-foreground"
            >
              Side by side
            </ToggleGroupItem>
            <ToggleGroupItem
              value="overlay"
              className="text-muted-foreground data-[state=on]:text-foreground"
            >
              Overlay
            </ToggleGroupItem>
          </ToggleGroup>
        ) : undefined
      }
    >
      {webgl ? (
        <TireScene comparison={comparison} mode={mode} />
      ) : (
        <TireSilhouette2D comparison={comparison} units={units} />
      )}
    </ComparisonStage>
  )
}
