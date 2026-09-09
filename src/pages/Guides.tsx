import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, Clock3, Info, MessageSquare, Search, X, ZoomIn } from 'lucide-react'
import { guides } from '../lib/guides'
import { OvertimeEqualizationGuide } from './OvertimeEqualizationGuide'

export function Guides({ onFeedback }: { onFeedback: () => void }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All guides')
  const results = guides.filter(guide => (category === 'All guides' || guide.category === category) && `${guide.title} ${guide.description} ${guide.category}`.toLowerCase().includes(search.toLowerCase().trim()))
  return <>
    <section className="page-hero"><div className="container"><Link to="/" className="back-link"><ArrowLeft size={15} /> Back to the app</Link><p className="eyebrow">YOUR POCKET FIELD GUIDE</p><h1>KNOW YOUR APP.<br /><span className="brass-text">MAKE IT WORK FOR YOU.</span></h1><p>Simple, step-by-step help for the tools you use on the job.<br />All your how-to guides. One place to find them.</p></div></section>
    <section className="guide-library"><div className="container"><div className="library-tools"><div className="category-tabs" aria-label="Filter guides">{['All guides', 'Calendar', 'Mutuals'].map(item => <button key={item} onClick={() => setCategory(item)} className={item === category ? 'active' : ''} aria-pressed={item === category}>{item}{item === 'All guides' && <span>{guides.length}</span>}</button>)}</div><div className="guide-search"><Search size={18} /><input aria-label="Search how-to guides" placeholder="Find a how-to guide…" value={search} onChange={e => setSearch(e.target.value)} />{search && <button aria-label="Clear search" onClick={() => setSearch('')}><X size={16} /></button>}</div></div><p className="results-count" aria-live="polite">{results.length} {results.length === 1 ? 'guide' : 'guides'} to get you going</p><div className="library-grid">{results.map(guide => <Link key={guide.slug} to={`/guides/${guide.slug}`} className="guide-card library-card"><div className="guide-card-top"><span className="card-icon"><guide.icon size={25} /></span><span className="guide-label">{guide.category.toUpperCase()}</span><ArrowUpRight size={21} /></div><h2>{guide.title}</h2><p>{guide.description}</p><div className="guide-card-bottom"><span>Read the guide <ArrowRight size={17} /></span><small>{guide.time}</small></div></Link>)}</div>{results.length === 0 && <div className="empty-search"><Search size={32} /><h2>NO GUIDE FOUND.</h2><p>Try “calendar” or “mutuals”, or browse all guides.</p><button className="button-outline" onClick={() => { setSearch(''); setCategory('All guides') }}>Show all guides <ArrowRight size={16} /></button></div>}<div className="guide-library-footer"><span className="small-icon"><BookOpen size={24} /></span><div><h3>More know-how is on the way.</h3><p>Have a feature you’d like a guide for? Tell me what would help.</p></div><button onClick={onFeedback} className="button-outline">Suggest a guide <ArrowRight size={16} /></button></div></div></section>
  </>
}

function ImageViewer({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'Tab') { e.preventDefault(); closeRef.current?.focus() } }
    document.addEventListener('keydown', key)
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', key); previous?.focus() }
  }, [onClose])
  return <div className="modal-overlay image-viewer" role="dialog" aria-modal="true" aria-label={alt} onClick={onClose}><button className="viewer-close" ref={closeRef} onClick={onClose} aria-label="Close screenshot"><X size={24} /></button><img src={src} alt={alt} onClick={e => e.stopPropagation()} /><p>{alt}</p></div>
}

export function GuidePage({ onFeedback }: { onFeedback: () => void }) {
  const { slug } = useParams()
  const guide = guides.find(item => item.slug === slug)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null)
  const [completed, setCompleted] = useState<number[]>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(`fdny-guide-${slug}`) || '[]')
      return Array.isArray(saved) ? [...new Set(saved.filter((item): item is number => typeof item === 'number' && Number.isInteger(item) && item >= 0 && item < (guide?.steps.length || 0)))] : []
    } catch { return [] }
  })
  if (guide && guide.slug === 'overtime-equalization') return <OvertimeEqualizationGuide onFeedback={onFeedback} />
  if (!guide) return <NotFound />
  function toggleCompleted(index: number) {
    const updated = completed.includes(index) ? completed.filter(item => item !== index) : [...completed, index]
    setCompleted(updated)
    try { localStorage.setItem(`fdny-guide-${slug}`, JSON.stringify(updated)) } catch { /* Reading the guide remains available without local storage. */ }
  }
  const nextGuide = guides.find(item => item.slug !== slug)!
  return <>
    <section className="page-hero article-hero"><div className="container"><Link to="/guides" className="back-link"><ArrowLeft size={15} /> All how-to guides</Link><p className="eyebrow">HOW-TO GUIDE <span className="eyebrow-divider" /> {guide.category.toUpperCase()}</p><h1>{guide.title}</h1><p>{guide.intro}</p><div className="article-meta"><span><Clock3 size={15} /> {guide.time}</span><span><BookOpen size={15} /> {guide.steps.length} simple steps</span></div></div></section>
    <div className="container article-layout"><aside className="article-sidebar"><p className="eyebrow">IN THIS GUIDE</p><nav aria-label="Guide steps">{guide.steps.map((step, index) => <a key={step.title} href={`#step-${index + 1}`}><span className={completed.includes(index) ? 'complete' : ''}>{completed.includes(index) ? <Check size={12} /> : `0${index + 1}`}</span>{step.title}</a>)}</nav><div className="guide-progress"><span>{completed.length} of {guide.steps.length} steps completed</span><div><i style={{ width: `${completed.length / guide.steps.length * 100}%` }} /></div><small>Your progress is saved on this device.</small></div><div className="sidebar-help"><MessageSquare size={22} /><h3>Need a hand?</h3><p>Ask a question or let me know what could be clearer.</p><button onClick={onFeedback}>Send feedback <ArrowRight size={15} /></button></div></aside><article className="article-content">{guide.steps.map((step, index) => <section className="guide-step" id={`step-${index + 1}`} key={step.title}><div className="step-heading"><span className="step-number">0{index + 1}</span><span className="eyebrow">STEP {index + 1} OF {guide.steps.length}</span></div><h2>{step.title}</h2><p>{step.text}</p>{step.bullets && <ul>{step.bullets.map(bullet => <li key={bullet}><Check size={15} />{bullet}</li>)}</ul>}{step.image && <button className={`step-image ${step.image.includes('google-calendar') ? 'wide-image' : ''}`} onClick={() => setZoom({ src: step.image!, alt: step.imageAlt! })} aria-label={`Enlarge: ${step.imageAlt}`}><img src={step.image} alt={step.imageAlt} loading="lazy" /><span><ZoomIn size={15} /> Tap to enlarge</span></button>}{step.note && <div className="guide-note"><Info size={18} /><p>{step.note}</p></div>}<button className={`mark-complete ${completed.includes(index) ? 'completed' : ''}`} aria-label={`${completed.includes(index) ? 'Mark incomplete' : 'Mark complete'}: ${step.title}`} aria-pressed={completed.includes(index)} onClick={() => toggleCompleted(index)}><span>{completed.includes(index) && <Check size={12} />}</span>{completed.includes(index) ? 'Step completed' : 'Mark step as complete'}</button></section>)}
      <section className="faq-section"><p className="eyebrow">GOOD TO KNOW</p><h2>A FEW COMMON QUESTIONS.</h2>{guide.faqs.map((faq, index) => <div className={`faq-item ${openFaq === index ? 'open' : ''}`} key={faq.question}><button onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index} aria-controls={`faq-${index}`}>{faq.question}<ChevronDown size={18} /></button>{openFaq === index && <p id={`faq-${index}`}>{faq.answer}</p>}</div>)}</section>
      <div className="article-next"><span className="eyebrow">KEEP EXPLORING</span><Link to={`/guides/${nextGuide.slug}`}><nextGuide.icon size={25} /><span>{nextGuide.title}<small>{nextGuide.time}</small></span><ArrowRight size={21} /></Link></div>
    </article></div>{zoom && <ImageViewer src={zoom.src} alt={zoom.alt} onClose={() => setZoom(null)} />}
  </>
}
export function NotFound() { return <section className="not-found container"><p className="eyebrow">THIS ONE’S OFF THE BOARD</p><h1>LET’S GET YOU<br /><span className="brass-text">BACK ON TRACK.</span></h1><p>That page couldn’t be found. Your app and guides are right here.</p><Link to="/" className="button-red">Back to home <ArrowRight size={17} /></Link></section> }
