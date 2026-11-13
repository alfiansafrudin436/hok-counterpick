import { HERO_IMAGE_HOSTS } from '@/lib/image-hosts'
import type { ItemNormalizer } from '@/lib/items'
import { ROLES } from '@/lib/roles'
import { resolveTraits } from '@/lib/traits'
import type { BuildItem, Hero, MetaHero, Role, RosterHero } from '@/types'

export const MAX_ENEMIES = 5

const keepName: ItemNormalizer = (name) => name

const isRole = (value: string): value is Role => (ROLES as readonly string[]).includes(value)

// Hanya URL https dari host yang diizinkan next/image yang dipakai.
const safeImage = (value: string | null | undefined) => {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && HERO_IMAGE_HOSTS.includes(url.hostname) ? value : undefined
  } catch {
    return undefined
  }
}

// Katalog ikon item (nama → URL), dikumpulkan dari semua build.
export const buildItemIcons = (
  meta: MetaHero[],
  normalize: ItemNormalizer = keepName,
): Record<string, string> => {
  const icons: Record<string, string> = {}
  for (const hero of meta) {
    for (const item of hero.build) {
      const name = normalize(item.name)
      const icon = safeImage(item.icon)
      if (name && icon && !icons[name]) icons[name] = icon
    }
  }
  return icons
}

// Build disaring terhadap katalog item; item yang tidak dikenal dibuang, duplikat digabung.
const normalizeBuild = (
  build: MetaHero['build'],
  normalize: ItemNormalizer,
  icons: Record<string, string>,
): BuildItem[] => {
  const items: BuildItem[] = []
  for (const item of build) {
    const name = normalize(item.name)
    if (!name || items.some((existing) => existing.name === name)) continue
    items.push({ name, icon: icons[name] ?? safeImage(item.icon) })
  }
  return items
}

// Menggabungkan roster resmi (HOK Camp) dengan data HOKMeta.
// - Daftar hero, role utama, dan gambar: roster. Role HOKMeta yang dikenal ditambahkan sebagai role
//   sekunder; gambar HOKMeta hanya dipakai bila roster tidak punya.
// - Counter: `counteredBy` dari HOKMeta, ditambah kebalikan dari `counters`
//   ("A meng-counter B" berarti B di-counter A). Hanya hero yang ada di roster yang dihitung.
// - Hero roster tanpa data HOKMeta tetap tampil, tanpa counter dan build.
export const mergeHeroes = (
  roster: RosterHero[],
  meta: MetaHero[],
  normalize: ItemNormalizer = keepName,
): Hero[] => {
  const metaByName = new Map(meta.map((hero) => [hero.name, hero]))
  const inRoster = new Set(roster.map((hero) => hero.name))
  const icons = buildItemIcons(meta, normalize)

  const counteredBy = new Map<string, Set<string>>(roster.map((hero) => [hero.name, new Set()]))
  const addCounter = (target: string, counter: string) => {
    if (target === counter || !inRoster.has(counter)) return
    counteredBy.get(target)?.add(counter)
  }
  for (const hero of meta) {
    for (const counter of hero.counteredBy) addCounter(hero.name, counter)
    for (const target of hero.counters) addCounter(target, hero.name)
  }

  return roster.map(({ name, role, image }) => {
    const data = metaByName.get(name)
    const roles = [...new Set([role, ...(data?.roles ?? []).filter(isRole)])]
    return {
      name,
      roles,
      lane: data?.lane ?? undefined,
      traits: resolveTraits(roles, data?.traits),
      counteredBy: [...(counteredBy.get(name) ?? [])],
      image: image ?? safeImage(data?.avatar),
      build: normalizeBuild(data?.build ?? [], normalize, icons),
      arcana: data?.arcana ?? [],
      spells: data?.spells ?? [],
    }
  })
}
