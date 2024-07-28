export type DefaultComparableValue = number | string | Date | boolean | null | undefined | (number | string);
export type DefaultComparable = DefaultComparableValue[] | { valueOf: () => DefaultComparableValue };

export function defaultComparator<T>(a: T, b: T): number {
  if (Number.isFinite(a) && Number.isFinite(b)) {
    return (a as number) - (b as number);
  }

    // The default < and > operators are not totally ordered. To allow types to be mixed
  // in a single collection, compare types and order values of different types by type.
  let ta = typeof a;
  let tb = typeof b;
  if (ta !== tb) {
    return ta < tb ? -1 : 1;
  }

  if (ta === 'object') {
    if (a === null)
      return b === null ? 0 : -1;
    else if (b === null)
      return 1;

    a = a!.valueOf() as T;
    b = b!.valueOf() as T;
    ta = typeof a;
    tb = typeof b;
    if (ta !== tb) {
      return ta < tb ? -1 : 1;
    }
  }

  if (a! < b!) {
    return -1;
  }

  if (a! > b!) {
    return 1;
  }

  if (a === b) {
    return 0;
  }

  if (Number.isNaN(a as any)) {
    return Number.isNaN(b as any) ? 0 : -1;
  }

  if (Number.isNaN(b as any)) {
    return 1;
  }

  return Array.isArray(a) ? 0 : Number.NaN;
}
