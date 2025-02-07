export function renameKeys<T extends { [key: string]: number }>(
  data: T[],
  key1: keyof T,
  key2: keyof T
) {
  return data.map(({ [key1]: x, [key2]: y }) => ({ x, y }));
}

export function inRange(value1: number, value2: number, range: number = 0.001): boolean {
  if (typeof value1 !== 'number' || typeof value2 !== 'number') {
    throw new TypeError('Both values must be numbers');
  }
  if (range < 0) {
    throw new RangeError('Range must be a non-negative number')
  }
  return Math.abs(value1 - value2) <= range
}
