import { describe, expect, it } from 'vitest'
import { guessDamage, trimHero } from '../../scripts/lib/derive-hokmeta.mjs'

// Menguji ringkasan data HOKMeta yang dibuat oleh scripts/sync-hokmeta.mjs.
describe('trimHero (sinkronisasi HOKMeta)', () => {
  const raw = {
    name: ' Alfa ',
    roles: 'Fighter, Assassin',
    lane: 'Jungling',
    avatar: 'https://camp.honorofkings.com/a.png',
    counters: ['Beta', 'Beta'],
    counteredBy: 'Gamma, Delta',
    build: [
      { name: 'Pedang', icon: 'https://camp.honorofkings.com/p.png', description: 'PATK +100' },
      { name: '', icon: null },
    ],
    arcana: ['Lvl 5: Hunt', 'Lvl 5: Mutation'],
    spells: ['Smite'],
    skills: [
      { description: 'Dashes forward and stuns the target.' },
      { description: 'Restores Health over time.' },
    ],
    dataUpdated: '2026-09-21',
  }

  it('meringkas field yang dipakai situs', () => {
    expect(trimHero(raw)).toEqual({
      name: 'Alfa',
      roles: ['Fighter', 'Assassin'],
      lane: 'Jungling',
      avatar: 'https://camp.honorofkings.com/a.png',
      counters: ['Beta'],
      counteredBy: ['Gamma', 'Delta'],
      build: [{ name: 'Pedang', icon: 'https://camp.honorofkings.com/p.png' }],
      arcana: ['Hunt', 'Mutation'],
      spells: ['Smite'],
      traits: ['heal', 'cc', 'physical'],
      dataUpdated: '2026-09-21',
    })
  })

  it('tidak menandai heal atau cc tanpa kata kunci di teks skill', () => {
    expect(trimHero({ ...raw, skills: [{ description: 'Deals damage.' }] }).traits).toEqual([
      'physical',
    ])
  })
})

describe('guessDamage', () => {
  it('memilih jenis damage yang paling banyak di build', () => {
    expect(guessDamage([{ description: 'MATK +100' }, { description: 'MATK +50, HP' }])).toBe(
      'magic',
    )
    expect(guessDamage([{ description: 'PATK +100' }])).toBe('physical')
    expect(guessDamage([{ description: 'HP +900' }])).toBeNull()
  })
})
