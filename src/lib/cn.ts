export function cn(
  ...classes: (string | undefined | null | false | number | boolean)[]
): string {
  return classes.filter(Boolean).join(' ');
}
