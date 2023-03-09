/**
 * Gets a cookie. If the value returned is falsy, e.g. undefined (if the key doesn't exist) or an empty string, it returns null.
 * This util does not decode and returns the raw value or null.
 * @param key
 * @param cookieStore (call to document.cookie mocked for tests)
 * @returns string | null
 */
export const getCookie = (
  cookieKey: string,
  cookieStore = document.cookie
): string | null => {
  let regExResult = RegExp(cookieKey + "=[^;]+").exec(cookieStore);

  if (!regExResult) {
    return null;
  }

  return regExResult.toString().replace(/^[^=]+./, "");
};
