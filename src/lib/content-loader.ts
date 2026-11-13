import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { parse } from 'yaml'
import { itemsFileSchema, metaSnapshotSchema, rosterFileSchema } from '@/lib/content-schema'
import { HERO_IMAGE_HOSTS } from '@/lib/image-hosts'
import type { ItemCatalog, MetaSnapshot, RosterHero } from '@/types'

// Loader murni (tanpa API Next.js) supaya bisa dipakai di build dan di test.

export const CONTENT_DIR = path.join(process.cwd(), 'content')

const ROSTER_FILE = 'heroes.yaml'
const ITEMS_FILE = 'items.yaml'
const META_FILE = 'hokmeta.json'

export class ContentError extends Error {
  constructor(file: string, message: string) {
    super(`[content] ${file}: ${message}`)
    this.name = 'ContentError'
  }
}

export const loadRoster = async (dir = CONTENT_DIR): Promise<RosterHero[]> => {
  const result = rosterFileSchema.safeParse(
    parse(await readFile(path.join(dir, ROSTER_FILE), 'utf8')),
  )
  if (!result.success) {
    throw new ContentError(ROSTER_FILE, result.error.message)
  }

  const names = new Set<string>()
  for (const hero of result.data) {
    if (names.has(hero.name)) {
      throw new ContentError(ROSTER_FILE, `hero "${hero.name}" duplikat`)
    }
    names.add(hero.name)
    // next/image hanya mengizinkan host yang terdaftar; host lain akan gagal saat render.
    if (hero.image) {
      const url = new URL(hero.image)
      if (url.protocol !== 'https:' || !HERO_IMAGE_HOSTS.includes(url.hostname)) {
        throw new ContentError(
          ROSTER_FILE,
          `gambar "${hero.name}" harus https dari host yang diizinkan, bukan ${url.hostname}`,
        )
      }
    }
  }
  return result.data
}

export const loadItemCatalog = async (dir = CONTENT_DIR): Promise<ItemCatalog> => {
  const result = itemsFileSchema.safeParse(
    parse(await readFile(path.join(dir, ITEMS_FILE), 'utf8')),
  )
  if (!result.success) {
    throw new ContentError(ITEMS_FILE, result.error.message)
  }
  const names = new Set<string>()
  for (const item of result.data.items) {
    if (names.has(item)) throw new ContentError(ITEMS_FILE, `item "${item}" duplikat`)
    names.add(item)
  }
  return result.data
}

// Membaca ringkasan data HOKMeta. Bila filenya belum ada, situs tetap jalan tanpa counter dan build.
export const loadMetaSnapshot = async (dir = CONTENT_DIR): Promise<MetaSnapshot | null> => {
  let text: string
  try {
    text = await readFile(path.join(dir, META_FILE), 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
  const result = metaSnapshotSchema.safeParse(JSON.parse(text))
  if (!result.success) {
    throw new ContentError(META_FILE, result.error.message)
  }
  return result.data
}
