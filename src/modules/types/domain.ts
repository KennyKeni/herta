export interface Type {
  id: number;
  name: string;
  slug: string;
}

export interface TypeMatchup {
  attackingType: Type;
  defendingType: Type;
  multiplier: number;
}

export interface HiddenPowerIv {
  type: Type;
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}
