import { LanguagesIcon } from 'lucide-react'
import Link from 'next/link'
import { LOCALE_LABELS, LOCALES } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { Locale } from '@/types'

type LanguageSwitcherProps = {
  locale: Locale
  label: string
  className?: string
}

export const LanguageSwitcher = ({ locale, label, className }: LanguageSwitcherProps) => {
  return (
    <nav aria-label={label} className={cn('flex items-center gap-1.5', className)}>
      <LanguagesIcon aria-hidden className="size-[18px] text-muted-foreground" />
      {LOCALES.map((item) => {
        const active = item === locale
        return (
          <Link
            key={item}
            href={`/${item}`}
            hrefLang={item}
            lang={item}
            aria-current={active ? 'page' : undefined}
            title={LOCALE_LABELS[item]}
            className={cn(
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-3 font-display text-sm font-bold tracking-[0.1em] uppercase transition-colors',
              active
                ? 'border-primary bg-linear-to-b from-gold-soft to-primary text-primary-foreground shadow-[0_0_14px] shadow-primary/35'
                : 'border-primary/25 bg-muted/70 text-muted-foreground hover:border-primary/60 hover:text-gold-soft',
            )}
          >
            <span aria-hidden>{item}</span>
            <span className="sr-only">{LOCALE_LABELS[item]}</span>
          </Link>
        )
      })}
    </nav>
  )
}
