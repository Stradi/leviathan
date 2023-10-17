export function parseQueryParameters(url: string) {
  const queryParams: Record<string, string> = {};
  const urlObj = new URL(url);
  urlObj.search
    .slice(1)
    .split('&')
    .map((x) => x.split('='))
    .map(([key, value]) => {
      queryParams[key] = unescape(value);
    });

  return queryParams;
}
