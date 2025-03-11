// Typeguard to help with type narrowing for built-ins such as Array.prototype.filter
export function isDefined<T>(x: T | undefined | null): x is T {
  return x !== undefined && x !== null;
}

export function getOS() {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf("Win") !== -1) return "Windows";
  if (userAgent.indexOf("Mac") !== -1) return "Mac";
  if (userAgent.indexOf("Linux") !== -1) return "Linux";
  if (userAgent.indexOf("X11") !== -1) return "Unix";
  return "Unknown";
}
