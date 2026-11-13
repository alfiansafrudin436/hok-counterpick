declare module '*/derive-hokmeta.mjs' {
  export const guessDamage: (build: { description?: string }[]) => 'magic' | 'physical' | null
  export const trimHero: (
    hero: Record<string, unknown>,
  ) => Record<string, unknown> & { traits: string[] }
}
