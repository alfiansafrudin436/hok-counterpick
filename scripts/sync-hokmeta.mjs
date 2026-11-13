// Mengambil data hero dari HOKMeta (https://hokmeta.pages.dev, situs penggemar) dan menyimpan
// ringkasannya ke content/hokmeta.json: counter, build, arcana, spell, lane, dan sifat turunan.
//
// Situs TIDAK memanggil HOKMeta saat berjalan atau saat build — ia hanya membaca file hasilnya.
// Jalankan manual (`pnpm sync:meta`) bila ingin menyegarkan data, lalu periksa diff sebelum commit.
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { trimHero } from './lib/derive-hokmeta.mjs'

const SOURCE = 'https://hokmeta.pages.dev/api/heroes.json'
const OUTPUT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'content',
  'hokmeta.json',
)

const main = async () => {
  const response = await fetch(SOURCE, {
    headers: { 'User-Agent': 'hok-counter-pick/0.1 (personal fan project)' },
    signal: AbortSignal.timeout(60_000),
  })
  if (!response.ok) throw new Error(`${SOURCE} → HTTP ${response.status}`)
  const raw = await response.json()
  if (!Array.isArray(raw) || !raw.length) throw new Error('Data hero kosong atau bentuknya berubah')

  const heroes = raw.map(trimHero).sort((a, b) => a.name.localeCompare(b.name))
  const dates = [...new Set(heroes.map((hero) => hero.dataUpdated).filter(Boolean))].sort()
  const snapshot = {
    fetchedAt: new Date().toISOString().slice(0, 10),
    dataUpdated: dates.at(-1) ?? null,
    source: SOURCE,
    attribution: 'Data counter, build, arcana, dan spell: HOKMeta (hokmeta.pages.dev)',
    heroes,
  }
  await writeFile(OUTPUT, `${JSON.stringify(snapshot, null, 2)}\n`)
  console.log(
    `Tersimpan ${heroes.length} hero (data ${snapshot.dataUpdated}) ke content/hokmeta.json`,
  )
}

main().catch((error) => {
  console.error('Gagal menyegarkan data HOKMeta:', error)
  process.exitCode = 1
})
