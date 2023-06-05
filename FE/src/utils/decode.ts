export function deslugify(slug: string) {
  const words = slug.split("-");
  const deslugifiedText = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return deslugifiedText;
}
