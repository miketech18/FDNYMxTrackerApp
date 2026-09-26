import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowLeftRight, ArrowRight, ArrowUpRight, BookOpen, CalendarCheck, CalendarDays, DoorOpen, MapPin, MessageSquare, ShieldCheck, Smartphone, WifiOff } from 'lucide-react'
import { PhoneCarousel } from '../components/PhoneCarousel'
import { StoreButtons } from '../components/Layout'
import { guides } from '../lib/guides'

const ROTATOR_INTERVAL_MS = 3500

function useRotator(length: number, interval = ROTATOR_INTERVAL_MS) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef<number | null>(null)
  useEffect(() => {
    if (paused) return
    timer.current = window.setInterval(() => setIndex(v => (v + 1) % length), interval)
    return () => { if (timer.current) window.clearInterval(timer.current) }
  }, [length, interval, paused])
  return { index, setIndex, paused, setPaused }
}

export function Home({ onFeedback }: { onFeedback: () => void }) {
  return <>
    <section className="hero-section"><div className="container hero-grid">
      <div className="hero-copy"><p className="eyebrow hero-eyebrow"><span className="status-dot" /> <span className="hero-tencode">10-84</span> <span className="eyebrow-divider" /> READY FOR YOUR NEXT TOUR</p><h1>BUILT BY AN FDNY<br />FIREFIGHTER.<br /><span className="brass-text">MADE FOR OUR JOB.</span><br /><span className="red-text">EVERYTHING WE NEED.</span></h1><div className="home-simulator-cta"><Link className="button-outline button-outline--brass" to="/app-simulator">Try the app simulator <ArrowRight size={16} /></Link></div><a className="explore-link" href="#field-guide">Get more from your tracker <ArrowDown size={16} /></a></div>
      <PhoneCarousel />
    </div><div className="container hero-trust hero-features"><span><WifiOff size={14} /> Works with no signal in the firehouse</span><span className="trust-separator" aria-hidden="true" /><span><Smartphone size={14} /> Home-screen widget with your next tour</span><span className="trust-separator" aria-hidden="true" /><span><DoorOpen size={14} /> Door codes, phone numbers &amp; FDNY links</span><span className="trust-separator" aria-hidden="true" /><span><CalendarCheck size={14} /> Share your Calendar with family — it updates automatically</span><span className="trust-separator" aria-hidden="true" /><span><ArrowLeftRight size={14} /> Swap Mutuals in the app</span></div></section>
    <section className="quick-help-section" id="field-guide"><div className="container"><div className="section-heading"><div><p className="eyebrow">YOUR POCKET FIELD GUIDE</p><h2>Drill in the kitchen.</h2></div><Link className="text-link" to="/guides">All how-to guides <ArrowUpRight size={17} /></Link></div>
      <div className="quick-help-grid"><button className="feedback-card" onClick={onFeedback}><span className="feedback-card-top"><span className="card-icon"><MessageSquare size={23} /></span><span className="feedback-card-label">YOUR VOICE MATTERS</span><ArrowUpRight size={20} /></span><span className="feedback-card-title">HELP BUILD A BETTER APP.</span><span className="feedback-card-description">Found a bug? Have an idea?<br />Let’s make the next tour even better.</span><span className="feedback-card-cta">Send feedback <ArrowRight size={17} /></span></button>
      {guides.map(guide => <Link key={guide.slug} to={`/guides/${guide.slug}`} className="guide-card" data-umami-event="guide-click" data-umami-event-guide={guide.slug} data-umami-event-location="home"><div className="guide-card-top"><span className="card-icon"><guide.icon size={23} /></span><span className="guide-label">HOW-TO GUIDE</span><ArrowUpRight size={18} /></div><h3>{guide.shortTitle}</h3><p>{guide.description}</p><div className="guide-card-bottom"><span>Read the guide <ArrowRight size={16} /></span><small>{guide.time}</small></div></Link>)}
      </div><p className="more-guides-note"><BookOpen size={14} /> More how-to guides are on the way. Same place. More know-how.</p>
    </div>
    </section>
    <LocatorRotator />
    <section className="download-section"><div className="container"><p className="eyebrow">FDNY MUTUAL TRACKER</p><h2>READY FOR YOUR NEXT TOUR?</h2><p>Get the app built by someone who works the same job.</p><StoreButtons /><span className="download-footnote"><ShieldCheck size={14} /> Available for iPhone and Android. Your calendar stays yours.</span></div></section>
  </>
}

function LocatorRotator() {
  const { index, setIndex, setPaused } = useRotator(2)
  return (
    <section
      className="locator-rotator"
      aria-roledescription="carousel"
      aria-label="Featured features"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="container locator-rotator-viewport">
        <div className={`locator-card ${index === 0 ? 'is-active' : 'is-hidden'}`} aria-hidden={index !== 0}>
          <div className="locator-panel">
            <div className="locator-copy">
              <span className="small-icon"><MapPin size={22} /></span>
              <p className="eyebrow">WHO'S TAKING THE DETAIL?</p>
              <h2>TAKE IT ON THE HOP.</h2>
              <p>Search and navigate to any firehouse in NYC, right from your tracker.</p>
            </div>
            <div className="locator-image"><img src="/images/original-4.webp" alt="FDNY Unit Locator map showing firehouses in Manhattan" loading="lazy" /></div>
          </div>
        </div>
        <div className={`locator-card ${index === 1 ? 'is-active' : 'is-hidden'}`} aria-hidden={index !== 1}>
          <div className="locator-panel locator-panel--vacation">
            <div className="locator-copy">
              <span className="small-icon"><CalendarDays size={22} /></span>
              <p className="eyebrow">WHEN'S YOUR NEXT VACATION?</p>
              <h2>VACATION LOOKUP.</h2>
              <p>Just enter your vacation letter and group number to find your vacation sets until 2033.</p>

            </div>
            <div className="locator-image"><img src="/images/screen-13.webp" alt="Vacation Lookup showing vacation sets by seniority" loading="lazy" /></div>
          </div>
        </div>
      </div>
      <div className="locator-rotator-dots" role="tablist" aria-label="Choose feature">
        {[0, 1].map(i => (
          <button
            key={i}
            role="tab"
            aria-selected={index === i}
            aria-label={i === 0 ? 'Show Take it on the hop' : 'Show Vacation Lookup'}
            className={index === i ? 'is-active' : ''}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  )
}
