export const buildQueryString = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  )
  if (entries.length === 0) {
    return ""
  }
  const searchParams = new URLSearchParams(
    entries.map(([key, value]) => [key, String(value)])
  )
  return `?${searchParams.toString()}`
}
