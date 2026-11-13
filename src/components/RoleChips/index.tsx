import {
  CrosshairIcon,
  HeartPulseIcon,
  LayoutGridIcon,
  ShieldIcon,
  SwordIcon,
  SwordsIcon,
  WandSparklesIcon,
  type LucideIcon,
} from 'lucide-react'
import { ALL_ROLES, ROLE_FILTERS } from '@/lib/roles'
import { cn } from '@/lib/utils'
import type { RoleFilter } from '@/types'

const ROLE_ICONS: Record<RoleFilter, LucideIcon> = {
  Semua: LayoutGridIcon,
  Tank: ShieldIcon,
  Fighter: SwordsIcon,
  Assassin: SwordIcon,
  Mage: WandSparklesIcon,
  Marksman: CrosshairIcon,
  Support: HeartPulseIcon,
}

type RoleChipsProps = {
  label: string
  // Teks untuk pilihan "semua role" dalam bahasa aktif.
  allLabel: string
  value: RoleFilter
  onChange: (role: RoleFilter) => void
  className?: string
}

export const RoleChips = ({ label, allLabel, value, onChange, className }: RoleChipsProps) => {
  return (
    <div role="group" aria-label={label} className={cn('flex flex-wrap gap-1.5', className)}>
      {ROLE_FILTERS.map((role) => {
        const Icon = ROLE_ICONS[role]
        const active = value === role
        return (
          <button
            key={role}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(role)}
            className={cn(
              'inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-4 font-display text-[13px] font-bold tracking-[0.08em] uppercase transition-colors',
              active
                ? 'border-primary bg-linear-to-b from-gold-soft to-primary text-primary-foreground shadow-[0_0_14px] shadow-primary/35'
                : 'border-primary/25 bg-muted/70 text-muted-foreground hover:border-primary/60 hover:text-gold-soft',
            )}
          >
            <Icon aria-hidden className="size-4" />
            {role === ALL_ROLES ? allLabel : role}
          </button>
        )
      })}
    </div>
  )
}
