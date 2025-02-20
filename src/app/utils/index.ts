// Typeguard to help with type narrowing for built-ins such as Array.prototype.filter
export function isDefined<T>(x: T | undefined | null): x is T {
  return x !== undefined && x !== null;
}
