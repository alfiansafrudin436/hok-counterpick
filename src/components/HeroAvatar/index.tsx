'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import Image from 'next/image'
import { useState } from 'react'
import { ROLE_STYLES } from '@/lib/roles'
import { cn, getInitials } from '@/lib/utils'
import type { Hero } from '@/types'

const avatarVariants = cva(
  'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 font-display font-bold ring-1 ring-primary/45 ring-offset-2 ring-offset-card',
  {
    variants: {
      size: {
        sm: 'size-10 text-sm',
        md: 'size-14 text-lg',
        lg: 'size-16 text-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

type HeroAvatarProps = VariantProps<typeof avatarVariants> & {
  hero: Hero
  className?: string
}

// Potret hero dengan bingkai berwarna sesuai role utama; jatuh ke inisial bila gambar tidak ada.
export const HeroAvatar = ({ hero, size, className }: HeroAvatarProps) => {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(hero.image) && !failed

  return (
    <span
      aria-hidden
      className={cn(avatarVariants({ size }), ROLE_STYLES[hero.roles[0]], className)}
    >
      {showImage ? (
        <Image
          src={hero.image!}
          alt=""
          width={64}
          height={64}
          className="size-full object-cover object-top"
          onError={() => setFailed(true)}
        />
      ) : (
        getInitials(hero.name)
      )}
    </span>
  )
}
