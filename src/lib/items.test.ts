import { describe, expect, it } from 'vitest'
import type { Hero, Role, Trait } from '@/types'
import { loadItemCatalog, loadMetaSnapshot } from './content-loader'
import { createItemNormalizer, getItemNames } from './items'
import { getLoadout } from './loadout'

describe('createItemNormalizer', () => {
  const normalize = createItemNormalizer({
    updatedAt: '2026-01-01',
    source: 'test',
    items: ['Void Staff'],
  })

  it('menerima item yang ada di katalog', () => {
    expect(normalize(' Void Staff ')).toBe('Void Staff')
  })

  it('membuang item yang tidak dikenal', () => {
    expect(normalize('Pedang Usang')).toBeUndefined()
  })
})

describe('katalog item asli', () => {
  it('valid dan tanpa nama ganda', async () => {
    const catalog = await loadItemCatalog()
    expect(catalog.items.length).toBeGreaterThan(90)
  })

  it('memuat semua item yang dipakai build HOKMeta', async () => {
    const known = getItemNames(await loadItemCatalog())
    const snapshot = await loadMetaSnapshot()
    for (const hero of snapshot?.heroes ?? []) {
      for (const item of hero.build) {
        expect(known.has(item.name), `${hero.name}: ${item.name}`).toBe(true)
      }
    }
  })

  // Menjaga agar aturan build tidak menyarankan item yang tidak ada di katalog.
  it('memuat semua item yang bisa disarankan aturan build', async () => {
    const known = getItemNames(await loadItemCatalog())
    const roles: Role[] = ['Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support']
    const make = (name: string, role: Role, traits: Trait[]): Hero => ({
      name,
      roles: [role],
      traits,
      counteredBy: [],
      build: [],
      arcana: [],
      spells: [],
    })
    const enemyTeams = [
      [
        make('Heal', 'Fighter', ['heal', 'physical']),
        make('T1', 'Tank', ['cc', 'tank', 'physical']),
        make('T2', 'Tank', ['cc', 'tank', 'magic']),
        make('M1', 'Mage', ['burst', 'magic']),
        make('M2', 'Mage', ['burst', 'magic']),
      ],
      [
        make('A1', 'Assassin', ['burst', 'physical']),
        make('A2', 'Assassin', ['burst', 'physical']),
        make('F1', 'Fighter', ['physical']),
        make('MM', 'Marksman', ['physical']),
        make('M3', 'Mage', ['magic']),
      ],
    ]
    const suggested = new Set<string>()
    for (const role of roles) {
      for (const damage of ['magic', 'physical'] as const) {
        for (const enemies of enemyTeams) {
          for (const adjustment of getLoadout(make('Saya', role, [damage]), enemies).adjustments) {
            suggested.add(adjustment.item)
          }
        }
      }
    }
    expect(suggested.size).toBeGreaterThan(8)
    for (const item of suggested) {
      expect(known.has(item), item).toBe(true)
    }
  })
})
