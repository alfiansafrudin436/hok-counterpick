import { describe, expect, it } from 'vitest'
import type { MetaHero, RosterHero } from '@/types'
import { buildItemIcons, mergeHeroes } from './heroes'

const CAMP = 'https://camp.honorofkings.com'

const ROSTER: RosterHero[] = [
  { name: 'Alfa', role: 'Assassin', image: `${CAMP}/alfa.png` },
  { name: 'Tameng', role: 'Tank' },
  { name: 'Baru', role: 'Mage' },
]

const meta = (name: string, data: Partial<MetaHero> = {}): MetaHero => ({
  name,
  roles: [],
  lane: null,
  avatar: null,
  counters: [],
  counteredBy: [],
  build: [],
  arcana: [],
  spells: [],
  traits: [],
  dataUpdated: '2026-09-21',
  ...data,
})

const META: MetaHero[] = [
  meta('Alfa', {
    roles: ['Assassin', 'Fighter', 'Warrior'],
    lane: 'Jungling',
    avatar: `${CAMP}/alfa-meta.png`,
    counters: ['Baru'],
    counteredBy: ['Tameng', 'Hantu'],
    build: [
      { name: 'Pedang', icon: `${CAMP}/pedang.png` },
      { name: 'Usang', icon: null },
      { name: 'Pedang', icon: null },
    ],
    arcana: ['Hunt'],
    spells: ['Smite'],
    traits: ['physical'],
  }),
  meta('Tameng', { avatar: `${CAMP}/tameng.png`, counters: ['Tameng'], traits: ['cc'] }),
  meta('Hantu', { counters: ['Tameng'] }),
]

const find = (name: string, normalize?: (item: string) => string | undefined) =>
  mergeHeroes(ROSTER, META, normalize).find((hero) => hero.name === name)

describe('mergeHeroes', () => {
  it('memakai roster resmi sebagai daftar hero', () => {
    expect(mergeHeroes(ROSTER, META).map((hero) => hero.name)).toEqual(['Alfa', 'Tameng', 'Baru'])
  })

  it('menaruh role roster di depan dan hanya menambah role HOKMeta yang dikenal', () => {
    expect(find('Alfa')?.roles).toEqual(['Assassin', 'Fighter'])
  })

  it('mengutamakan gambar roster, lalu avatar HOKMeta', () => {
    expect(find('Alfa')?.image).toBe(`${CAMP}/alfa.png`)
    expect(find('Tameng')?.image).toBe(`${CAMP}/tameng.png`)
    expect(find('Baru')?.image).toBeUndefined()
  })

  it('menggabungkan counteredBy dengan kebalikan dari counters', () => {
    // "Alfa counters Baru" → Baru di-counter Alfa. Hantu tidak ada di roster, jadi diabaikan.
    expect(find('Alfa')?.counteredBy).toEqual(['Tameng'])
    expect(find('Baru')?.counteredBy).toEqual(['Alfa'])
    // Counter terhadap diri sendiri diabaikan.
    expect(find('Tameng')?.counteredBy).toEqual([])
  })

  it('membawa lane, arcana, spell, dan sifat', () => {
    expect(find('Alfa')).toMatchObject({
      lane: 'Jungling',
      arcana: ['Hunt'],
      spells: ['Smite'],
      traits: ['burst', 'physical'],
    })
    expect(find('Tameng')?.traits).toEqual(['cc', 'physical', 'tank'])
  })

  it('menyaring build lewat normalizer dan menggabungkan duplikat', () => {
    const normalize = (name: string) => (name === 'Usang' ? undefined : name)
    expect(find('Alfa', normalize)?.build).toEqual([{ name: 'Pedang', icon: `${CAMP}/pedang.png` }])
  })

  it('hero tanpa data HOKMeta tetap tampil tanpa counter dan build', () => {
    expect(find('Baru')).toMatchObject({ build: [], arcana: [], spells: [], traits: ['magic'] })
  })

  it('mengumpulkan ikon item hanya dari host yang diizinkan', () => {
    const icons = buildItemIcons([
      ...META,
      meta('Lain', { build: [{ name: 'Tongkat', icon: 'https://contoh.test/t.png' }] }),
    ])
    expect(icons).toEqual({ Pedang: `${CAMP}/pedang.png` })
  })
})
