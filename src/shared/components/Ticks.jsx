// Decorative tick marks: two small triangles pinned to the left/right edges,
// drawn with ::before and ::after via Tailwind's before:/after: variants.
export function Ticks() {
  return (
    <div
      className="relative w-full
        before:absolute before:left-0 before:top-[-4.5px] before:border-[5px] before:border-transparent before:border-l-border before:content-['']
        after:absolute after:right-0 after:top-[-4.5px] after:border-[5px] after:border-transparent after:border-r-border after:content-['']"
    />
  )
}
