import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowLeftRight, Bell, CalendarDays, Check, ChevronLeft, ChevronRight, ClipboardList, Clock3, Flame, HardHat, Info, Plus, RotateCcw, Settings as SettingsIcon, ShieldCheck, Users, X } from 'lucide-react'
import { crew, defaultColors, DEMO_KEY, entryLabel, entryTypes, formatDate, hoursText, isOT, iso, loadDemo, onDate, seedDemo, shiftDate, sumHours, TODAY, type DemoState, type Entry, type EntryType } from '../lib/simulator'
import './AppSimulator.css'

type Tab = 'Calendar' | 'Tracker' | 'My Crew' | 'Settings'
type ModalState = { kind: 'day'; date: string } | { kind: 'entry'; type: EntryType } | { kind: 'detail'; id: string } | { kind: 'reset' | 'deletePartner' | 'request' | 'sync' | 'training' | 'paywall' } | { kind: 'info'; title: string; text: string }
const tabs = [{ name: 'Calendar', icon: CalendarDays }, { name: 'Tracker', icon: ClipboardList }, { name: 'My Crew', icon: Users }, { name: 'Settings', icon: SettingsIcon }] as const
const holidays: Record<string, string> = { '09-07': 'Labor Day', '09-11': 'Never Forget', '11-11': 'Veterans Day', '11-26': 'Thanksgiving', '12-25': 'Christmas', '01-01': 'New Year’s Day', '07-04': 'Independence Day' }
function Panel({ children, className = '' }: { children: ReactNode; className?: string }) { return <div className={`sim-panel ${className}`}>{children}</div> }
function Empty({ title, children }: { title: string; children: ReactNode }) { return <Panel className="sim-empty"><CalendarDays size={24} /><h3>{title}</h3><p>{children}</p></Panel> }
function Segments<T extends string>({ values, value, onChange, label }: { values: readonly T[]; value: T; onChange: (value: T) => void; label: string }) { return <div className="sim-segments" role="group" aria-label={label}>{values.map(item => <button key={item} aria-pressed={item === value} onClick={() => onChange(item)}>{item}</button>)}</div> }
function Accordion({ title, meta, children, open = false }: { title: string; meta?: string; children: ReactNode; open?: boolean }) { return <details className="sim-accordion" open={open || undefined}><summary><span>{title}</span>{meta && <small>{meta}</small>}<ChevronRight size={15} /></summary><div className="sim-accordion-body">{children}</div></details> }
function Dialog({ title, onClose, children, sheet = false }: { title: string; onClose: () => void; children: ReactNode; sheet?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const dialog = ref.current!
    dialog.showModal()
    return () => { dialog.close(); previous?.focus() }
  }, [])
  return <dialog ref={ref} className={`sim-dialog ${sheet ? 'sim-dialog-sheet' : ''}`} aria-labelledby="sim-dialog-title" onCancel={e => { e.preventDefault(); onClose() }} onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose() } }}><div className="sim-dialog-heading"><div><span className="sim-kicker">FICTIONAL DATA · LOCAL DEMO</span><h2 id="sim-dialog-title">{title}</h2></div><button className="sim-icon-button" onClick={onClose} aria-label="Close dialog"><X size={20} /></button></div>{children}</dialog>
}
function EntryForm({ initialType, date, save }: { initialType: EntryType; date: string; save: (entry: Entry) => void }) {
  const [type, setType] = useState<EntryType>(initialType)
  const [start, setStart] = useState(date)
  const [end, setEnd] = useState(date)
  const leave = ['Vacation', 'Medical', 'Military'].includes(type)
  return <form className="sim-form" onSubmit={e => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    save({ id: crypto.randomUUID(), type, date: start, end: leave ? end : start, tour: data.get('tour') as '9x' | '6x', hours: Number(data.get('hours')) / (data.get('unit') === 'minutes' ? 60 : 1), training: String(data.get('training') || 'CFR-D'), vacation: type === 'Vacation' ? data.get('vacation') as Entry['vacation'] : undefined, complete: false })
  }}><p>Build a sample entry for Johnny Staylow. Use the demo choices below.</p><label>Entry type<select aria-label="Entry type" value={type} onChange={e => setType(e.target.value as EntryType)}>{entryTypes.map(t => <option key={t}>{t}</option>)}</select></label><label>Entry date<input required type="date" min="2020-01-01" max="2099-12-31" value={start} onChange={e => { setStart(e.target.value); if (e.target.value > end) setEnd(e.target.value) }} /></label>{leave && <label>End date<input type="date" required min={start} max="2099-12-31" value={end} onChange={e => setEnd(e.target.value)} /></label>}<div className="sim-form-pair"><label>Tour<select aria-label="Tour" name="tour"><option>9x</option><option>6x</option></select></label><label>Duration<input required type="number" name="hours" min="0.25" max="720" step="0.25" defaultValue={9} /></label></div><label>Duration unit<select aria-label="Duration unit" name="unit"><option value="hours">Hours</option><option value="minutes">Minutes</option></select></label>{type === 'Vacation' && <label>Vacation selection<select aria-label="Vacation selection" name="vacation"><option>First Half</option><option>Second Half</option><option>Swapped</option></select><small>Pick the start and end days from the calendar fields above.</small></label>}{type === 'Training' && <label>Training type<select aria-label="Training type" name="training">{['CFR-D', 'HazMat Ops', 'ERP', 'Green Energy'].map(t => <option key={t}>{t}</option>)}</select></label>}<button className="sim-primary" type="submit">Save demo entry <Check size={16} /></button></form>
}

export function AppSimulator() {
  const [data, setDemoData] = useState(loadDemo)
  const [tab, setTab] = useState<Tab>('Calendar')
  const [tracker, setTracker] = useState('OT LOG')
  const [crewTab, setCrewTab] = useState('CREW')
  const [view, setView] = useState('WEEK')
  const [fullscreen, setFullscreen] = useState(false)
  const fullscreenButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!fullscreen) return
    const y = window.scrollY
    const trigger = fullscreenButton.current
    document.body.classList.add('sim-fullscreen-active')
    return () => {
      document.body.classList.remove('sim-fullscreen-active')
      window.scrollTo({ top: y, behavior: 'instant' })
      trigger?.focus({ preventScroll: true })
    }
  }, [fullscreen])
  const [largeMonthText, setLargeMonthText] = useState(false)
  const [date, setDate] = useState(TODAY)
  const [subpage, setSubpage] = useState('')
  const [modal, setModal] = useState<ModalState | null>(null)
  const [toast, setToast] = useState('')
  const [storageError, setStorageError] = useState(false)
  const [query, setQuery] = useState('')
  const content = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  function setData(action: DemoState | ((old: DemoState) => DemoState)) {
    const next = typeof action === 'function' ? action(data) : action
    try { localStorage.setItem(DEMO_KEY, JSON.stringify(next)); setStorageError(false) } catch { setStorageError(true) }
    setDemoData(next)
  }
  const firstNavigation = useRef(true)
  useEffect(() => {
    content.current?.scrollTo(0, 0)
    if (!firstNavigation.current) {
      // Some mobile browsers ignore preventScroll and yank the page to reveal the heading,
      // pushing the bottom tab bar below the fold. Restore the scroll position if that happens.
      const y = window.scrollY
      heading.current?.focus({ preventScroll: true })
      if (window.scrollY !== y) window.scrollTo(0, y)
    }
    firstNavigation.current = false
  }, [tab, subpage])
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 4500); return () => clearTimeout(timer) }, [toast])
  function update(patch: Partial<DemoState>) { setData(old => ({ ...old, ...patch })) }
  function navigate(next: Tab) { setTab(next); setSubpage('') }
  function showPage(page: string) { setSubpage(page) }
  function info(title: string, text: string) { setModal({ kind: 'info', title, text }) }
  function finish(message: string) { setModal(null); setToast(message) }
  function addEntry(entry: Entry) { setData(old => ({ ...old, entries: [...old.entries, entry] })); setDate(entry.date); finish('Demo entry saved. Only this browser was updated.') }
  function removeEntry(id: string) { setData(old => ({ ...old, entries: old.entries.filter(e => e.id !== id) })); finish('Demo entry removed.') }
  function color(type: string) { return data.colors[type as keyof typeof defaultColors] || (type === 'Military' ? '#80CBC4' : '#D4A94E') }
  function chip(e: Entry, mini = false) { return <span className={`sim-chip ${mini ? 'sim-chip-mini' : ''}`} style={{ '--chip': color(e.type) } as CSSProperties}>{entryLabel(e)}</span> }
  function events(entries: Entry[]) { return entries.length ? <div className="sim-events">{entries.map(e => <article className="sim-event" key={e.id}><button className="sim-event-main" aria-label={`View ${e.type} on ${formatDate(e.date)}`} onClick={() => setModal({ kind: 'detail', id: e.id })}><span className="sim-event-stripe" style={{ background: color(e.type) }} /><span>{chip(e)}<strong>{e.type === 'Training' ? e.training : e.type === 'MX On' || e.type === 'MX Off' ? 'Joe Floorbelow' : e.type === 'Crew On' ? 'Johnny Staylow' : e.type === 'Crew Off' ? 'Casey Demohelm' : e.type === 'Other OT' ? 'ERP · Demo assignment' : 'L99 · Demo entry'}</strong><small>{formatDate(e.date)}{e.end !== e.date ? ` – ${formatDate(e.end)}` : ''} · {hoursText(e.hours)} {e.vacation && `· ${e.vacation}`} {e.complete && '· Complete ✓'}</small></span><ChevronRight size={16} /></button></article>)}</div> : <Empty title="No events">Nothing scheduled. Add a demo entry to try it.</Empty> }
  function addButton(type: EntryType, label: string) { return <button className="sim-add" onClick={() => setModal({ kind: 'entry', type })}><Plus size={17} />{label}</button> }
  function daySheet(day: string) {
    const add = (type: EntryType, tour: '9x' | '6x', hours: number, days = 0) => { setData(old => ({ ...old, entries: [...old.entries, { id: crypto.randomUUID(), type, date: day, end: shiftDate(day, days), tour, hours, complete: false, training: 'CFR-D' }] })); setToast(`Demo ${type} entry added to ${formatDate(day)}.`) }
    const sheetBtn = (type: EntryType, label: string, tour: '9x' | '6x', hours: number, days = 0, span = 3) => <button className="sim-sheet-btn" style={{ borderColor: color(type), color: color(type), gridColumn: `span ${span}` }} onClick={() => add(type, tour, hours, days)}>{label}</button>
    return <div className="sim-day-sheet">
      <p className="sim-sheet-label">TODAY'S ROSTER</p>
      <div className="sim-roster"><span className="sim-roster-tour">9x</span><span>(15) (16) 17* 18 19 20</span><span className="sim-roster-tour">6x</span><span>5* 6* 7* 8 9 10</span></div>
      {mutualPickSection(day)}
      <p className="sim-sheet-label">ADD TO THIS DAY</p>
      <div className="sim-sheet-grid">
        {sheetBtn('MSOT', '● MSOT 9x', '9x', 9)}{sheetBtn('MSOT', '● MSOT 6x', '6x', 15)}
        {sheetBtn('RSOT', '● RSOT 9x', '9x', 9)}{sheetBtn('RSOT', '● RSOT 6x', '6x', 15)}
        {sheetBtn('MX On', 'MX On (Work)', '9x', 9)}{sheetBtn('MX Off', 'MX Off (Joe)', '6x', 15)}
        {sheetBtn('Awaiting Relief', 'Awaiting Relief', '9x', .75, 0, 2)}{sheetBtn('Portal 2 Portal', 'P2 Portal', '9x', 1.25, 0, 2)}{sheetBtn('Late Run', 'Late Run / Wash Up', '9x', .5, 0, 2)}
        {sheetBtn('Other OT', '● Other OT', '9x', 9)}{sheetBtn('Custom Event', '★ Custom Event', '9x', 1)}
      </div>
      <p className="sim-sheet-label">LEAVE & DUTY STATUS</p>
      <div className="sim-leave-row">
        {sheetBtn('Medical', 'Medical Leave', '9x', 9)}{sheetBtn('Light Duty', 'Light Duty', '9x', 9)}{sheetBtn('Military', 'Military Leave', '9x', 24, 1)}{sheetBtn('Vacation', 'Vacation', '9x', 45, 4)}
      </div>
      <p className="sim-sheet-note">Marks status on calendar only — does not affect OT or mutual tracking.</p>
      {data.entries.some(e => onDate(e, day)) && <><p className="sim-sheet-label">ON THIS DAY</p>{events(data.entries.filter(e => onDate(e, day)))}</>}
    </div>
  }
  function row(label: string, action: () => void, detail?: string) { return <button className="sim-row" onClick={action}><span>{label}{detail && <small>{detail}</small>}</span><ChevronRight size={16} /></button> }
  const ots = data.entries.filter(isOT)
  // Fifteen historical fictional tours precede the two editable sample swaps.
  const mxOn = data.partner ? 7 + data.entries.filter(e => e.type === 'MX On').length : 0
  const mxOff = data.partner ? 8 + data.entries.filter(e => e.type === 'MX Off').length : 0
  const mxBalance = mxOn - mxOff
  const selectedEvents = data.entries.filter(e => onDate(e, date))
  const startOfWeek = shiftDate(date, -((new Date(`${date}T12:00:00`).getDay() + 6) % 7))
  const dates = Array.from({ length: 7 }, (_, i) => shiftDate(startOfWeek, i))
  const year = Number(date.slice(0, 4))
  const month = Number(date.slice(5, 7)) - 1
  function moveDate(direction: number) {
    if (view === 'WEEK') setDate(shiftDate(date, direction * 7))
    else setDate(iso(new Date(year + (view === 'YEAR' ? direction : 0), month + (view === 'MONTH' ? direction : 0), 1, 12)))
  }
  function monthGrid(m: number, mini = false) {
    const first = new Date(year, m, 1, 12)
    const count = new Date(year, m + 1, 0).getDate()
    const offset = (first.getDay() + 6) % 7
    return <div className={`sim-month ${mini ? 'sim-month-mini' : ''}`}><div className="sim-weekday-labels">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}</div><div className="sim-month-grid">{Array.from({ length: offset }, (_, i) => <span key={`blank${i}`} />)}{Array.from({ length: count }, (_, i) => {
      const day = iso(new Date(year, m, i + 1, 12)); const entries = data.entries.filter(e => onDate(e, day)); const holiday = holidays[day.slice(5)]; const payday = (i + 1 === 11 || i + 1 === 25)
      return <button className={`${date === day ? 'is-selected' : ''} ${day === TODAY ? 'is-today' : ''}`} key={day} aria-label={`${formatDate(day)}${holiday ? `, ${holiday}` : ''}${entries.length ? `, ${entries.length} entries` : ''}`} aria-pressed={date === day} onClick={() => { setDate(day); if (mini) setView('MONTH') }}><span className="sim-day-number">{i + 1}{payday && <small>$</small>}</span><span className="sim-tour-ticks"><i style={{ background: color('9x') }}>9x</i><i style={{ background: color('6x') }}>6x</i></span>{!mini && holiday && <span className="sim-holiday">{holiday}</span>}{entries.slice(0, mini ? 1 : 2).map(e => <span key={e.id}>{chip(e, true)}</span>)}{entries.length > (mini ? 1 : 2) && <small>+{entries.length - (mini ? 1 : 2)}</small>}</button>
    })}</div></div>
  }
  function monthTours(day: string) {
    // Fictional tour pattern matching the reference calendar's two group bands.
    const dayNumber = Number(day.slice(-2))
    if (day.startsWith('2026-11')) {
      return {
        day: [2, 5, 10, 14, 17, 22].includes(dayNumber) ? 'blue' : [1, 6, 9, 13, 18, 21, 26, 27].includes(dayNumber) ? 'yellow' : '',
        night: [1, 5, 9, 13, 16, 22, 26].includes(dayNumber) ? 'blue' : [4, 8, 12, 17, 21, 29].includes(dayNumber) ? 'yellow' : '',
      }
    }
    const cycle = ((Math.round((new Date(`${day}T12:00:00`).valueOf() - new Date('2026-09-04T12:00:00').valueOf()) / 86400000) % 8) + 8) % 8
    return { day: [0, 1].includes(cycle) ? 'blue' : [3, 4].includes(cycle) ? 'yellow' : '', night: [3, 4].includes(cycle) ? 'blue' : [6, 7].includes(cycle) ? 'yellow' : '' }
  }
  // A line-up day: Johnny's group works one tour while Joe's group works the other — a mutual opportunity.
  function lineupTours(day: string) { const tours = monthTours(day); return !!tours.day && !!tours.night && tours.day !== tours.night }
  function lineupWindow(day: string): [string, string] | null {
    if (!lineupTours(day)) return null
    const start = lineupTours(shiftDate(day, 1)) ? day : lineupTours(shiftDate(day, -1)) ? shiftDate(day, -1) : day
    return [start, shiftDate(start, 1)]
  }
  function applyMutualSet(name: string, tours: { date: string; tour: '9x' | '6x' }[]) {
    setData(old => ({ ...old, entries: [...old.entries, ...tours.map((t): Entry => ({ id: crypto.randomUUID(), type: t.tour === '9x' ? 'MX On' : 'MX Off', date: t.date, end: t.date, tour: t.tour, hours: t.tour === '9x' ? 9 : 15, complete: false, training: 'CFR-D' }))] }))
    setToast(`${name} logged with Joe Floorbelow. Demo only — nothing was sent.`)
  }
  function mutualPickSection(day: string) {
    const pair = lineupWindow(day)
    if (!pair) return null
    const [first, second] = pair
    const dow = (d: string) => formatDate(d, { weekday: 'long' })
    const card = (num: string, name: string, sub: string, tours: { date: string; tour: '9x' | '6x' }[]) => <button className="sim-pick-card" onClick={() => applyMutualSet(name, tours)}><span className="sim-pick-num">{num}</span><strong>{name}</strong><small>{sub}</small></button>
    return <>
      <p className="sim-sheet-label">MUTUAL OPPORTUNITY</p>
      <p className="sim-sheet-question">Which set are you working?</p>
      <div className="sim-pick-grid">
        {card('1', 'First Set', `${dow(first)} · 9x + 6x`, [{ date: first, tour: '9x' }, { date: first, tour: '6x' }])}
        {card('2', 'Second Set', `${dow(second)} · 9x + 6x`, [{ date: second, tour: '9x' }, { date: second, tour: '6x' }])}
        {card('3', 'Insides', `${dow(first)} 6x + ${dow(second)} 9x`, [{ date: first, tour: '6x' }, { date: second, tour: '9x' }])}
        {card('4', 'Outsides', `${dow(first)} 9x + ${dow(second)} 6x`, [{ date: first, tour: '9x' }, { date: second, tour: '6x' }])}
      </div>
      <p className="sim-sheet-note">Both groups work this window — pick the 24-hour block you take with Joe. Demo only.</p>
    </>
  }
  function referenceMonth(monthDate: Date) {
    const y = monthDate.getFullYear(), m = monthDate.getMonth()
    const offset = new Date(y, m, 1, 12).getDay()
    const count = new Date(y, m + 1, 0).getDate()
    const trailing = (7 - (offset + count) % 7) % 7
    return <div className="sim-reference-grid">
      {offset > 0 && <div className="sim-reference-month-label" style={{ gridColumn: `span ${offset}` }}><strong>{formatDate(iso(monthDate), { month: 'long' })}</strong><span>{y}</span></div>}
      {Array.from({ length: count }, (_, i) => {
        const day = iso(new Date(y, m, i + 1, 12))
        const entries = data.entries.filter(e => onDate(e, day))
        const tours = monthTours(day)
        const holiday = holidays[day.slice(5)]
        const payday = Math.round((new Date(`${day}T12:00:00`).valueOf() - new Date('2026-09-11T12:00:00').valueOf()) / 86400000) % 14 === 0
        const dayEntries = entries.filter(e => e.tour === '9x' && !['Vacation', 'Medical', 'Military', 'Crew On', 'Crew Off'].includes(e.type))
        const nightEntries = entries.filter(e => e.tour === '6x' && !['Vacation', 'Medical', 'Military', 'Crew On', 'Crew Off'].includes(e.type))
        const leave = entries.filter(e => ['Vacation', 'Medical', 'Military'].includes(e.type))
        function band(e: Entry) {
          return <span key={e.id} className="sim-reference-entry" style={{ background: ['Awaiting Relief', 'Portal 2 Portal'].includes(e.type) ? '#FF8200' : color(e.type), color: ink(color(e.type)) }}>{entryLabel(e)}{e.complete && ' ✓'}</span>
        }
        return <button key={day} className={`sim-reference-day ${day === TODAY ? 'is-today' : ''}`} aria-label={`${formatDate(day)}${holiday ? `, ${holiday}` : ''}${lineupTours(day) ? ', mutual opportunity' : ''}${entries.length ? `, ${entries.length} entries` : ''}`} aria-pressed={day === date} onClick={() => { setDate(day); setModal({ kind: 'day', date: day }) }}>
          <span className="sim-reference-date">{i + 1}{payday && <b>$</b>}</span>
          <span className="sim-reference-day-tour">{dayEntries.length ? dayEntries.slice(0, 2).map(band) : tours.day && <span className={`sim-reference-tour ${tours.day}`}>9x{tours.day === 'yellow' && <small>⊘</small>}</span>}</span>
          {holiday && <span className="sim-reference-holiday">{holiday}</span>}
          <span className="sim-reference-night-tour">{nightEntries.length ? nightEntries.slice(0, 2).map(band) : tours.night && <span className={`sim-reference-tour ${tours.night}`}>6x{tours.night === 'yellow' && <small>⊘</small>}</span>}</span>
          <span className="sim-reference-leave">{leave.slice(0, 1).map(band)}</span>
          {entries.some(e => ['Crew On', 'Crew Off'].includes(e.type)) && <span className="sim-reference-crew-dot" />}
          {lineupTours(day) && <span className="sim-reference-mx-dot" aria-hidden="true" />}
          {entries.length > 2 && <span className="sim-reference-more">+{entries.length - 2}</span>}
        </button>
      })}
      {Array.from({ length: trailing }, (_, i) => <div className="sim-reference-blank" key={`blank-${i}`} />)}
    </div>
  }
  function ink(hex: string) {
    const rgb = hex.slice(1).match(/../g)!.map(v => parseInt(v, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
    return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2] > .179 ? '#000000' : '#FFFFFF'
  }
  function calendar() { return <>
    <div className="sim-calendar-controls"><Segments values={['WEEK', 'MONTH', 'YEAR']} value={view} onChange={setView} label="Calendar view" />
    <div className="sim-date-nav"><button className="sim-icon-button" aria-label={`Previous ${view.toLowerCase()}`} onClick={() => moveDate(-1)}><ChevronLeft size={19} /></button><h3>{view === 'WEEK' ? `${formatDate(startOfWeek, { month: 'short', day: 'numeric' })} – ${formatDate(dates[6], { month: 'short', day: 'numeric' })}` : view === 'MONTH' ? formatDate(date, { month: 'long', year: 'numeric' }) : year}</h3><button className="sim-today" onClick={() => setDate(TODAY)}>TODAY</button><button className="sim-icon-button" aria-label={`Next ${view.toLowerCase()}`} onClick={() => moveDate(1)}><ChevronRight size={19} /></button></div></div>
    {view === 'WEEK' && <><Panel className="sim-stay-low"><div><Flame size={18} /><h3>Stay Low</h3><span aria-label="Demo weather unavailable">--°</span></div><p>SATURDAY, SEPTEMBER 12</p><strong>06:00 PM <span>FDNY Night Tour</span></strong><small>Johnny Staylow · L99 · Fictional schedule</small></Panel><div className="sim-week-strip">{dates.map(d => <button key={d} aria-pressed={d === date} aria-label={formatDate(d)} onClick={() => setDate(d)}><small>{formatDate(d, { weekday: 'short' })}</small><strong>{Number(d.slice(-2))}</strong><span className="sim-event-dots">{data.entries.filter(e => onDate(e, d)).slice(0, 3).map(e => <i key={e.id} style={{ background: color(e.type) }} />)}</span></button>)}</div><div className="sim-tour-legend"><p><b style={{ color: color('9x') }}>9x</b><span>(1) (2) 3* 4 5 6</span><small>DAY TOUR</small></p><p><b style={{ color: color('6x') }}>6x</b><span>16* 17* 18* 19 20 21</span><small>NIGHT TOUR</small></p></div></>}
    {view === 'MONTH' && <>
      <div className="sim-reference-legend" aria-label="Calendar color legend">{[['Grp 11', '#1666BD'], ['Grp 24', '#FFDE00'], ['MSOT', color('MSOT')], ['RSOT', color('RSOT')], ['MX On', color('MX On')], ['MX Off', color('MX Off')], ['Crew On', color('Crew On')], ['Crew Off', color('Crew Off')]].map(([name, fill]) => <span key={name} style={{ background: fill, color: ink(fill) }}>{name}</span>)}<button aria-label="Month calendar text size" onClick={() => setLargeMonthText(!largeMonthText)} aria-pressed={largeMonthText}>Aa</button></div>
      <div className="sim-reference-weekdays">{['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <span key={d}>{d}</span>)}</div>
      <div className={`sim-reference-months ${largeMonthText ? 'sim-reference-large-text' : ''}`}>
        {referenceMonth(new Date(year, month, 1, 12))}
        {referenceMonth(new Date(year, month + 1, 1, 12))}
      </div>
    </>}
    {view === 'YEAR' ? <div className="sim-year">{Array.from({ length: 12 }, (_, m) => <section key={m}><h3>{formatDate(`${year}-${String(m + 1).padStart(2, '0')}-01`, { month: 'long' })}</h3>{monthGrid(m, true)}</section>)}</div> : view === 'WEEK' ? <><div className="sim-section-label"><h3>{formatDate(date, { weekday: 'long', month: 'short', day: 'numeric' })}</h3><span>{selectedEvents.length} EVENTS</span></div>{holidays[date.slice(5)] && <p className="sim-holiday-note">{holidays[date.slice(5)]}</p>}{events(selectedEvents)}</> : null}
    {view !== 'MONTH' && !data.syncDismissed && <Panel className="sim-warning"><Info size={18} /><div><strong>Sync Warning · demo</strong><p>Sample offline state. Your demo stays in this browser.</p><button onClick={() => setModal({ kind: 'sync' })}>View warning</button></div><button className="sim-icon-button" aria-label="Dismiss sync warning" onClick={() => update({ syncDismissed: true })}><X size={16} /></button></Panel>}
    {view !== 'MONTH' && <button className="sim-fab sim-fab-gold" aria-label="Add calendar entry" onClick={() => setModal({ kind: 'entry', type: 'MSOT' })}><Plus size={25} /></button>}
  </> }
  function mutuals() { return <>
    <Panel className="sim-balance"><span className="sim-kicker">MX BALANCE</span><strong>{mxBalance}</strong><p>{!data.partner ? 'No mutual history' : mxBalance === 0 ? 'Johnny and Joe are even' : mxBalance < 0 ? `Johnny Staylow owes Joe ${-mxBalance} tour${mxBalance === -1 ? '' : 's'}` : `Joe Floorbelow owes Johnny ${mxBalance} tour${mxBalance === 1 ? '' : 's'}`}</p><div className="sim-balance-pair"><span><b>{mxOn}</b> MX ON</span><span><b>{mxOff}</b> MX OFF</span></div></Panel>
    {data.partner ? <>{row('Joe Floorbelow', () => showPage('Joe Floorbelow'), `${mxBalance} tour balance · View mutual history`)}<h3 className="sim-section-title">MUTUAL HISTORY</h3>{events(data.entries.filter(e => ['MX On', 'MX Off'].includes(e.type)))}{row('Open mutual request', () => setModal({ kind: 'request' }), `Joe Floorbelow · Sep 19 · 6x · ${data.status}`)}</> : <Empty title="No mutual partners">Your demo partner and history were removed. Reset the demo to restore them.</Empty>}
  </> }
  function partnerDetail() { return <><Panel><div className="sim-profile"><span className="sim-avatar">JF</span><div><strong>Joe Floorbelow</strong><p>L99 · GROUP 10 · DEMO</p></div></div><p className="sim-muted">Johnny Staylow ↔ Joe Floorbelow</p><div className="sim-balance-pair"><span><b>{mxOff}</b> THEY WORKED FOR YOU</span><span><b>{mxOn}</b> YOU WORKED THEIR</span></div></Panel>{row('Open mutual request', () => setModal({ kind: 'request' }), `Sep 19, 2026 · 6x · ${data.status}`)}{events(data.entries.filter(e => ['MX On', 'MX Off'].includes(e.type)))}<p className="sim-muted">Opening balance includes 15 earlier fictional tours.</p><button className="sim-danger" onClick={() => setModal({ kind: 'deletePartner' })}>Remove mutual partner & history</button></> }
  function schedule() { return <>
    <Accordion title="01 SCHEDULE" open>{['RSOT Dates', 'Vacation Leaves', 'Medical & Other', 'Comp Time', 'Training Dates'].map(name => <div key={name}>{row(name, () => showPage(name))}</div>)}</Accordion>
    <Accordion title="02 TRAINING DATES" meta="DUE SOON">{events(data.entries.filter(e => e.type === 'Training'))}{row('Manage training dates', () => showPage('Training Dates'))}</Accordion>
    <Accordion title="03 LEAVE HOURS" meta={hoursText(sumHours(data.entries.filter(e => ['Vacation', 'Medical', 'Military'].includes(e.type))))}>{['Vacation', 'Medical', 'Military'].map(type => <p className="sim-total-row" key={type}><span>{type}</span><strong>{hoursText(sumHours(data.entries.filter(e => e.type === type)))}</strong></p>)}</Accordion>
  </> }
  function schedulePage() {
    if (subpage === 'RSOT Dates') return <><Panel><h3>EDIT RSOT DATES</h3><p>Eight sample dates. Change dates and tours below.</p><button className="sim-add" onClick={() => info('Demo scan preview', 'Sample RSOT dates are already filled in. No camera, upload, or real OT sheet is used in this simulator.')}><ClipboardList size={17} />Preview sample scan</button></Panel>{data.rsot.map((r, i) => <div className="sim-rsot-row" key={i}><strong>#{i + 1}</strong><input type="date" min="2020-01-01" max="2099-12-31" required aria-label={`RSOT date ${i + 1}`} value={r.date} onChange={e => { if (e.target.validity.valid) update({ rsot: data.rsot.map((old, j) => i === j ? { ...old, date: e.target.value } : old) }) }} /><Segments label={`RSOT tour ${i + 1}`} values={['9x', '6x']} value={r.tour} onChange={tour => update({ rsot: data.rsot.map((old, j) => i === j ? { ...old, tour } : old) })} /></div>)}<label className="sim-toggle"><input type="checkbox" checked={data.reminders} onChange={e => update({ reminders: e.target.checked })} /> Demo reminders <small>Local setting only</small></label><button className="sim-primary" onClick={() => { setData(old => ({ ...old, entries: [...old.entries.filter(e => !e.id.startsWith('rsot-row-')), ...old.rsot.map((r, i): Entry => ({ id: `rsot-row-${i}`, type: 'RSOT', date: r.date, end: r.date, tour: r.tour, hours: r.tour === '9x' ? 9 : 15, complete: false, training: 'CFR-D' }))] })); setToast('Eight demo RSOT dates applied to the calendar.') }}>Apply dates to demo calendar</button></>
    if (subpage === 'Vacation Leaves') return <>{addButton('Vacation', 'Enter vacation leave')}{events(data.entries.filter(e => e.type === 'Vacation'))}<Panel><h3>MX PARTNER VACATION</h3><p>{data.partner ? 'Joe Floorbelow · Second Half' : 'No partner selected'}</p>{data.partner && <small>Oct 12 – 16, 2026 · Fictional example</small>}</Panel></>
    if (subpage === 'Medical & Other') return <>{addButton('Medical', 'Add medical or other leave')}{events(data.entries.filter(e => ['Medical', 'Military', 'Vacation'].includes(e.type)))}</>
    if (subpage === 'Comp Time') { const entries = data.entries.filter(e => e.type.startsWith('Comp')); return <><Panel className="sim-balance"><span className="sim-kicker">COMP TIME BALANCE</span><strong>{hoursText(entries.reduce((sum, e) => sum + (e.type === 'Comp On' ? e.hours : -e.hours), 0))}</strong></Panel>{addButton('Comp On', 'Add comp time')}{entries.length ? events(entries) : <Empty title="No comp time yet">Log an on or off entry to see your demo balance.</Empty>}</> }
    return <><Panel><h3>TRAINING DATES</h3><p>Keep your next qualification in sight.</p><button className="sim-add" onClick={() => setModal({ kind: 'training' })}>CHOOSE TRAINING <Plus size={17} /></button></Panel><span className="sim-badge">DUE SOON · SAMPLE REMINDER</span>{events(data.entries.filter(e => e.type === 'Training'))}{addButton('Training', 'Add training date')}</>
  }
  function stats() { const msot = sumHours(ots.filter(e => e.type === 'MSOT')); return <><Panel className="sim-scan-card"><ClipboardList size={27} /><h3>MSOT EQUALIZATION</h3><p>Compare a fictional OT report with Johnny’s calendar.</p><label className="sim-range-label">Demo report hours <strong>{data.reportHours}h</strong><input aria-label="Demo report hours" type="range" min="0" max={Math.max(100, Math.ceil(msot), Math.ceil(data.reportHours))} step="0.25" value={data.reportHours} onChange={e => update({ reportHours: Number(e.target.value) })} /></label><div className="sim-report-status" role="status"><strong>{msot === data.reportHours ? 'HOURS MATCH' : msot > data.reportHours ? 'CALENDAR HIGHER' : 'CALENDAR LOWER'}</strong><p>Calendar {hoursText(msot)} · Report {hoursText(data.reportHours)} · Difference {hoursText(Math.abs(msot - data.reportHours))}</p></div><button className="sim-add" onClick={() => { update({ reportHours: msot }); setToast('Demo report matched to calendar hours.') }}>Match demo report to calendar</button><small>A fictional comparison; no payroll or payment verification.</small></Panel><Accordion title="KEY STATS" open><div className="sim-stats"><div><strong>{hoursText(sumHours(ots))}</strong><small>LOGGED OT</small></div><div><strong>{ots.length}</strong><small>ENTRIES</small></div></div></Accordion><Accordion title="OT BREAKDOWN">{['MSOT', 'RSOT', 'Awaiting Relief', 'Portal 2 Portal', 'Other OT'].map(type => <p className="sim-total-row" key={type}><span>{type}</span><strong>{hoursText(sumHours(ots.filter(e => e.type === type)))}</strong></p>)}</Accordion></> }
  function trackerScreen() {
    if (subpage === 'Joe Floorbelow') return partnerDetail()
    if (subpage) return schedulePage()
    return <><Segments values={['OT LOG', 'MUTUALS', 'SCHEDULE', 'STATS']} value={tracker} onChange={setTracker} label="Tracker sections" />{tracker === 'OT LOG' ? <><div className="sim-stats"><div><strong>{hoursText(sumHours(ots.filter(e => e.date >= '2026-09-06' && e.date <= '2026-09-19')))}</strong><small>THIS OT PERIOD</small></div><div><strong>{hoursText(sumHours(ots.filter(e => e.date >= '2026-08-23' && e.date <= '2026-09-05')))}</strong><small>LAST OT PERIOD</small></div><div><strong>{hoursText(sumHours(ots.filter(e => e.date.startsWith('2026'))))}</strong><small>2026 TOTAL</small></div></div><p className="sim-kicker">2026 · OT PAY PERIODS · {ots.length} ENTRIES</p>{Array.from(new Set(ots.map(e => {
      const day = new Date(`${e.date}T12:00:00`); const anchor = new Date('2026-09-06T12:00:00'); const dayDiff = Math.round((day.valueOf() - anchor.valueOf()) / 86400000); return shiftDate('2026-09-06', Math.floor(dayDiff / 14) * 14)
    }))).sort().map(start => { const end = shiftDate(start, 13); const entries = ots.filter(e => e.date >= start && e.date <= end); return <Accordion key={start} title={`${formatDate(start, { month: 'short', day: 'numeric' })} – ${formatDate(end, { month: 'short', day: 'numeric' })}`} meta={hoursText(sumHours(entries))}><p className="sim-muted">Pay {formatDate(shiftDate(end, 13))} · Fictional pay period</p>{events(entries)}</Accordion> })}{!ots.length && <Empty title="No overtime yet">Add a demo OT entry to start a pay period.</Empty>}<button className="sim-fab" aria-label="Add overtime entry" onClick={() => setModal({ kind: 'entry', type: 'MSOT' })}><Plus size={25} /></button></> : tracker === 'MUTUALS' ? mutuals() : tracker === 'SCHEDULE' ? schedule() : stats()}</>
  }
  function crewScreen() {
    if (subpage === 'Find Crew') return <><label className="sim-search">Find fictional crew<input type="search" placeholder="Search demo names" value={query} onChange={e => setQuery(e.target.value)} /></label><p className="sim-muted">Search only the fictional roster. No real people or accounts.</p>{crew.slice(2).filter(name => name.toLowerCase().includes(query.toLowerCase())).map(name => <Panel key={name}><div className="sim-profile"><span className="sim-avatar">{name.split(' ').map(s => s[0]).join('')}</span><div><strong>{name}</strong><p>L99 · DEMO</p></div></div><button className="sim-add" onClick={() => { update({ connected: data.connected.includes(name) ? data.connected.filter(n => n !== name) : [...data.connected, name] }); setToast('Demo crew updated locally.') }}>{data.connected.includes(name) ? 'Disconnect demo member' : 'Connect demo member'}</button></Panel>)}{!crew.slice(2).some(name => name.toLowerCase().includes(query.toLowerCase())) && <Empty title="No demo matches">Try Casey or Riley.</Empty>}</>
    return <><Segments values={['CREW', 'MX PARTNER', 'OFFERS', 'BOARD']} value={crewTab} onChange={setCrewTab} label="My Crew sections" />{crewTab === 'CREW' ? <>{row('Find Crew', () => showPage('Find Crew'), 'Explore the fictional roster')}{crew.map((name, i) => <Panel key={name}><div className="sim-profile"><span className="sim-avatar">{name.split(' ').map(s => s[0]).join('')}</span><div><strong>{name}</strong><p>L99 · GROUP {i < 2 ? 10 : 12} · DEMO</p></div></div><div className="sim-crew-meta"><span className="sim-chip" style={{ '--chip': color(i % 2 ? 'Crew Off' : 'Crew On') } as CSSProperties}>{i % 2 ? 'OFF 6x' : 'ON 9x'}</span><small>{i === 0 ? 'You · ' + data.rank : i === 1 ? data.partner ? 'Primary mutual partner' : 'Sample roster' : data.connected.includes(name) ? 'Demo connected' : 'Sample roster'}</small></div></Panel>)}</> : crewTab === 'MX PARTNER' ? <><Empty title="No shared partner calendar">Your mutual history with Joe is local. A shared calendar hasn’t been connected in this demo.</Empty><button className="sim-add" onClick={() => info('Set MX partner · demo', 'Joe Floorbelow is the sample mutual partner. Real account connections are disabled. View Johnny and Joe’s local balance in Tracker → Mutuals.')}>Set demo partner</button></> : crewTab === 'OFFERS' ? <><Empty title="No incoming offers">You’re all caught up. Try the sample request below.</Empty>{data.partner && row('Open mutual request', () => setModal({ kind: 'request' }), `Joe Floorbelow · ${data.status}`)}</> : <Empty title="The demo board is clear">No public posts. Real sharing and posting are disabled in this simulator.</Empty>}</>
  }
  function settingsScreen() {
    if (subpage === 'Edit Colors') return <><p className="sim-muted">Change tour colors in the local demo. Labels remain visible in every theme.</p>{Object.entries(data.colors).map(([name, value]) => <label className="sim-color-row" key={name}><span>{name}</span><code>{value.toUpperCase()}</code><input type="color" aria-label={`${name} color`} value={value} onChange={e => update({ colors: { ...data.colors, [name]: e.target.value } })} /></label>)}<button className="sim-add" onClick={() => { update({ colors: { ...defaultColors } }); setToast('Original app colors restored.') }}>Restore app color preset</button></>
    if (subpage === 'Operational Tools') return <>{['Door Codes', 'Navigate to FDNY Unit', 'FDNY Links', 'Phone Numbers'].map(name => <div key={name}>{row(name, () => showPage(name))}</div>)}</>
    if (subpage === 'Door Codes') return <Panel><h3>DEMO HOUSE · L99</h3><p>Example code: 0000</p><small>Fictional code. No real access information is shown or stored.</small></Panel>
    if (subpage === 'Navigate to FDNY Unit') return <Panel><h3>L99 · DEMO FIREHOUSE</h3><p>Sample destination preview</p><button className="sim-add" onClick={() => info('Demo directions', 'Destination selected: fictional L99. Live maps, location access, and navigation are disabled in this simulator.')}>Preview demo directions</button></Panel>
    if (subpage === 'FDNY Links') return <>{['FDNY Portal', 'Divisions & Units', 'Member Resources'].map(name => <div key={name}>{row(name, () => info(name, 'This is a local resource preview. External services are disabled in the simulator.'))}</div>)}</>
    if (subpage === 'Phone Numbers') return <>{['Demo house desk', 'Demo division desk', 'Demo support'].map((name, i) => <div key={name}>{row(name, () => info(name, 'Demo number only. Calling is disabled.'), `(555) 010-010${i}`)}</div>)}</>
    if (subpage === 'My Crew Profile') return <Panel><div className="sim-profile"><span className="sim-avatar">JS</span><div><strong>Johnny Staylow</strong><p>{data.rank} · L99 · Group 10</p></div></div><p>(555) 010-0143</p><small>Fixed fictional identity. No personal information is collected.</small></Panel>
    return <>
      <Accordion title="01 IDENTITY & CREW" meta="CONNECTED">{row('My Group & MX Partner', () => info('My Group & MX Partner', `Johnny Staylow · Group 10. ${data.partner ? 'Joe Floorbelow · Group 10.' : 'No mutual partner. Reset the demo to restore Joe.'}`), '10 / 10')}{row('My Crew Profile', () => showPage('My Crew Profile'), 'Johnny Staylow')}<p className="sim-kicker">RANK</p><Segments values={['Firefighter', 'Officer']} value={data.rank} onChange={rank => update({ rank })} label="Demo rank" /></Accordion>
      <Accordion title="02 OPERATIONAL TOOLS">{row('Open operational tools', () => showPage('Operational Tools'), 'Door codes, navigation, links & numbers')}</Accordion>
      <Accordion title="03 APPEARANCE" meta="CUSTOM">{row('Edit Colors', () => showPage('Edit Colors'), 'Tour colors & presets')}</Accordion>
      <Accordion title="04 DATA & MAINTENANCE" meta={data.backedUp ? 'DEMO SNAPSHOT' : 'NOT BACKED UP'}>{row('Backup now', () => { update({ backedUp: true }); setToast('Demo backup preview complete. No data left this browser.') }, 'Simulated backup only')}{['Import data', 'Calendar sync', 'Transfer data'].map(name => <div key={name}>{row(name, () => info(`${name} · demo`, 'This preview does not import, export, or sync records. Reset demo restores the fictional sample.'))}</div>)}</Accordion>
      <Accordion title="05 ABOUT & SUPPORT" meta="v4.7.24"><Panel><h3>FDNY MUTUAL TRACKER</h3><p>Version 4.7.24 · Interactive demo</p><small>Not affiliated with the FDNY or City of New York.</small></Panel>{row('View subscription preview', () => setModal({ kind: 'paywall' }))}</Accordion>
      <Accordion title="06 SEND FEEDBACK & SHARE">{row('Feedback preview', () => info('Feedback · demo', 'No message will be sent from this simulator. Use the website’s Send feedback button outside the phone if you want to contact the developer.'))}{row('Share preview', () => info('Share the demo', 'Visitors can explore this same fictional app at /app-simulator. Browser-local changes are never shared.'))}</Accordion>
      <img className="sim-watermark" src="/images/app-icon.webp" alt="" /><p className="sim-version">FDNY MUTUAL TRACKER · v4.7.24</p>
    </>
  }
  const detail = modal?.kind === 'detail' ? data.entries.find(e => e.id === modal.id) : undefined
  const modalTitle = modal?.kind === 'day' ? formatDate(modal.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : modal?.kind === 'entry' ? 'Add demo entry' : modal?.kind === 'detail' ? detail?.type || 'Entry removed' : modal?.kind === 'reset' ? 'Reset this demo?' : modal?.kind === 'deletePartner' ? 'Remove Joe Floorbelow?' : modal?.kind === 'request' ? 'Mutual request' : modal?.kind === 'sync' ? 'Sync Warning' : modal?.kind === 'training' ? 'CHOOSE TRAINING' : modal?.kind === 'paywall' ? 'FDNY Mutual Tracker' : modal?.kind === 'info' ? modal.title : ''
  return <section className={`app-simulator ${fullscreen ? 'sim-fullscreen' : ''}`}>
    {fullscreen && <div className="sim-demo-toolbar"><span>DEMO · LOCAL DATA</span><button onClick={() => setModal({ kind: 'reset' })}><RotateCcw size={16} />Reset demo</button><button autoFocus onClick={() => setFullscreen(false)}><X size={18} />Exit full screen</button></div>}
    <div className="sim-construction" role="status"><HardHat size={16} /><p><strong>Under construction</strong> — new simulator screens are in the works. Every button stays demo-only.</p></div>
    <div className="container sim-intro"><Link className="sim-back-site" to="/"><ArrowLeft size={14} /> Back to the website</Link><div className="sim-intro-heading"><div><p className="eyebrow"><span className="status-dot" /> APP SIMULATOR — DEMO DATA</p><h1>Your next tour. Try it here.</h1><p>Your calendar, crew, and mutuals. Take a look around.</p></div><div className="sim-intro-actions"><button ref={fullscreenButton} className="button-primary" onClick={() => setFullscreen(true)}>Full-screen demo</button><button className="button-outline" onClick={() => setModal({ kind: 'reset' })}><RotateCcw size={16} />Reset demo</button></div></div></div>
    <div className="container sim-workspace"><aside className="sim-side sim-side-left"><span className="sim-side-number">10–84</span><h2>All the moving parts.<br />One place.</h2><p>You’re Johnny Staylow for this tour. Your partner is Joe Floorbelow. Everything here is fictional.</p><div className="sim-tour-guide"><button onClick={() => { navigate('Calendar'); setView('WEEK') }}><CalendarDays size={18} /><span><strong>Check your tour</strong><small>Pick a day. Add a sample entry.</small></span><ArrowRight size={15} /></button><button onClick={() => { navigate('Tracker'); setTracker('MUTUALS') }}><ArrowLeftRight size={18} /><span><strong>Keep mutuals straight</strong><small>See who owes the next tour.</small></span><ArrowRight size={15} /></button><button onClick={() => { navigate('Tracker'); setTracker('STATS') }}><Clock3 size={18} /><span><strong>Account for every hour</strong><small>Try the OT report comparison.</small></span><ArrowRight size={15} /></button></div><p className="sim-side-foot"><ShieldCheck size={17} /> No sign-in. No real records.</p></aside>
    <div className={`sim-device ${tab === 'Calendar' && view === 'MONTH' ? 'sim-device-month' : ''}`}><div className="sim-device-status" aria-hidden="true"><span>9:41</span><i /><span>▮▮▮ ▰</span></div><header className="sim-app-header"><div>{subpage && <button className="sim-icon-button" aria-label="Back to section" onClick={() => showPage('')}><ArrowLeft size={18} /></button>}<h2 ref={heading} tabIndex={-1}>{subpage || tab}</h2><button className="sim-icon-button" aria-label="Demo recent activity" onClick={() => info('Recent activity', `${data.partner ? `Joe Floorbelow’s sample request is ${data.status.toLowerCase()}. ` : 'No active mutual requests. '}CFR-D training is due September 17. All activity is fictional.`)}><Bell size={19} /><span className="sim-notification-dot" /></button></div><p>L99 · GROUP 10 · DEMO</p></header>
    <div className={`sim-screen ${tab === 'Calendar' && view === 'MONTH' ? 'sim-screen-month' : ''}`} ref={content}>{tab === 'Calendar' ? calendar() : tab === 'Tracker' ? trackerScreen() : tab === 'My Crew' ? crewScreen() : settingsScreen()}</div>
    <nav className="sim-bottom-tabs" aria-label="Simulator app navigation">{tabs.map(item => <button key={item.name} aria-pressed={tab === item.name} onClick={() => navigate(item.name)}><item.icon size={21} /><i /><span>{item.name}</span></button>)}</nav><div className="sim-home-indicator" aria-hidden="true" /></div>
    <aside className="sim-side sim-side-right"><span className="sim-kicker">TODAY’S DEMO</span><div className="sim-side-tour"><span className="sim-date-large">12</span><span>SEP<br />2026</span></div><h3>Night tour, squared away.</h3><p>Explore a sample week, jump through the year, or get into the details.</p><div className="sim-side-note"><Info size={17} /><p>Every button in the phone is part of the demo. Reset anytime to start fresh.</p></div><Link className="text-link" to="/guides">Need a field guide? <ArrowRight size={15} /></Link></aside></div>
    <div className="container sim-disclaimer"><ShieldCheck size={18} /><p>This interactive demo uses fictional data. Changes are local to this browser and do not affect the FDNY Mutual Tracker app.</p></div>
    {storageError && <p className="sim-storage-warning" role="alert">Browser storage is unavailable. You can still explore; changes will last only until you reload.</p>}
    <div className={`sim-toast ${toast ? 'is-visible' : ''}`} role="status" aria-live="polite">{toast && <><Check size={17} />{toast}</>}</div>
    {modal && <Dialog key={modal.kind} sheet={modal.kind === 'day'} title={modalTitle} onClose={() => setModal(null)}>
      {modal.kind === 'day' && daySheet(modal.date)}
      {modal.kind === 'entry' && <EntryForm initialType={modal.type} date={date} save={addEntry} />}
      {modal.kind === 'detail' && detail && <><div className="sim-detail-summary">{chip(detail)}<h3>{detail.type === 'Training' ? detail.training : 'Johnny Staylow'}</h3><p>{formatDate(detail.date)}{detail.end !== detail.date && ` – ${formatDate(detail.end)}`} · {detail.tour} · {hoursText(detail.hours)}</p><p>{detail.vacation && `${detail.vacation} · `}{detail.complete ? 'Complete' : 'Scheduled'} · Fictional local entry</p></div><div className="sim-dialog-actions"><button className="sim-primary" onClick={() => { update({ entries: data.entries.map(e => e.id === detail.id ? { ...e, complete: !e.complete } : e) }); finish(detail.complete ? 'Demo entry marked scheduled.' : 'Demo entry marked complete.') }}>{detail.complete ? 'Mark scheduled' : 'Mark complete'}</button><button className="sim-danger" onClick={() => removeEntry(detail.id)}>Remove demo entry</button></div></>}
      {modal.kind === 'reset' && <><p>Restore Johnny’s original schedule, Joe’s mutual history, crew, colors, and settings? This only resets the simulator.</p><div className="sim-dialog-actions"><button className="sim-secondary" onClick={() => setModal(null)}>Keep exploring</button><button className="sim-primary" onClick={() => { setData(seedDemo()); setTab('Calendar'); setTracker('OT LOG'); setCrewTab('CREW'); setSubpage(''); setView('WEEK'); setLargeMonthText(false); setDate(TODAY); setQuery(''); finish('Demo restored. Ready for another tour.'); content.current?.scrollTo(0, 0) }}>Restore demo data</button></div></>}
      {modal.kind === 'deletePartner' && <><p>Remove this mutual partner and history? Joe’s demo swaps and request will also be removed. Reset demo brings them back.</p><div className="sim-dialog-actions"><button className="sim-secondary" onClick={() => setModal(null)}>Cancel</button><button className="sim-danger" onClick={() => { update({ partner: false, entries: data.entries.filter(e => !['MX On', 'MX Off'].includes(e.type)) }); setSubpage(''); finish('Demo mutual partner and history removed.') }}>Delete partner</button></div></>}
      {modal.kind === 'request' && <form className="sim-form" onSubmit={e => { e.preventDefault(); update({ status: new FormData(e.currentTarget).get('status') as DemoState['status'] }); finish('Demo mutual status saved. No message was sent.') }}><Panel><h3>Joe Floorbelow → Johnny Staylow</h3><p>Saturday, September 19, 2026 · 6x</p><small>Work my night tour? · Fictional request</small></Panel><label>Mutual status<select aria-label="Mutual status" name="status" defaultValue={data.status}>{['Open', 'Accepted', 'Completed', 'Declined'].map(s => <option key={s}>{s}</option>)}</select></label><p>This previews the request status. Historical balances are unchanged.</p><button className="sim-primary">Save demo status</button></form>}
      {modal.kind === 'sync' && <><p>Demo sync is paused. This sample warning demonstrates the offline state; no server connection is attempted.</p><div className="sim-dialog-actions"><button className="sim-secondary" onClick={() => { update({ syncDismissed: true }); setModal(null) }}>Dismiss warning</button><button className="sim-primary" onClick={() => { update({ syncDismissed: true }); finish('Demo retry complete. Entries remain local.') }}>Retry demo sync</button></div></>}
      {modal.kind === 'training' && <div>{['CFR-D', 'HazMat Ops', 'ERP', 'Green Energy'].map(training => <div key={training}>{row(training, () => addEntry({ id: crypto.randomUUID(), type: 'Training', training, date, end: date, tour: '9x', hours: 3, complete: false }), `Add a sample 3h session on ${formatDate(date)}`)}</div>)}</div>}
      {modal.kind === 'paywall' && <div className="sim-paywall"><img src="/images/app-icon.webp" alt="FDNY Mutual Tracker app icon" /><p>Simplified tour scheduling</p>{['Mutual calendar', 'MSOT + RSOT + Vacation', 'Mutual history'].map(feature => <p key={feature}><Check size={18} />{feature}</p>)}<h3>$9.99 <small>/ year</small></h3><span className="sim-kicker">7-DAY FREE TRIAL · APP PREVIEW</span><button className="sim-primary" disabled>Demo — subscriptions disabled</button><button className="sim-secondary" disabled>Demo — restore purchases disabled</button><small>Preview only. No purchase or account can be created here.</small></div>}
      {modal.kind === 'info' && <><p>{modal.text}</p><button className="sim-primary" onClick={() => setModal(null)}>Got it</button></>}
    </Dialog>}
  </section>
}
