import type { PairKey } from '../model/types';

export function pairKey(a: string, b: string): PairKey {
  return a <= b ? `${a}::${b}` : `${b}::${a}`;
}
