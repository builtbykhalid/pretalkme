export function slugify(input: string, maxLength = 60): string {
  if (!input) return '';
  // Normalize and remove diacritics
  const normalized = input.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  // Lowercase, replace non-alphanum with '-', collapse multiple '-' and trim
  const slug = normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength);
  return slug;
}

export default slugify;
