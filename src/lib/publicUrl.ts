/** Файл из public/ с учётом base. Локально это `/img/…`, на GitHub Pages — `/oge-chem/img/…`. */
export function publicUrl(src: string): string {
  if (!src.startsWith('/') || src.startsWith('//')) return src
  return import.meta.env.BASE_URL + src.slice(1)
}
