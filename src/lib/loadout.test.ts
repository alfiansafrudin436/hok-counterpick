import { describe, expect, it } from 'vitest'
import type { Hero, Role, Trait } from '@/types'
import { getLoadout, MAX_ADJUSTMENTS } from './loadout'

const hero = (name: string, role: Role, traits: Trait[], build: string[] = []): Hero => ({
  name,
  roles: [role],
  traits,
  counteredBy: [],
  build: build.map((item) => ({ name: item })),
  arcana: ['Hunt'],
  spells: ['Flash'],
})

const HEALER = hero('Penyembuh', 'Support', ['heal', 'magic'])
const REGEN = hero('Regen', 'Fighter', ['heal', 'physical'])
const STUNNER = hero('Pengunci', 'Tank', ['cc', 'tank', 'physical'])
const WALL = hero('Tembok', 'Tank', ['cc', 'tank', 'magic'])
const NUKER = hero('Peledak', 'Mage', ['burst', 'magic'])
const CASTER = hero('Penyihir', 'Mage', ['magic'])
const KILLER = hero('Pembunuh', 'Assassin', ['burst', 'physical'])
const SHOOTER = hero('Penembak', 'Marksman', ['physical'])

const items = (pick: Hero, enemies: Hero[]) =>
  getLoadout(pick, enemies).adjustments.map((adjustment) => adjustment.item)

describe('getLoadout', () => {
  it('tanpa musuh hanya meneruskan build, arcana, dan spell hero', () => {
    const loadout = getLoadout(hero('Saya', 'Mage', ['magic'], ['Void Staff']), [])
    expect(loadout).toEqual({
      build: [{ name: 'Void Staff' }],
      adjustments: [],
      arcana: ['Hunt'],
      spells: ['Flash'],
    })
  })

  it('memilih item anti-heal sesuai jenis damage', () => {
    expect(items(hero('M', 'Mage', ['magic']), [REGEN])).toContain('Venomous Staff')
    expect(items(hero('F', 'Fighter', ['physical']), [REGEN])).toContain('Mortal Punisher')
    expect(items(hero('T', 'Tank', ['tank', 'physical']), [REGEN])).not.toContain('Mortal Punisher')
  })

  it('menyebut musuh yang memicu saran', () => {
    const [antiHeal] = getLoadout(hero('F', 'Fighter', ['physical']), [
      HEALER,
      REGEN,
      SHOOTER,
    ]).adjustments
    expect(antiHeal).toMatchObject({ reason: 'reasonAntiHeal', enemies: ['Penyembuh', 'Regen'] })
  })

  it('menyarankan Breakthrough Robe untuk hero sihir melawan dua tank', () => {
    expect(items(hero('M', 'Mage', ['magic']), [STUNNER, WALL])).toContain('Breakthrough Robe')
    expect(items(hero('M', 'Mage', ['magic']), [STUNNER])).not.toContain('Breakthrough Robe')
  })

  it('memilih pertahanan sihir sesuai role, tanpa menghitung Tank dan Support', () => {
    const mages = [NUKER, CASTER]
    expect(items(hero('T', 'Tank', ['tank', 'physical']), mages)).toContain('Longnight Guardian')
    expect(items(hero('F', 'Fighter', ['physical']), mages)).toContain('Succubus Cloak')
    expect(items(hero('MM', 'Marksman', ['physical']), mages)).toContain('Demonsbane')
    expect(items(hero('F', 'Fighter', ['physical']), [HEALER, WALL])).not.toContain(
      'Succubus Cloak',
    )
  })

  it('memberi frontliner item anti-fisik dan anti-marksman', () => {
    const tank = hero('T', 'Tank', ['tank', 'physical'])
    expect(items(tank, [KILLER, SHOOTER, REGEN])).toEqual(
      expect.arrayContaining(['Spikemail', 'Ominous Premonition']),
    )
  })

  it('menyarankan Boots of Resistance melawan dua hero CC', () => {
    expect(items(hero('MM', 'Marksman', ['physical']), [STUNNER, WALL])).toContain(
      'Boots of Resistance',
    )
  })

  it('memilih item bertahan dari burst sesuai role', () => {
    expect(items(hero('M', 'Mage', ['magic']), [NUKER, KILLER])).toContain('Ardent Dominion')
    expect(items(hero('F', 'Fighter', ['physical']), [NUKER, KILLER])).toContain("Sage's Sanctuary")
  })

  it('tidak mengulang item yang sudah ada di build', () => {
    const pick = hero('F', 'Fighter', ['physical'], ['Mortal Punisher'])
    expect(items(pick, [REGEN])).not.toContain('Mortal Punisher')
  })

  it('membatasi jumlah saran', () => {
    const pick = hero('F', 'Fighter', ['physical'])
    const enemies = [REGEN, STUNNER, WALL, NUKER, SHOOTER]
    expect(getLoadout(pick, enemies).adjustments.length).toBeLessThanOrEqual(MAX_ADJUSTMENTS)
  })
})
