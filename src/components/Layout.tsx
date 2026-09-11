import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, ChevronDown, MessageSquare, ShieldCheck } from 'lucide-react'
import { guides } from '../lib/guides'

export function Header({ onFeedback }: { onFeedback: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const keyboard = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); trigger.current?.focus() } }
    document.addEventListener('mousedown', close)
    if (open) document.addEventListener('keydown', keyboard)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', keyboard) }
  }, [open])
  return <header className="site-header"><div className="container header-inner">
    <Link to="/" className="brand" aria-label="FDNY Mutual Tracker home"><img src="/images/app-icon.webp" alt="FDNY Mutual Tracker emblem" /><span className="brand-wordmark">FDNY <span>MUTUAL TRACKER</span><small>BUILT FOR THE FIREHOUSE.</small></span></Link>
    <nav className="header-actions" aria-label="Main navigation">
      <span className="release-badge">v4.7.24</span>
      <div className="guide-nav" ref={ref}>
        <button ref={trigger} className={`guide-nav-button ${open ? 'is-open' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="guide-dropdown"><BookOpen size={17} /><span>How-to guides</span><ChevronDown size={15} className={open ? 'rotated' : ''} /></button>
        {open && <div className="guide-dropdown" id="guide-dropdown"><div className="dropdown-heading">A LITTLE HELP. A LOT MORE FROM YOUR APP.</div>{guides.map(guide => <Link key={guide.slug} to={`/guides/${guide.slug}`} onClick={() => setOpen(false)} className="dropdown-guide"><guide.icon size={21} /><span><strong>{guide.shortTitle}</strong><small>{guide.category} <span>·</span> {guide.time}</small></span><ArrowRight size={16} /></Link>)}<Link to="/guides" onClick={() => setOpen(false)} className="dropdown-all">Explore all how-to guides <ArrowRight size={16} /></Link><p>One home for every guide. More on the way.</p></div>}
      </div>
      <button className="button-red nav-feedback" onClick={onFeedback}><MessageSquare size={17} /><span>Send feedback</span><ArrowRight size={16} /></button>
    </nav>
  </div></header>
}

export function AppleIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.05 12.54c-.03-2.89 2.36-4.28 2.47-4.35-1.35-1.97-3.44-2.24-4.18-2.27-1.78-.18-3.47 1.05-4.37 1.05-.9 0-2.29-1.02-3.77-1-1.94.03-3.72 1.13-4.72 2.86-2.01 3.49-.51 8.66 1.45 11.5.96 1.39 2.1 2.95 3.6 2.89 1.44-.06 1.99-.93 3.73-.93 1.74 0 2.23.93 3.76.9 1.55-.03 2.53-1.41 3.48-2.81 1.09-1.61 1.54-3.17 1.57-3.25-.03-.02-3.01-1.16-3.02-4.59zM14.16 4.06c.79-.96 1.33-2.3 1.18-3.63-1.14.05-2.53.76-3.35 1.72-.73.85-1.38 2.21-1.21 3.51 1.28.1 2.58-.65 3.38-1.6z" /></svg>
}
export function PlayIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#45a2fa" d="M3.6 1.8 13.9 12 3.6 22.2c-.37-.2-.6-.6-.6-1.1V2.9c0-.5.23-.9.6-1.1z" /><path fill="#35c576" d="M17.3 8.6 5.2 1.6c-.2-.12-.42-.18-.63-.19L13.9 12l3.4-3.4z" /><path fill="#ffce32" d="m17.3 15.4 3.2-1.85c1.2-.7 1.2-2.4 0-3.1L17.3 8.6 13.9 12z" /><path fill="#f35455" d="M4.57 22.6c.21-.01.43-.07.63-.19l12.1-7L13.9 12z" /></svg>
}
export function StoreButtons() {
  return <div className="store-buttons"><a className="store-button" href="https://apps.apple.com/us/app/fdny-mutual-tracker/id6778679353" target="_blank" rel="noreferrer"><AppleIcon /><span><small>Download on the</small><strong>App Store</strong></span></a><a className="store-button" href="https://play.google.com/store/apps/details?id=com.mauch.fdnyscheduler" target="_blank" rel="noreferrer"><PlayIcon /><span><small>GET IT ON</small><strong>Google Play</strong></span></a></div>
}
export function DownloadBar() {
  return <aside className="download-bar" aria-label="Download the app"><div className="container download-inner"><div className="download-brand"><img src="/images/app-icon.webp" alt="" /><span><strong>Your next tour. All squared away.</strong><small>FDNY Mutual Tracker · iOS & Android</small></span></div><StoreButtons /></div></aside>
}
export function Footer({ onFeedback }: { onFeedback: () => void }) {
  return <footer className="site-footer"><div className="container"><div className="footer-top"><Link to="/" className="footer-name">FDNY <span>MUTUAL TRACKER</span></Link><div><Link to="/guides">How-to guides</Link><button onClick={onFeedback}>Send feedback</button><a href="https://miketech18.github.io/fdny-mutual-tracker-privacy/legal.html#privacy" target="_blank" rel="noreferrer">Privacy</a><a href="https://miketech18.github.io/fdny-mutual-tracker-privacy/legal.html#terms" target="_blank" rel="noreferrer">Terms</a></div></div><div className="footer-bottom"><p>© 2026 FDNY Mutual Tracker. Built by an active FDNY firefighter.<br />Not affiliated with the FDNY or the City of New York.</p><span><ShieldCheck size={16} /> Your calendar. Your data.</span></div></div></footer>
}
