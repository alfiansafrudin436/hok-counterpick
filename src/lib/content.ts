import 'server-only'
import { cacheLife } from 'next/cache'
import { loadItemCatalog, loadMetaSnapshot, loadRoster } from '@/lib/content-loader'
import { buildItemIcons, mergeHeroes } from '@/lib/heroes'
import { createItemNormalizer } from '@/lib/items'
import type { Hero } from '@/types'

export type HeroData = {
  heroes: Hero[]
  itemIcons: Record<string, string>
  // Tanggal data HOKMeta yang dipakai (counter, build, arcana, spell), mis. "2026-09-21".
  metaUpdated: string | null
}

// Semua sumber adalah file di folder `content/`, jadi hasilnya statis: di-cache permanen dan
// ikut ter-prerender saat build. Tidak ada panggilan jaringan.
export const getHeroData = async (): Promise<HeroData> => {
  'use cache'
  cacheLife('max')
  const [roster, items, snapshot] = await Promise.all([
    loadRoster(),
    loadItemCatalog(),
    loadMetaSnapshot(),
  ])
  const meta = snapshot?.heroes ?? []
  // Build HOKMeta disaring terhadap katalog item (content/items.yaml).
  const normalize = createItemNormalizer(items)
  return {
    heroes: mergeHeroes(roster, meta, normalize),
    itemIcons: buildItemIcons(meta, normalize),
    metaUpdated: snapshot?.dataUpdated ?? null,
  }
}
