import type { Hero, Loadout, LoadoutAdjustment, Role } from '@/types'

// Saran item situasional berbasis aturan. Titik awalnya build dari HOKMeta; aturan di bawah
// menambahkan item sesuai sifat tim musuh. Hanya item yang efeknya terverifikasi dari deskripsi
// item resmi (via HOKMeta/Camp HOK) yang dipakai:
// - Mortal Punisher, Venomous Staff: "Lowers Health regen"
// - Breakthrough Robe: "Converts HP into Magical Pierce"
// - Longnight Guardian: "Reduces magical damage"; Succubus Cloak: "Negates magical damage";
//   Demonsbane: "Boosts Magical Defense"
// - Spikemail: "Reflects damage"; Ominous Premonition: "Slows attackers"
// - Boots of Resistance: "Shortens crowd control"
// - Ardent Dominion: "Cleanse and shield at low HP"; Sage's Sanctuary: "Resurrect on the spot"

export const MAX_ADJUSTMENTS = 4

// Ambang jumlah musuh agar sebuah aturan berlaku.
const MIN_MAGIC_ENEMIES = 2
const MIN_PHYSICAL_ENEMIES = 3
const MIN_CC_ENEMIES = 2
const MIN_TANK_ENEMIES = 2
const MIN_BURST_ENEMIES = 2

const FRONTLINE_ROLES: Role[] = ['Tank', 'Fighter']
const SUPPORTIVE_ROLES: Role[] = ['Tank', 'Support']

const names = (heroes: Hero[]) => heroes.map((hero) => hero.name)

const magicDefenseItem = (role: Role) => {
  if (SUPPORTIVE_ROLES.includes(role)) return 'Longnight Guardian'
  if (role === 'Fighter') return 'Succubus Cloak'
  if (role === 'Marksman' || role === 'Assassin') return 'Demonsbane'
  return undefined
}

const surviveBurstItem = (role: Role) => {
  if (role === 'Mage') return 'Ardent Dominion'
  if (FRONTLINE_ROLES.includes(role)) return "Sage's Sanctuary"
  return undefined
}

export const getLoadout = (hero: Hero, enemies: Hero[]): Loadout => {
  const role = hero.roles[0]
  const isFrontline = FRONTLINE_ROLES.includes(role)
  const isSupportive = SUPPORTIVE_ROLES.includes(role)
  const dealsMagic = hero.traits.includes('magic')
  const withTrait = (trait: Hero['traits'][number]) =>
    enemies.filter((enemy) => enemy.traits.includes(trait))

  // Tank dan Support bukan sumber damage utama, jadi tidak dihitung untuk item pertahanan.
  const isDamageDealer = (enemy: Hero) => !SUPPORTIVE_ROLES.includes(enemy.roles[0])
  const heal = withTrait('heal')
  const magic = withTrait('magic').filter(isDamageDealer)
  const physical = withTrait('physical').filter(isDamageDealer)
  const cc = withTrait('cc')
  const tank = withTrait('tank')
  const burst = withTrait('burst')
  const marksmen = enemies.filter((enemy) => enemy.roles[0] === 'Marksman')

  const magicDefense = magicDefenseItem(role)
  const surviveBurst = surviveBurstItem(role)

  // Urutan = prioritas; hanya MAX_ADJUSTMENTS pertama yang ditampilkan.
  const candidates: (LoadoutAdjustment | false | undefined)[] = [
    !isSupportive &&
      heal.length > 0 && {
        item: dealsMagic ? 'Venomous Staff' : 'Mortal Punisher',
        reason: 'reasonAntiHeal',
        enemies: names(heal),
      },
    !isSupportive &&
      dealsMagic &&
      tank.length >= MIN_TANK_ENEMIES && {
        item: 'Breakthrough Robe',
        reason: 'reasonAntiTank',
        enemies: names(tank),
      },
    magicDefense &&
      magic.length >= MIN_MAGIC_ENEMIES && {
        item: magicDefense,
        reason: 'reasonMagicDefense',
        enemies: names(magic),
      },
    isFrontline &&
      physical.length >= MIN_PHYSICAL_ENEMIES && {
        item: 'Spikemail',
        reason: 'reasonPhysicalDefense',
        enemies: names(physical),
      },
    isFrontline &&
      marksmen.length > 0 && {
        item: 'Ominous Premonition',
        reason: 'reasonAntiMarksman',
        enemies: names(marksmen),
      },
    cc.length >= MIN_CC_ENEMIES && {
      item: 'Boots of Resistance',
      reason: 'reasonTenacity',
      enemies: names(cc),
    },
    surviveBurst &&
      burst.length >= MIN_BURST_ENEMIES && {
        item: surviveBurst,
        reason: 'reasonSurviveBurst',
        enemies: names(burst),
      },
  ]

  const owned = new Set(hero.build.map((item) => item.name))
  const adjustments = candidates
    .filter((item): item is LoadoutAdjustment => Boolean(item))
    // Item yang sudah ada di build tidak perlu disarankan lagi.
    .filter((item) => !owned.has(item.item))
    .slice(0, MAX_ADJUSTMENTS)

  return { build: hero.build, adjustments, arcana: hero.arcana, spells: hero.spells }
}
