import { useId, type Dispatch, type KeyboardEvent, type MouseEvent } from "react"
import { InfoIcon, MinusIcon, PlusIcon, WarningCircleIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TIRE_LIMITS, formatTireSize, type TireField } from "@/lib/tire"
import { cn } from "@/lib/utils"
import {
  getInputIssues,
  type TireInputState,
  type TireInputsAction,
  type TireKey,
} from "@/state/tireInputs"

interface TireSizeInputProps {
  tire: TireKey
  state: TireInputState
  dispatch: Dispatch<TireInputsAction>
}

const FIELD_META: Record<
  TireField,
  { label: string; name: string; spokenUnit: string; inputMode: "numeric" | "decimal" }
> = {
  width: { label: "Width (mm)", name: "width", spokenUnit: "mm", inputMode: "numeric" },
  aspect: { label: "Aspect (%)", name: "aspect ratio", spokenUnit: "percent", inputMode: "numeric" },
  rim: { label: "Rim (in)", name: "rim diameter", spokenUnit: "in", inputMode: "decimal" },
}

/** Keeps focus in the field so a stepper click doesn't commit (and flash an error) first. */
const keepFocus = (event: MouseEvent) => event.preventDefault()

const CONTROL_TEXT = "text-base md:text-base lg:text-xs"

export function TireSizeInput({ tire, state, dispatch }: TireSizeInputProps) {
  const textId = useId()
  const issues = getInputIssues(state)
  const anyFieldError = Object.keys(issues.fieldErrors).length > 0
  const textInvalid = issues.textError !== undefined || anyFieldError

  function onTextKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") dispatch({ type: "textCommitted", tire })
    if (event.key === "Escape") dispatch({ type: "reverted", tire })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={textId}>Tire size</Label>
        <Input
          id={textId}
          value={state.text}
          placeholder="205/55R16"
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="characters"
          enterKeyHint="done"
          aria-invalid={textInvalid || undefined}
          aria-describedby={`${textId}-msg`}
          onChange={(e) => dispatch({ type: "textChanged", tire, text: e.target.value })}
          onBlur={() => dispatch({ type: "textCommitted", tire })}
          onKeyDown={onTextKeyDown}
          className={cn("h-10 uppercase tabular-nums lg:h-8", CONTROL_TEXT)}
        />
        <div id={`${textId}-msg`} aria-live="polite">
          {issues.textError && <FieldMessage kind="error">{issues.textError}</FieldMessage>}
        </div>
      </div>

      <div role="group" aria-label="Dimensions">
        {(["width", "aspect", "rim"] as const).map((field) => (
          <FieldRow
            key={field}
            tire={tire}
            field={field}
            draft={state.fields[field]}
            value={state.size[field]}
            error={issues.fieldErrors[field]}
            warning={issues.fieldWarnings[field]}
            dispatch={dispatch}
          />
        ))}
      </div>

      {issues.hasVisibleErrors && (
        <p className="text-xs text-muted-foreground">
          Comparison uses{" "}
          <span className="text-foreground tabular-nums">{formatTireSize(state.lastValid)}</span>
        </p>
      )}
    </div>
  )
}

interface FieldRowProps {
  tire: TireKey
  field: TireField
  draft: string
  value: number
  error?: string
  warning?: string
  dispatch: Dispatch<TireInputsAction>
}

function FieldRow({ tire, field, draft, value, error, warning, dispatch }: FieldRowProps) {
  const id = useId()
  const { label, name, spokenUnit, inputMode } = FIELD_META[field]
  const { min, max } = TIRE_LIMITS[field]
  const finite = Number.isFinite(value)

  const step = (direction: 1 | -1) => dispatch({ type: "fieldStepped", tire, field, direction })

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault()
      step(event.key === "ArrowUp" ? 1 : -1)
    }
    if (event.key === "Enter") dispatch({ type: "fieldCommitted", tire, field })
    if (event.key === "Escape") dispatch({ type: "reverted", tire })
  }

  return (
    <div className="border-b border-border py-1.5 lg:py-1">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-muted-foreground">
          {label}
        </Label>
        <div className="flex">
          <Button
            type="button"
            variant="outline"
            size="icon"
            tabIndex={-1}
            aria-label={`Decrease ${name}`}
            disabled={finite && value <= min}
            onMouseDown={keepFocus}
            onClick={() => step(-1)}
            className="size-10 lg:size-8"
          >
            <MinusIcon />
          </Button>
          <Input
            id={id}
            type="text"
            inputMode={inputMode}
            role="spinbutton"
            autoComplete="off"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={finite ? value : undefined}
            aria-valuetext={finite ? `${value} ${spokenUnit}` : undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={`${id}-msg`}
            value={draft}
            onChange={(e) => dispatch({ type: "fieldChanged", tire, field, value: e.target.value })}
            onBlur={() => dispatch({ type: "fieldCommitted", tire, field })}
            onKeyDown={onKeyDown}
            className={cn(
              "relative -mx-px h-10 w-16 text-center tabular-nums focus-visible:z-10 lg:h-8 lg:w-14",
              CONTROL_TEXT,
            )}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            tabIndex={-1}
            aria-label={`Increase ${name}`}
            disabled={finite && value >= max}
            onMouseDown={keepFocus}
            onClick={() => step(1)}
            className="size-10 lg:size-8"
          >
            <PlusIcon />
          </Button>
        </div>
      </div>
      <div id={`${id}-msg`} aria-live="polite">
        {error ? (
          <FieldMessage kind="error">{error}</FieldMessage>
        ) : (
          warning && <FieldMessage kind="warning">{warning}</FieldMessage>
        )}
      </div>
    </div>
  )
}

function FieldMessage({ kind, children }: { kind: "error" | "warning"; children: string }) {
  const Icon = kind === "error" ? WarningCircleIcon : InfoIcon
  return (
    <p
      className={cn(
        "flex items-start gap-1.5 pt-1 text-xs/relaxed",
        kind === "error" ? "text-destructive" : "text-muted-foreground",
      )}
    >
      <Icon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
      {children}
    </p>
  )
}
