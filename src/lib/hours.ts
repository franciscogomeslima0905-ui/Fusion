import { hours, timeZone, type HoursGroup, type TimeRange } from '../config/site'

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Hora atual no fuso da academia, independente do fuso do visitante. */
export function nowInGym(date = new Date()): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '0'
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'))
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

export const groupForDay = (day: number): HoursGroup => hours.find((g) => g.days.includes(day)) ?? hours[0]

export type OpenStatus = { open: boolean; label: string; detail: string }

export function openStatus(date = new Date()): OpenStatus {
  const { day, minutes } = nowInGym(date)
  const today = groupForDay(day)
  const current = today.ranges.find((r) => minutes >= toMinutes(r.open) && minutes < toMinutes(r.close))
  if (current) return { open: true, label: 'Aberto agora', detail: `Fecha às ${current.close}` }

  const laterToday = today.ranges.find((r) => toMinutes(r.open) > minutes)
  if (laterToday) return { open: false, label: 'Fechado agora', detail: `Abre hoje às ${laterToday.open}` }

  for (let i = 1; i <= 7; i++) {
    const g = groupForDay((day + i) % 7)
    const first: TimeRange | undefined = g.ranges[0]
    if (first) return { open: false, label: 'Fechado agora', detail: `Abre ${i === 1 ? 'amanhã' : g.label.toLowerCase()} às ${first.open}` }
  }
  return { open: false, label: 'Fechado agora', detail: '' }
}

/** Formata "05:00" → "05h" e "09:30" → "09h30". */
export const shortTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':')
  return m === '00' ? `${h}h` : `${h}h${m}`
}
