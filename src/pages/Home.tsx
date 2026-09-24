import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight, ArrowUpRight, ArrowLeftRight, BookOpen, CalendarDays, Check, ClipboardCheck, Clock3, MapPin, MessageSquare, ShieldCheck } from 'lucide-react'
import { PhoneCarousel } from '../components/PhoneCarousel'
import { StoreButtons } from '../components/Layout'
import { guides } from '../lib/guides'

export function Home({ onFeedback }: { onFeedback: () => void }) {
  return <>
    <section className="hero-section"><div className="container hero-grid">
      <div className="hero-copy"><p className="eyebrow hero-eyebrow"><span className="status-dot" /> V4.9.5 IS 10-84 <span className="eyebrow-divider" /> READY FOR YOUR NEXT TOUR</p><h1>BUILT BY AN FDNY<br />FIREFIGHTER.<br /><span className="brass-text">MADE FOR OUR JOB.</span><br /><span className="red-text">EVERYTHING WE NEED.</span></h1><div className="home-simulator-cta"><Link className="button-red" to="/app-simulator">Try the app simulator <ArrowRight size={16} /></Link></div><a className="explore-link" href="#field-guide">Get more from your tracker <ArrowDown size={16} /></a></div>
      <PhoneCarousel />
    </div><div className="container hero-trust hero-features"><span><CalendarDays size={14} /> Your schedule, sorted</span><span className="trust-separator" aria-hidden="true" /><span><ArrowLeftRight size={14} /> Mutuals without the mix-ups</span><span className="trust-separator" aria-hidden="true" /><span><Clock3 size={14} /> Every hour accounted for</span><span className="trust-separator" aria-hidden="true" /><span><ClipboardCheck size={14} /> Catch the missing marks</span></div></section>
    <section className="quick-help-section" id="field-guide"><div className="container"><div className="section-heading"><div><p className="eyebrow">YOUR POCKET FIELD GUIDE</p><h2>Drill in the kitchen.</h2></div><Link className="text-link" to="/guides">All how-to guides <ArrowUpRight size={17} /></Link></div>
      <div className="quick-help-grid"><button className="feedback-card" onClick={onFeedback}><span className="feedback-card-top"><span className="card-icon"><MessageSquare size={23} /></span><span className="feedback-card-label">YOUR VOICE MATTERS</span><ArrowUpRight size={20} /></span><span className="feedback-card-title">HELP BUILD A BETTER APP.</span><span className="feedback-card-description">Found a bug? Have an idea?<br />Let’s make the next tour even better.</span><span className="feedback-card-cta">Send feedback <ArrowRight size={17} /></span></button>
      {guides.map(guide => <Link key={guide.slug} to={`/guides/${guide.slug}`} className="guide-card" data-umami-event="guide-click" data-umami-event-guide={guide.slug} data-umami-event-location="home"><div className="guide-card-top"><span className="card-icon"><guide.icon size={23} /></span><span className="guide-label">HOW-TO GUIDE</span><ArrowUpRight size={18} /></div><h3>{guide.shortTitle}</h3><p>{guide.description}</p><div className="guide-card-bottom"><span>Read the guide <ArrowRight size={16} /></span><small>{guide.time}</small></div></Link>)}
      </div><p className="more-guides-note"><BookOpen size={14} /> More how-to guides are on the way. Same place. More know-how.</p>
    </div>
    </section>
    <section className="locator-section"><div className="container locator-panel"><div className="locator-copy"><span className="small-icon"><MapPin size={22} /></span><p className="eyebrow">KNOW WHERE YOU’RE GOING</p><h2>TAKE IT ON THE HOP.</h2><p>Heading to a different house? Search and navigate to any firehouse in NYC, right from your tracker.</p><span className="inline-note"><Check size={16} /> Find your house. Get directions. Get on the job.</span></div><div className="locator-image"><img src="/images/original-4.webp" alt="FDNY Unit Locator map showing firehouses in Manhattan" loading="lazy" /></div></div></section>
    <section className="download-section"><div className="container"><p className="eyebrow">FDNY MUTUAL TRACKER</p><h2>READY FOR YOUR NEXT TOUR?</h2><p>Get the app built by someone who works the same job.</p><StoreButtons /><span className="download-footnote"><ShieldCheck size={14} /> Available for iPhone and Android. Your calendar stays yours.</span></div></section>
  </>
}
