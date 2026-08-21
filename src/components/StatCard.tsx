import type { LucideIcon } from 'lucide-react'

type StatCardProps = {
  label: string
  value: string
  detail: string
  icon: LucideIcon
  tone: string
}

export function StatCard({ label, value, detail, icon: Icon, tone }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  )
}
