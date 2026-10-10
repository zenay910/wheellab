import { MoonIcon, SunIcon } from "@phosphor-icons/react"

import type { Theme } from "@/hooks/usePreferences"
import type { UnitSystem } from "@/lib/tire"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import { WheelLabMark } from "./WheelLabMark"

interface AppHeaderProps {
  units: UnitSystem
  onUnitsChange: (units: UnitSystem) => void
  theme: Theme
  onThemeChange: (theme: Theme) => void
}

const UNIT_ITEM_CLASS = "px-2.5 text-muted-foreground data-[state=on]:text-foreground"

export function AppHeader({ units, onUnitsChange, theme, onThemeChange }: AppHeaderProps) {
  const nextTheme = theme === "dark" ? "light" : "dark"

  return (
    <>
      <div className="flex items-center gap-3">
        <WheelLabMark className="size-4" />
        <h1 aria-label="WheelLab" className="text-sm font-medium tracking-wide uppercase">
          Wheel<span className="text-muted-foreground">Lab</span>
        </h1>
        <Separator orientation="vertical" className="hidden h-4 sm:block" />
        <span className="hidden text-xs text-muted-foreground sm:inline">
          Tire size comparison
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={0}
          value={units}
          onValueChange={(value) => value && onUnitsChange(value as UnitSystem)}
          aria-label="Unit system"
        >
          <ToggleGroupItem value="metric" className={UNIT_ITEM_CLASS}>
            Metric
          </ToggleGroupItem>
          <ToggleGroupItem value="imperial" className={UNIT_ITEM_CLASS}>
            Imperial
          </ToggleGroupItem>
        </ToggleGroup>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={`Switch to ${nextTheme} mode`}
          title={`Switch to ${nextTheme} mode`}
          onClick={() => onThemeChange(nextTheme)}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </Button>
      </div>
    </>
  )
}
