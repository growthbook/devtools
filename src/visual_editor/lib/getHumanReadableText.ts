const getHumanReadableText = (element: HTMLElement): string => {
  // ignore when selected is simply wrapper of another element
  if (element.innerHTML.startsWith("<")) return "";
  // hard-limit on text length
  if (element.innerHTML.length > 800) return "";
  const parser = new DOMParser();
  const parsed = parser.parseFromString(element.innerHTML, "text/html");
  const text = parsed.body.textContent || "";
  return text.trim();
};

export default getHumanReadableText;
