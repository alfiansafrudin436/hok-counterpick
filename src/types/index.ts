import type { z } from 'zod'
import type id from '@/app/[lang]/dictionaries/id.json'
import type { itemsFileSchema, metaSnapshotSchema, rosterFileSchema } from '@/lib/content-schema'
import type { LOCALES } from '@/lib/i18n'
import type { ALL_ROLES, ROLES } from '@/lib/roles'
import type { TRAITS } from '@/lib/traits'

export type Locale = (typeof LOCALES)[number]

// Bentuk kamus mengikuti id.json; en.json wajib punya kunci yang sama.
export type Dictionary = typeof id

export type PickerDictionary = Dictionary['picker']

export type Role = (typeof ROLES)[number]

export type RoleFilter = Role | typeof ALL_ROLES

// Sifat hero yang dipakai aturan build: heal, cc, burst, magic, physical, tank.
export type Trait = (typeof TRAITS)[number]

// content/heroes.yaml — roster resmi dari HOK Camp.
export type RosterHero = z.infer<typeof rosterFileSchema>[number]

// content/hokmeta.json — ringkasan data HOKMeta.
export type MetaSnapshot = z.infer<typeof metaSnapshotSchema>
export type MetaHero = MetaSnapshot['heroes'][number]

// content/items.yaml — katalog item yang berlaku.
export type ItemCatalog = z.infer<typeof itemsFileSchema>

export type BuildItem = {
  name: string
  // URL ikon item; kosong bila tidak tersedia.
  icon?: string
}

export type Hero = {
  name: string
  roles: Role[]
  // Lane utama, mis. "Clash Lane"; kosong bila belum ada datanya.
  lane?: string
  traits: Trait[]
  // Nama hero yang meng-counter hero ini.
  counteredBy: string[]
  // URL potret hero; kosong bila belum ada gambarnya.
  image?: string
  // Build yang direkomendasikan; kosong bila belum ada datanya.
  build: BuildItem[]
  arcana: string[]
  spells: string[]
}

// Kunci kamus untuk alasan sebuah saran, mis. "reasonAntiHeal".
export type LoadoutReason = Extract<keyof PickerDictionary, `reason${string}`>

// Item situasional yang disarankan karena musuh tertentu.
export type LoadoutAdjustment = {
  item: string
  reason: LoadoutReason
  enemies: string[]
}

export type Loadout = {
  build: BuildItem[]
  adjustments: LoadoutAdjustment[]
  arcana: string[]
  spells: string[]
}

export type Recommendation = {
  hero: Hero
  // Musuh yang di-counter oleh hero ini.
  counters: Hero[]
  // Musuh yang meng-counter balik hero ini.
  threats: Hero[]
  score: number
  // Saran build, arcana, dan spell melawan tim musuh saat ini.
  loadout: Loadout
}
