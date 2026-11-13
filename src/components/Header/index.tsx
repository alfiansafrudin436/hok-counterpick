import { SwordsIcon } from 'lucide-react'
import type { Locale } from '@/types'
import { LanguageSwitcher } from '../LanguageSwitcher'

type HeaderProps = {
  locale: Locale
  description: string
  languageLabel: string
}

export const Header = ({ locale, description, languageLabel }: HeaderProps) => {
  return (
    <header className="mx-auto w-full max-w-[1200px] px-4 pt-8 pb-4 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {/* Medali emas: cincin luar, cincin dalam, ikon pedang. */}
        <span
          aria-hidden
          className="relative inline-flex size-16 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-gold-soft to-primary p-[3px] shadow-[0_0_24px] shadow-primary/40"
        >
          <span className="inline-flex size-full items-center justify-center rounded-full border border-primary/70 bg-background text-primary">
            <SwordsIcon className="size-7" />
          </span>
        </span>
        <div className="min-w-0 flex-1 basis-60">
          <h1 className="font-display text-[30px] leading-none font-bold tracking-[0.08em] uppercase sm:text-[40px]">
            <span className="text-gold">Counter Pick</span>{' '}
            <span className="text-foreground">HoK</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-[15px]">{description}</p>
        </div>
        <LanguageSwitcher locale={locale} label={languageLabel} />
      </div>
      <div aria-hidden className="ornament-line mt-6" />
    </header>
  )
}
