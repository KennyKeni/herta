export class Slug {
  private static normalizeGender(input: string): string {
    return input.replace(/♀/g, '-f').replace(/♂/g, '-m');
  }

  private static normalizeAccent(input: string): string {
    return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private static normalizeSpecialCharacters(input: string): string {
    return input.replace(/!/g, 'exclamation').replace(/\?/g, 'question');
  }

  static from(input: string): string {
    input = this.normalizeGender(input);
    return input
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-+|-+$/g, '');
  }

  static forPokemon(input: string): string {
    input = this.normalizeGender(input);
    input = this.normalizeAccent(input);
    input = this.normalizeSpecialCharacters(input);
    return this.from(input);
  }

  static forVariation(variationName: string, gender: string, shiny: boolean): string {
    const parts = [this.forPokemon(variationName), this.from(gender), shiny ? 'shiny' : ''].filter(
      (part) => part !== ''
    );
    return parts.join('-');
  }
}
