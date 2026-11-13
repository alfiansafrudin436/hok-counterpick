import { cva, type VariantProps } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// Bingkai berornamen (utilitas `frame` di globals.css); `tone` menentukan warna bingkai dan ikon.
const frameVariants = cva('frame min-w-0 p-4 sm:p-5', {
  variants: {
    tone: {
      gold: '',
      danger: 'frame-danger',
    },
  },
  defaultVariants: {
    tone: 'gold',
  },
})

const iconVariants = cva(
  'inline-flex size-8 shrink-0 items-center justify-center rounded-full border [&_svg]:size-4',
  {
    variants: {
      tone: {
        gold: 'border-primary/60 bg-primary/10 text-primary',
        danger: 'border-danger/60 bg-danger/10 text-danger',
      },
    },
    defaultVariants: {
      tone: 'gold',
    },
  },
)

type PanelProps = VariantProps<typeof frameVariants> & {
  id: string
  title: string
  icon: LucideIcon
  // Konten di sisi kanan judul (penghitung, tombol).
  aside?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const Panel = ({ id, title, icon: Icon, tone, aside, children, className }: PanelProps) => {
  return (
    <section aria-labelledby={id} className={cn(frameVariants({ tone }), className)}>
      <div className="mb-4 flex min-h-11 items-center justify-between gap-3">
        <h2
          id={id}
          className="flex items-center gap-2.5 font-display text-lg font-bold tracking-[0.12em] uppercase"
        >
          <span aria-hidden className={iconVariants({ tone })}>
            <Icon />
          </span>
          <span className="text-gold">{title}</span>
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}
