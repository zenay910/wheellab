import { InfoIcon } from "@phosphor-icons/react"

/** Approved copy from PROJECT.md — do not shorten or soften. */
export function FitmentDisclaimer() {
  return (
    <div className="flex items-start gap-2 text-xs/relaxed text-muted-foreground">
      <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <p>
        <strong className="font-medium text-foreground">Fitment notice:</strong> WheelLab compares
        nominal tire dimensions and rolling circumference. It does not verify clearance, load
        rating, wheel offset, brake fit, or manufacturer approval. Always confirm fitment with a
        qualified installer and your vehicle’s specifications.
      </p>
    </div>
  )
}
