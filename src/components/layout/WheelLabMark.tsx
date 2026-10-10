export function WheelLabMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="8" cy="8" r="2.25" className="stroke-proposed" strokeWidth="1.5" />
    </svg>
  )
}
