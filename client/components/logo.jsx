import Link from "next/link"

const sizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
}

export function Logo({ size = "md", asLink = true }) {
  const content = (
    <span className={`font-heading font-extrabold tracking-tight ${sizes[size]}`}>
      <span className="text-primary">Grammar</span>
      <span className="text-accent">Boost</span>
    </span>
  )

  if (asLink) {
    return <Link href="/">{content}</Link>
  }

  return content
}
