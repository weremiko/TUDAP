export function serializeJsonLd(value: unknown): string {
  const json = JSON.stringify(value)
  if (json === undefined) throw new TypeError("JSON-LD değeri serialize edilemedi")

  return json
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
}