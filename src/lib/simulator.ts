// Fictional, deterministic fixtures. This module has no service dependencies.
export const DEMO_KEY = 'fdnymx.demo.v1'
export const TODAY = '2026-09-12'
export const entryTypes = ['MSOT', 'RSOT', 'Awaiting Relief', 'Portal 2 Portal', 'Late Run', 'Other OT', 'MX On', 'MX Off', 'Medical', 'Light Duty', 'Vacation', 'Military', 'Crew On', 'Crew Off', 'Comp On', 'Comp Off', 'Training', 'Custom Event'] as const
export type EntryType = typeof entryTypes[number]
export type Entry = { id: string; type: EntryType; date: string; end: string; tour: '9x' | '6x'; hours: number; complete: boolean; training: string; vacation?: 'First Half' | 'Second Half' | 'Swapped' }
export const defaultColors = { '9x': '#FDD835', '6x': '#1E88E5', MSOT: '#558B2F', RSOT: '#827717', 'Other OT': '#546E7A', Vacation: '#CE93D8', Medical: '#E53935', 'Crew On': '#FB8C00', 'Crew Off': '#AB47BC', 'MX On': '#4FC3F7', 'MX Off': '#F9A825', 'Late Run': '#FF8200', 'Light Duty': '#FFB300', 'Custom Event': '#FDD835' }
export type DemoState = { entries: Entry[]; rank: 'Firefighter' | 'Officer'; partner: boolean; status: 'Open' | 'Accepted' | 'Completed' | 'Declined'; connected: string[]; colors: typeof defaultColors; syncDismissed: boolean; reminders: boolean; backedUp: boolean; reportHours: number; rsot: { date: string; tour: '9x' | '6x' }[] }
export const crew = ['Johnny Staylow', 'Joe Floorbelow', 'Casey Demohelm', 'Riley Samplehose']
const entry = (id: string, type: EntryType, date: string, hours: number, tour: '9x' | '6x' = '9x', end = date): Entry => ({ id, type, date, end, hours, tour, complete: false, training: 'CFR-D' })
export function seedDemo(): DemoState {
  return {
    entries: [entry('ot1', 'MSOT', TODAY, 9), entry('rsot-row-0', 'RSOT', '2026-09-14', 9), entry('ot3', 'Awaiting Relief', '2026-09-16', .75), entry('ot4', 'MSOT', '2026-09-18', 15, '6x'), entry('ot5', 'Portal 2 Portal', '2026-11-22', 1.25), entry('ot6', 'Other OT', '2026-11-28', 9), entry('mx1', 'MX Off', '2026-09-13', 15, '6x'), entry('mx2', 'MX On', '2026-09-10', 9), entry('leave1', 'Medical', '2026-09-20', 9), entry('leave2', 'Vacation', '2026-09-24', 45, '9x', '2026-09-28'), entry('leave3', 'Military', '2026-10-03', 24, '9x', '2026-10-04'), entry('crew1', 'Crew On', TODAY, 9), entry('crew2', 'Crew Off', '2026-09-15', 15, '6x'), entry('training1', 'Training', '2026-09-17', 3)],
    rank: 'Firefighter', partner: true, status: 'Open', connected: [], colors: { ...defaultColors }, syncDismissed: false, reminders: true, backedUp: false, reportHours: 18,
    rsot: Array.from({ length: 8 }, (_, i) => ({ date: `2026-${String(9 + Math.floor(i / 3)).padStart(2, '0')}-${String(14 + i % 3 * 6).padStart(2, '0')}`, tour: '9x' })),
  }
}
const isDate = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00`).valueOf()) && iso(new Date(`${value}T12:00:00`)) === value
export function loadDemo(): DemoState {
  try {
    const value: DemoState = JSON.parse(localStorage.getItem(DEMO_KEY) || 'null')
    if (!value || !Array.isArray(value.entries) || value.entries.length > 1000 || !value.entries.every(e => e && typeof e.id === 'string' && entryTypes.includes(e.type) && isDate(e.date) && isDate(e.end) && e.end >= e.date && ['9x', '6x'].includes(e.tour) && Number.isFinite(e.hours) && e.hours >= 0 && e.hours <= 1000 && typeof e.complete === 'boolean' && ['CFR-D', 'HazMat Ops', 'ERP', 'Green Energy'].includes(e.training) && (e.vacation === undefined || ['First Half', 'Second Half', 'Swapped'].includes(e.vacation)))) return seedDemo()
    if (!['Firefighter', 'Officer'].includes(value.rank) || !['Open', 'Accepted', 'Completed', 'Declined'].includes(value.status) || !['partner', 'syncDismissed', 'reminders', 'backedUp'].every(k => typeof value[k as keyof DemoState] === 'boolean') || !Array.isArray(value.connected) || !value.connected.every(n => crew.includes(n)) || !value.colors || !Object.keys(defaultColors).every(k => /^#[0-9a-f]{6}$/i.test(value.colors[k as keyof typeof defaultColors])) || !Number.isFinite(value.reportHours) || value.reportHours < 0 || value.reportHours > 1000000 || !Array.isArray(value.rsot) || value.rsot.length !== 8 || !value.rsot.every(r => r && isDate(r.date) && ['9x', '6x'].includes(r.tour))) return seedDemo()
    return value
  } catch { return seedDemo() }
}
export function iso(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
export function shiftDate(date: string, days: number) { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate() + days); return iso(d) }
export function formatDate(date: string, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) { return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', options) }
export const isOT = (e: Entry) => ['MSOT', 'RSOT', 'Awaiting Relief', 'Portal 2 Portal', 'Late Run', 'Other OT'].includes(e.type)
export const onDate = (e: Entry, date: string) => e.date <= date && e.end >= date
export const sumHours = (entries: Entry[]) => entries.reduce((sum, e) => sum + e.hours, 0)
export const hoursText = (hours: number) => `${Number(hours.toFixed(2))}h`
export function entryLabel(e: Entry) { return e.type === 'Awaiting Relief' ? `AR ${Number((e.hours * 60).toFixed(2))}m` : e.type === 'Portal 2 Portal' ? `P2P ${Number((e.hours * 60).toFixed(2))}m` : `${e.type === 'Medical' ? '+Medical' : e.type}${['MSOT', 'RSOT', 'MX On', 'MX Off', 'Crew On', 'Crew Off'].includes(e.type) ? ` ${e.tour}` : ''}` }
