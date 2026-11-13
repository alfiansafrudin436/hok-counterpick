import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { ContentError, loadMetaSnapshot, loadRoster } from './content-loader'

const writeRoster = async (yaml: string) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'hok-content-'))
  await writeFile(path.join(dir, 'heroes.yaml'), yaml)
  return dir
}

describe('loadRoster', () => {
  it('roster asli valid', async () => {
    const roster = await loadRoster()
    expect(roster.length).toBeGreaterThan(110)
    expect(roster.some((hero) => hero.name === 'Lapulapu')).toBe(true)
  })

  it('menolak hero duplikat', async () => {
    const dir = await writeRoster(`
- { name: Alfa, role: Tank }
- { name: Alfa, role: Mage }
`)
    await expect(loadRoster(dir)).rejects.toThrow(ContentError)
  })

  it('menolak role yang tidak dikenal', async () => {
    const dir = await writeRoster('- { name: Alfa, role: Jungler }\n')
    await expect(loadRoster(dir)).rejects.toThrow(ContentError)
  })

  it('menolak gambar dari host yang tidak diizinkan', async () => {
    const dir = await writeRoster(
      '- { name: Alfa, role: Tank, image: https://contoh.test/a.png }\n',
    )
    await expect(loadRoster(dir)).rejects.toThrow(/host/)
  })
})

describe('loadMetaSnapshot', () => {
  it('data HOKMeta asli valid dan cocok dengan roster', async () => {
    const [snapshot, roster] = await Promise.all([loadMetaSnapshot(), loadRoster()])
    expect(snapshot?.heroes.length).toBeGreaterThan(100)
    const names = new Set(roster.map((hero) => hero.name))
    const unknown = (snapshot?.heroes ?? []).filter((hero) => !names.has(hero.name))
    expect(unknown.map((hero) => hero.name)).toEqual([])
  })

  it('mengembalikan null bila file tidak ada', async () => {
    expect(await loadMetaSnapshot('folder-yang-tidak-ada')).toBeNull()
  })
})
