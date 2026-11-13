import type { ItemCatalog } from '@/types'

export type ItemNormalizer = (rawName: string) => string | undefined

export const getItemNames = (catalog: ItemCatalog) => {
  return new Set(catalog.items)
}

// Mengembalikan fungsi yang menerima nama item dan mengembalikannya bila ada di katalog,
// atau undefined bila item itu tidak dikenal (mis. sudah dihapus dari game).
export const createItemNormalizer = (catalog: ItemCatalog): ItemNormalizer => {
  const known = getItemNames(catalog)
  return (rawName) => {
    const name = rawName.trim()
    return known.has(name) ? name : undefined
  }
}
