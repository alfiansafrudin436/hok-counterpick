// Fungsi murni untuk meringkas data HOKMeta menjadi bentuk yang disimpan di content/hokmeta.json.
// Dipisah dari skrip sinkronisasi supaya bisa diuji (lihat src/lib/derive-hokmeta.test.ts).

// Sifat "heal" dan "cc" ditebak dari teks skill resmi — heuristik, bukan data kurasi.
const HEAL_PATTERN = /\b(restores?|heals?|healing|lifesteal|regenerates?)\b/i
const CC_PATTERN =
  /\b(stun(s|ned|ning)?|knock(s|ed|ing)? (up|back|airborne)|airborne|suppress(es|ed|ing)?|immobiliz(e|es|ed|ing)|root(s|ed)?|taunt(s|ed)?|silenc(e|es|ed)|petrif(y|ies|ied)|freez(e|es)|frozen|pull(s|ed)?)\b/i

const ARCANA_PREFIX = /^Lvl\s*\d+:\s*/i

const splitList = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean)
  if (typeof value !== 'string') return []
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const unique = (values) => [...new Set(values)]

// Jenis damage dari build: lebih banyak item MATK → magic, lebih banyak PATK → physical.
export const guessDamage = (build) => {
  const text = build.map((item) => item?.description ?? '').join(' ')
  const magic = (text.match(/\bMATK\b/g) ?? []).length
  const physical = (text.match(/\bPATK\b/g) ?? []).length
  if (magic > physical) return 'magic'
  if (physical > magic) return 'physical'
  return null
}

export const deriveTraits = (hero) => {
  const skillText = (hero.skills ?? []).map((skill) => skill?.description ?? '').join(' ')
  const traits = []
  if (HEAL_PATTERN.test(skillText)) traits.push('heal')
  if (CC_PATTERN.test(skillText)) traits.push('cc')
  const damage = guessDamage(hero.build ?? [])
  if (damage) traits.push(damage)
  return traits
}

export const trimHero = (hero) => ({
  name: String(hero.name).trim(),
  roles: splitList(hero.roles ?? hero.role),
  lane: typeof hero.lane === 'string' ? hero.lane : null,
  avatar: hero.avatar ?? null,
  counters: unique(splitList(hero.counters)),
  counteredBy: unique(splitList(hero.counteredBy)),
  build: (hero.build ?? [])
    .filter((item) => item?.name)
    .map((item) => ({ name: String(item.name).trim(), icon: item.icon ?? null })),
  arcana: splitList(hero.arcana).map((name) => name.replace(ARCANA_PREFIX, '')),
  spells: splitList(hero.spells),
  traits: deriveTraits(hero),
  dataUpdated: hero.dataUpdated ?? null,
})
