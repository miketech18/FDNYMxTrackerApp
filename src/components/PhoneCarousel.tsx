import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
const screens = [
  { id: 9, label: 'Overtime, down to the detail' },
  { id: 1, label: 'Your entire tour, at a glance' },
  { id: 2, label: 'Keep your MX partner in sync' },
  { id: 3, label: 'Every overtime hour accounted for' },
  { id: 4, label: 'Everything you need for your day' },
  { id: 5, label: 'Know your numbers' },
  { id: 6, label: 'Never miss an RSOT date' },
  { id: 7, label: 'Your mutuals. All balanced.' },
  { id: 8, label: 'Your schedule, right on your home screen' },
  { id: 10, label: 'Find your next mutual' },
  { id: 11, label: 'Your app. The way you work.' },
  { id: 12, label: 'Your FDNY resources, in one place' },
]
export function PhoneCarousel() {
  const [active, setActive] = useState(0)
  const touchStart = useRef<number | null>(null)
  const move = (direction: number) => setActive((previous) => (previous + direction + screens.length) % screens.length)
  return <div className="hero-carousel" aria-roledescription="carousel" aria-label="Inside FDNY Mutual Tracker">
    <div className="phone-stage" onTouchStart={e => { touchStart.current = e.touches[0].clientX }} onTouchEnd={e => { if (touchStart.current !== null) { const difference = touchStart.current - e.changedTouches[0].clientX; if (Math.abs(difference) > 35) move(difference > 0 ? 1 : -1); touchStart.current = null } }}>
      {[-2, -1, 0, 1, 2].map(position => {
        const screen = position === -2 && active === 0 ? { id: 7, label: 'Mutual tracking' } : position === -1 && active === 0 ? { id: 8, label: 'Home screen widgets' } : position === 1 && active === 0 ? { id: 10, label: 'Post an open mutual' } : position === 2 && active === 0 ? { id: 11, label: 'App settings' } : screens[(active + position + screens.length) % screens.length]
        return <div key={`${position}-${screen.id}`} className={`phone phone-position-${position}`} aria-hidden={position !== 0}><div className="phone-frame"><div className="phone-notch" /><img src={`/images/screen-${screen.id}.webp`} alt={screen.label} draggable="false" /></div></div>
      })}
    </div>
    <div className="carousel-controls"><button onClick={() => move(-1)} aria-label="Previous app screenshot"><ArrowLeft size={16} /></button><div className="carousel-center"><p aria-live="polite">{screens[active].label}</p><div className="carousel-dots">{screens.map((screen, index) => <button key={screen.id} className={active === index ? 'active' : ''} onClick={() => setActive(index)} aria-label={`Show ${screen.label.toLowerCase()}`} aria-current={active === index ? 'true' : undefined} />)}</div></div><button onClick={() => move(1)} aria-label="Next app screenshot"><ArrowRight size={16} /></button></div>
  </div>
}
