function normalizeGender(input: string): string {
  return input.replace(/♀/g, '-f').replace(/♂/g, '-m');
}

function normalizeAccent(input: string): string {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeSpecialCharacters(input: string): string {
  return input.replace(/!/g, 'exclamation').replace(/\?/g, 'question');
}

export function slugFrom(input: string): string {
  input = normalizeGender(input);
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '');
}

export function slugForPokemon(input: string): string {
  input = normalizeGender(input);
  input = normalizeAccent(input);
  input = normalizeSpecialCharacters(input);
  return slugFrom(input);
}

export function slugForVariation(variationName: string, gender: string, shiny: boolean): string {
  const parts = [slugForPokemon(variationName), slugFrom(gender), shiny ? 'shiny' : ''].filter(
    (part) => part !== ''
  );
  return parts.join('-');
}

export function resourceLocation(namespace: string, name: string): string {
  const normalizedName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `${namespace.toLowerCase()}:${normalizedName}`;
}
