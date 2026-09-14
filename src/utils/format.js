export function fmt(ms) {
  const t = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(t / 60)
  const s = t % 60
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
}
