import { z } from 'zod'
import { ROLES } from '@/lib/roles'
import { CURATED_TRAITS } from '@/lib/traits'

export const roleSchema = z.enum(ROLES)

// content/heroes.yaml — roster resmi dari HOK Camp.
export const rosterFileSchema = z
  .array(
    z.strictObject({
      name: z.string().min(1),
      role: roleSchema,
      image: z.url().optional(),
    }),
  )
  .min(1)

// content/items.yaml — katalog item yang berlaku sekarang.
export const itemsFileSchema = z.strictObject({
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  source: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
})

// content/hokmeta.json — dibuat oleh scripts/sync-hokmeta.mjs.
export const metaSnapshotSchema = z.object({
  fetchedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dataUpdated: z.string().nullable(),
  source: z.string().min(1),
  attribution: z.string().min(1),
  heroes: z.array(
    z.object({
      name: z.string().min(1),
      // Role dari HOKMeta; nilai yang tidak dikenal (mis. "Warrior") diabaikan saat digabung.
      roles: z.array(z.string()),
      lane: z.string().nullable(),
      avatar: z.string().nullable(),
      counters: z.array(z.string()),
      counteredBy: z.array(z.string()),
      build: z.array(z.object({ name: z.string().min(1), icon: z.string().nullable() })),
      arcana: z.array(z.string()),
      spells: z.array(z.string()),
      traits: z.array(z.enum(CURATED_TRAITS)),
      dataUpdated: z.string().nullable(),
    }),
  ),
})
