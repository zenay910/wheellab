import type { ReactNode } from "react"

interface AppShellProps {
  header: ReactNode
  rail: ReactNode
  stage: ReactNode
  data: ReactNode
  footer: ReactNode
}

/**
 * Desktop (lg+): fixed 100svh frame; rail and data panel scroll independently.
 * Mobile: page scroll; stage is moved first visually while DOM order stays rail → stage → data.
 */
export function AppShell({ header, rail, stage, data, footer }: AppShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground lg:grid lg:h-svh lg:grid-rows-[auto_minmax(0,1fr)_auto] lg:overflow-hidden">
      <a
        href="#tire-inputs"
        className="sr-only border border-ring bg-background text-xs focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2"
      >
        Skip to tire inputs
      </a>

      <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-4 border-b border-border bg-background px-4 lg:static">
        {header}
      </header>

      <main className="flex flex-1 flex-col lg:grid lg:min-h-0 lg:grid-cols-[16rem_minmax(0,1fr)_24rem] xl:grid-cols-[18rem_minmax(0,1fr)_26rem] 2xl:grid-cols-[20rem_minmax(0,1fr)_28rem]">
        <section
          id="tire-inputs"
          aria-label="Tire sizes"
          className="border-b border-border lg:min-h-0 lg:overflow-y-auto lg:border-r lg:border-b-0"
        >
          {rail}
        </section>

        <div className="relative order-first h-[40svh] min-h-64 border-b border-border lg:order-none lg:h-auto lg:min-h-0 lg:border-b-0">
          {stage}
        </div>

        <section
          aria-label="Comparison results"
          className="lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-border"
        >
          {data}
        </section>
      </main>

      <footer className="border-t border-border bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:py-2.5">
        {footer}
      </footer>
    </div>
  )
}
