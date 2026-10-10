import { useMemo, useState, type ReactNode } from "react"

import { ComparisonStage } from "@/components/layout/ComparisonStage"
import { TireSilhouette2D } from "@/components/tire/TireSilhouette2D"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import type { TireComparison, UnitSystem } from "@/lib/tire"

import { TireScene, type ComparisonViewMode } from "./TireScene"
import { isWebGLAvailable } from "./webgl"

function initialViewMode(): ComparisonViewMode {
  if (typeof window === "undefined") return "sideBySide"
  return window.innerWidth >= 1024 ? "sideBySide" : "overlay"
}

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
  const [mode, setMode] = useState<ComparisonViewMode>(initialViewMode)
  const isDesktop = useMediaQuery("(min-width: 1024px)")

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
            className="flex-wrap justify-end"
          >
            <ToggleGroupItem
              value="sideBySide"
              className="px-2 text-muted-foreground data-[state=on]:text-foreground max-sm:text-[10px] sm:px-2.5"
            >
              Side by side
            </ToggleGroupItem>
            <ToggleGroupItem
              value="overlay"
              className="px-2 text-muted-foreground data-[state=on]:text-foreground max-sm:text-[10px] sm:px-2.5"
            >
              Overlay
            </ToggleGroupItem>
          </ToggleGroup>
        ) : undefined
      }
    >
      {webgl ? (
        <TireScene comparison={comparison} units={units} mode={mode} compact={!isDesktop} />
      ) : (
        <TireSilhouette2D comparison={comparison} units={units} />
      )}
    </ComparisonStage>
  )
}
