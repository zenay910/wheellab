import type { ReactNode } from "react"
import { WarningCircleIcon } from "@phosphor-icons/react"

import { TireSwatch } from "@/components/tire/TireSwatch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { PanelSection } from "./PanelSection"

interface ControlRailProps {
  original: ReactNode
  proposed: ReactNode
  /** Marks a mobile tab when that tire's inputs show an error. */
  invalid?: { original?: boolean; proposed?: boolean }
}

/** Content is force-mounted: tabs switch panels below lg; both stack at lg+ with no JS media query. */
const CONTENT_CLASS = "data-[state=inactive]:hidden lg:data-[state=inactive]:block"

export function ControlRail({ original, proposed, invalid }: ControlRailProps) {
  return (
    <Tabs defaultValue="original" className="gap-0">
      <div className="px-4 pt-3 lg:hidden">
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="original">
            <TireSwatch tire="original" /> Original
            {invalid?.original && <ErrorMarker />}
          </TabsTrigger>
          <TabsTrigger value="proposed">
            <TireSwatch tire="proposed" /> Proposed
            {invalid?.proposed && <ErrorMarker />}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        value="original"
        forceMount
        tabIndex={-1}
        className={`${CONTENT_CLASS} lg:border-b lg:border-border`}
      >
        <PanelSection
          title="Original"
          icon={<TireSwatch tire="original" />}
          action={<Badge variant="outline">Reference</Badge>}
        >
          {original}
        </PanelSection>
      </TabsContent>

      <TabsContent value="proposed" forceMount tabIndex={-1} className={CONTENT_CLASS}>
        <PanelSection title="Proposed" icon={<TireSwatch tire="proposed" />}>
          {proposed}
        </PanelSection>
      </TabsContent>
    </Tabs>
  )
}

function ErrorMarker() {
  return (
    <>
      <WarningCircleIcon aria-hidden className="size-3.5 text-destructive" />
      <span className="sr-only">(has errors)</span>
    </>
  )
}
