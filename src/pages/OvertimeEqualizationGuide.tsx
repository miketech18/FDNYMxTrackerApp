import { useEffect, useRef, useState, type JSX } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Camera, Check, ChevronDown, Clock3, FileSearch, Info, MessageSquare, ShieldAlert, X, ZoomIn } from 'lucide-react'

const checklistStorageKey = 'fdny-howto3-checks'
const reportHours = 24

const checklistItems = [
  'Tapped “Scan New OT Report” for the current report date and reporting period.',
  'The scanned report hours match the printed sheet.',
  'The calendar uses the same reporting period.',
  'Missing or incorrect calendar entries are fixed.',
  'Possible unpaid MSOT is checked against pay records.',
  'The report and supporting pay records are saved.',
]

const faqs = [
  {
    question: 'What if the scanner reads the wrong total?',
    answer: 'Rescan the entire page in even light or enter the printed total manually. Confirm the report date before using the projection.',
  },
  {
    question: 'Why are my calendar hours higher?',
    answer: 'The calendar may include MSOT that has not reached the report yet. Compare the same date range, then check those entries against your official pay records for possible unpaid MSOT.',
  },
  {
    question: 'Why are my calendar hours lower?',
    answer: 'A calendar mark may be missing or outside the selected date range. Use the report period to find and correct the entry.',
  },
  {
    question: 'Does an hours match mean I was paid?',
    answer: 'No. Matching totals only show that the calendar and report agree. Confirm payment separately on your official pay stub.',
  },
  {
    question: 'Where is my checklist saved?',
    answer: 'Checklist progress is stored only in this browser on this device. Clearing browser data may reset it.',
  },
]

type Step = {
  id: 'newReport' | 'scanOptions' | 'projectedMsot' | 'calendarStats'
  number: string
  title: string
  railTitle: string
  summary: string
  details: string[]
  image: string
  alt: string
  caption: string
  format?: 'wide'
}

const steps: Step[] = [
  {
    id: 'newReport',
    number: '01',
    title: 'START A NEW REPORT SCAN',
    railTitle: 'New report',
    summary: 'Open Tracker, choose Stats, then start with the current Overtime Equalization Report.',
    details: [
      'Tap Scan New OT Report when the Stats screen says a new report is needed.',
      'Use the most recent printed report so the dates and totals line up with the period shown in the app.',
    ],
    image: '/images/equalization-step-2.png',
    alt: 'New report needed: Stats screen with the Scan New OT Report button highlighted',
    caption: 'Tracker → Stats → Scan New OT Report',
  },
  {
    id: 'scanOptions',
    number: '02',
    title: 'CAPTURE THE SHEET FLAT, LIT & FULL-PAGE',
    railTitle: 'Capture sheet',
    summary: 'Give the scanner a clean view of the whole printed report before it reads the totals.',
    details: [
      'Lay the sheet flat, keep all four corners visible, and avoid shadows, glare, folds, or fingers over the numbers.',
      'Tap Take Photo for a clear overhead shot. If the first read fails, scan the page with Notes or Google Drive and use Choose from Library.',
    ],
    image: '/images/equalization-step-3.png',
    alt: 'Scan Sheet screen with Take Photo highlighted and Choose from Library available',
    caption: 'A flat document scan reads more reliably than an angled hand-held photo.',
  },
  {
    id: 'projectedMsot',
    number: '03',
    title: 'READ YOUR PROJECTED MSOT NUMBER',
    railTitle: 'Read projection',
    summary: 'The projected MSOT total combines the latest paper report with activity that has not reached the report yet.',
    details: [
      'Confirm the report date and the large projected MSOT number at the top of Equalization.',
      'Review how the app gets there: hours on paper now, banked hours not shown yet, scheduled hours ahead, and hours rolling off.',
      'If the scan read a number incorrectly, rescan the page or enter it manually before relying on the projection.',
    ],
    image: '/images/equalization-step-4.png',
    alt: 'Three examples of calendar and overtime report comparison states',
    caption: 'The comparison banner tells you what to check next.',
    format: 'wide',
  },
  {
    id: 'calendarStats',
    number: '04',
    title: 'CLEAR THE CALENDAR ALERTS — 3 STATES',
    railTitle: 'Clear alerts',
    summary: 'Compare Calendar hours with the scanned OT report for the same report period, then follow the banner that appears.',
    details: [
      'Red — Possible unpaid MSOT: your calendar has more hours than the report. Review the MSOT entries and confirm those hours were paid.',
      'Green — MSOT hours match: the calendar and report totals agree for the period. Matching hours does not confirm payment.',
      'Gold — Check your calendar: the report has more hours than the calendar. Add or correct the missing MSOT entry for that period.',
    ],
    image: '/images/equalization-step-1.png',
    alt: 'Calendar alert showing report hours higher than calendar hours',
    caption: 'Use the date range on the alert when checking calendar entries.',
  },
]

type PhoneShotProps = {
  src: string
  alt: string
  caption: string
  onExpand: () => void
}

export function PhoneShot({ src, alt, caption, onExpand }: PhoneShotProps): JSX.Element {
  return <figure className="msot-guide__shot">
    <button type="button" className="msot-guide__phone-shot" onClick={onExpand} aria-label={`Enlarge: ${alt}`}>
      <span className="msot-guide__phone-frame"><img src={src} alt={alt} loading="lazy" /></span>
      <span className="msot-guide__enlarge"><ZoomIn size={15} /> Enlarge screenshot</span>
    </button>
    <figcaption>{caption}</figcaption>
  </figure>
}

function ImageDialog({ image, onClose }: { image: { src: string; alt: string }; onClose: () => void }): JSX.Element {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        event.preventDefault()
        closeRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [onClose])

  return <div className="msot-guide__dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="msot-dialog-title" onClick={onClose}>
    <div className="msot-guide__dialog" onClick={event => event.stopPropagation()}>
      <p id="msot-dialog-title">Enlarged guide screenshot</p>
      <button ref={closeRef} type="button" onClick={onClose} aria-label="Close enlarged screenshot"><X size={23} /></button>
      <img src={image.src} alt={image.alt} />
    </div>
  </div>
}

export function OvertimeEqualizationGuide({ onFeedback }: { onFeedback: () => void }): JSX.Element {
  const [dialog, setDialog] = useState<{ src: string; alt: string } | null>(null)
  const [calendarHours, setCalendarHours] = useState(reportHours)
  const [activeStep, setActiveStep] = useState<Step['id']>(steps[0].id)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [checklist, setChecklist] = useState<boolean[]>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(checklistStorageKey) ?? 'null')
      if (Array.isArray(saved) && saved.length === 6 && saved.every(item => typeof item === 'boolean')) return saved
    } catch { /* The checklist still works when storage is blocked or malformed. */ }
    return [false, false, false, false, false, false]
  })

  useEffect(() => {
    try {
      localStorage.setItem(checklistStorageKey, JSON.stringify(checklist))
    } catch { /* Keep checklist interactions available when storage is blocked. */ }
  }, [checklist])

  useEffect(() => {
    const sections = steps.map(step => document.getElementById(step.id)).filter((section): section is HTMLElement => section !== null)
    const observer = new IntersectionObserver(entries => {
      const visibleSection = entries
        .filter(entry => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0]

      if (visibleSection) setActiveStep(visibleSection.target.id as Step['id'])
    }, { rootMargin: '-20% 0px -60% 0px', threshold: [0, .1, .5] })

    sections.forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const difference = calendarHours - reportHours
  const comparison = difference > 0
    ? {
        tone: 'red',
        label: 'CALENDAR HIGHER',
        title: 'Possible unpaid MSOT to review.',
        detail: `Your calendar has ${difference} more ${difference === 1 ? 'hour' : 'hours'} than the report. Check those MSOT entries against your official pay records.`,
      }
    : difference === 0
      ? {
          tone: 'green',
          label: 'HOURS MATCH',
          title: 'The two totals agree.',
          detail: 'Matching hours does not confirm payment. Verify the overtime on your official pay stub.',
        }
      : {
          tone: 'gold',
          label: 'CALENDAR LOWER',
          title: 'A calendar mark may be missing.',
          detail: `Your calendar has ${Math.abs(difference)} fewer ${Math.abs(difference) === 1 ? 'hour' : 'hours'} than the report. Check the report period and add or correct the missing entry.`,
        }
  const completedCount = checklist.filter(Boolean).length
  const checklistProgress = completedCount === 0 ? '0 of 6 done' : `${completedCount} of 6 done`
  const calendarHoursText = `${calendarHours} calendar hours; ${comparison.label.toLowerCase()}`

  function toggleChecklistItem(index: number) {
    setChecklist(current => current.map((done, itemIndex) => itemIndex === index ? !done : done))
  }

  return <article className="msot-guide" data-checklist-key={checklistStorageKey}>
    <header className="msot-guide__hero">
      <div className="container msot-guide__hero-inner">
        <Link to="/guides" className="msot-guide__back"><ArrowLeft size={15} /> All how-to guides</Link>
        <div className="msot-guide__hero-grid">
          <div>
            <p className="msot-guide__kicker"><span>HOW-TO 03</span><span>OVERTIME EQUALIZATION</span></p>
            <h1>SCAN YOUR OT SHEET.<br /><span>VERIFY YOUR MSOT.</span></h1>
            <p className="msot-guide__lede">Turn the latest printed Overtime Equalization Report into a useful projection, then reconcile the report against your calendar.</p>
            <div className="msot-guide__actions">
              <a href="#newReport">Start the four steps <ArrowRight size={16} /></a>
              <a href="#scan-advice">Get a clean scan <Camera size={16} /></a>
            </div>
          </div>
          <div className="msot-guide__brief" aria-label="Guide overview">
            <FileSearch size={27} />
            <strong>ONE REPORT. FOUR CHECKS.</strong>
            <p>Scan the sheet, confirm the projection, then resolve the banner that compares the report with your calendar.</p>
            <span><Clock3 size={14} /> About 5 minutes</span>
          </div>
        </div>
      </div>
    </header>

    <nav className="msot-guide__mobile-rail" aria-label="Guide steps">
      {steps.map(step => <a key={step.id} href={`#${step.id}`} className={activeStep === step.id ? 'is-active' : ''} aria-current={activeStep === step.id ? 'step' : undefined}><span>{step.number}</span>{step.railTitle}</a>)}
    </nav>

    <div className="container msot-guide__layout">
      <aside className="msot-guide__rail">
        <p>IN THIS GUIDE</p>
        <nav aria-label="Guide steps">
          {steps.map(step => <a key={step.id} href={`#${step.id}`} className={activeStep === step.id ? 'is-active' : ''} aria-current={activeStep === step.id ? 'step' : undefined}><span>{step.number}</span><strong>{step.railTitle}</strong></a>)}
        </nav>
        <div className="msot-guide__rail-note"><ShieldAlert size={19} /><p>Use the app as a cross-check. Keep the official report and pay records as your source documents.</p></div>
      </aside>

      <div className="msot-guide__content">
        {steps.map(step => <section id={step.id} className={`msot-guide__step msot-guide-step${step.format === 'wide' ? ' msot-guide__step--wide' : ''}`} key={step.id}>
          <div className="msot-guide__step-copy">
            <div className="msot-guide__step-heading"><span>{step.number}</span><p>STEP {Number(step.number)} OF {steps.length}</p></div>
            <h2>{step.title}</h2>
            <p>{step.summary}</p>
            <ul>{step.details.map(detail => <li key={detail}><Check size={16} />{detail}</li>)}</ul>
          </div>
          <PhoneShot src={step.image} alt={step.alt} caption={step.caption} onExpand={() => setDialog({ src: step.image, alt: step.alt })} />
        </section>)}

        <section id="scan-advice" className="msot-guide__scan-advice">
          <Camera size={24} />
          <div><p>SCAN ADVICE</p><h2>Make the first read count.</h2><ul><li>Use a plain surface with even light.</li><li>Hold the camera parallel to the page.</li><li>Include every edge and every total.</li><li>Check the report date after the scan.</li></ul></div>
        </section>

        <section className="msot-guide__alert-overview" aria-labelledby="alert-overview-title">
          <div><p>THE ALERT SYSTEM</p><h2 id="alert-overview-title">RED MEANS REVIEW. GOLD MEANS RECONCILE. GREEN MEANS TOTALS MATCH.</h2></div>
          <div className="msot-guide__alerts">
            <span className="msot-guide__alert msot-guide__alert--red"><i />Calendar higher<strong>Check possible unpaid MSOT.</strong></span>
            <span className="msot-guide__alert msot-guide__alert--green"><i />Hours match<strong>Still confirm payment records.</strong></span>
            <span className="msot-guide__alert msot-guide__alert--gold"><i />Calendar lower<strong>Add or correct calendar entries.</strong></span>
          </div>
        </section>

        <section className="msot-guide__simulator" aria-labelledby="msot-simulator-title">
          <div className="msot-guide__section-heading">
            <div><p>TRY THE COMPARISON</p><h2 id="msot-simulator-title">SEE WHAT EACH ALERT MEANS.</h2></div>
            <span>REPORT HOURS <strong>{reportHours}</strong></span>
          </div>
          <div className="msot-guide__simulator-controls">
            <div className="msot-guide__range-heading">
              <label htmlFor="msot-calendar-hours">Calendar hours</label>
              <output htmlFor="msot-calendar-hours">{calendarHours} hours</output>
            </div>
            <input
              id="msot-calendar-hours"
              type="range"
              min="0"
              max="36"
              step="1"
              value={calendarHours}
              onChange={event => setCalendarHours(Number(event.target.value))}
              aria-describedby="msot-simulator-status"
              aria-valuetext={calendarHoursText}
            />
            <div className="msot-guide__range-scale" aria-hidden="true"><span>0</span><span>24 report</span><span>36</span></div>
          </div>
          <div id="msot-simulator-status" className={`msot-simulator-status msot-simulator-status--${comparison.tone}`} aria-live="polite">
            <span>{comparison.label}</span>
            <div><strong>{comparison.title}</strong><p>{comparison.detail}</p></div>
          </div>
        </section>

        <section className="msot-guide__checklist" aria-labelledby="msot-checklist-title">
          <div className="msot-guide__section-heading">
            <div><p>BEFORE YOU FINISH</p><h2 id="msot-checklist-title">RUN THE SIX-POINT CHECK.</h2></div>
            <p className="msot-checklist-progress" aria-live="polite">{checklistProgress}</p>
          </div>
          <div className="msot-guide__checklist-grid">
            {checklistItems.map((item, index) => <button
              key={item}
              type="button"
              className={checklist[index] ? 'is-done' : ''}
              aria-pressed={checklist[index]}
              onClick={() => toggleChecklistItem(index)}
            >
              <span aria-hidden="true">{checklist[index] && <Check size={15} />}</span>
              {item}
            </button>)}
          </div>
          <small>Your progress is saved on this device.</small>
        </section>

        <section className="msot-guide__faq" aria-labelledby="msot-faq-title">
          <div className="msot-guide__section-heading"><div><p>GOOD TO KNOW</p><h2 id="msot-faq-title">FIVE COMMON QUESTIONS.</h2></div></div>
          <div className="msot-guide__faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return <div className={isOpen ? 'is-open' : ''} key={faq.question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`msot-faq-answer-${index}`}
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                >
                  {faq.question}<ChevronDown size={18} />
                </button>
                {isOpen && <p id={`msot-faq-answer-${index}`}>{faq.answer}</p>}
              </div>
            })}
          </div>
        </section>

        <section className="msot-guide__caveat">
          <Info size={24} />
          <div><h2>THE APP IS A CHECK — NOT A PAY STUB.</h2><p>Matching hours does not confirm payment. Always verify paid overtime against your official pay stub and the department’s records. If totals or dates still look wrong after you correct the calendar, keep the report and raise the discrepancy through the appropriate payroll channel.</p></div>
        </section>

        <footer className="msot-guide__footer-action">
          <MessageSquare size={22} />
          <div><strong>Something in this guide unclear?</strong><p>Tell me where you got stuck and what you expected to see.</p></div>
          <button type="button" onClick={onFeedback}>Send feedback <ArrowRight size={15} /></button>
        </footer>
      </div>
    </div>
    {dialog && <ImageDialog image={dialog} onClose={() => setDialog(null)} />}
  </article>
}
