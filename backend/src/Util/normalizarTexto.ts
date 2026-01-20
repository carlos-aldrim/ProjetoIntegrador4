export function normalizarTitulo(titulo: string): string {
  return titulo
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
