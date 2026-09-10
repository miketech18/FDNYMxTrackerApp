import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Bug, Check, ChevronDown, Lightbulb, LoaderCircle, MessageSquare, ShieldCheck, X } from 'lucide-react'

type FeedbackType = 'Feature idea' | 'Bug report' | 'Something else'
export function FeedbackModal({ onClose, context }: { onClose: () => void; context: string }) {
  const [type, setType] = useState<FeedbackType>('Feature idea')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const controller = useRef<AbortController | null>(null)
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const keydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const items = ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a, input, textarea, select')
        if (!items?.length) return
        const first = items[0], last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', keydown)
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', keydown); previouslyFocused?.focus(); controller.current?.abort() }
  }, [onClose])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending') return
    const form = new FormData(event.currentTarget)
    setStatus('sending')
    const abortController = new AbortController()
    controller.current = abortController
    const timeout = setTimeout(() => abortController.abort(), 18000)
    try {
      const response = await fetch('https://formsubmit.co/ajax/fdnyscheduler@gmail.com', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, signal: abortController.signal,
        body: JSON.stringify({ name: form.get('name'), email: form.get('email'), type, platform: form.get('platform'), message: message.trim(), _subject: `FDNY Mutual Tracker — ${type}`, _template: 'table', _captcha: 'false', source_page: context, _honey: form.get('_honey') }),
      })
      const result = await response.json()
      if (!response.ok || (result.success !== true && result.success !== 'true')) throw new Error('Submission failed')
      setStatus('success')
    } catch { setStatus('error') } finally { clearTimeout(timeout) }
  }
  return <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}><div className="feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedback-title" ref={ref}>
    <button className="modal-close" onClick={onClose} aria-label="Close feedback"><X size={21} /></button>
    {status === 'success' ? <div className="feedback-success"><div className="success-icon"><Check size={34} /></div><p className="eyebrow">RECEIVED. THANK YOU.</p><h2 id="feedback-title">YOU MAKE THIS<br />APP BETTER.</h2><p>You feedback has been sent. I reply to all emails and will reply within 24hrs. Thank You.</p><button className="button-red" onClick={onClose}>Back to the app <ArrowRight size={17} /></button></div> : <>
      <div className="feedback-modal-heading"><span className="feedback-icon"><MessageSquare size={25} /></span><p className="eyebrow">FROM THE FIREHOUSE. FOR THE FIREHOUSE.</p><h2 id="feedback-title">GOT SOMETHING<br />ON YOUR MIND?</h2><p>A bug, an idea, or something that could work better.<br className="desktop-break" /> I’m listening.</p></div>
      <form onSubmit={submit} className="feedback-form">
        <fieldset><legend>What would you like to share?</legend><div className="feedback-types">{([{ value: 'Feature idea', icon: Lightbulb }, { value: 'Bug report', icon: Bug }, { value: 'Something else', icon: MessageSquare }] as const).map(item => <button key={item.value} type="button" className={type === item.value ? 'selected' : ''} aria-pressed={type === item.value} onClick={() => setType(item.value)}><item.icon size={16} />{item.value}</button>)}</div></fieldset>
        <div className="form-row"><label>Your name<input name="name" placeholder="First and last name" required autoComplete="name" maxLength={100} /></label><label>Email address<input name="email" type="email" placeholder="you@example.com" required autoComplete="email" maxLength={180} /></label></div>
        <label>Your device <span className="optional">(optional)</span><div className="select-wrap"><select name="platform" defaultValue=""><option value="">Select your platform</option><option>iPhone / iPad</option><option>Android</option><option>Website</option><option>Other</option></select><ChevronDown size={16} /></div></label>
        <label>Your message<textarea name="message" placeholder={type === 'Bug report' ? 'What happened, and what were you expecting? Include the steps so I can take a look.' : 'Tell me what would make the app work better for you…'} required minLength={10} maxLength={4000} value={message} onChange={e => setMessage(e.target.value)} rows={4} /></label><span className="character-count">{message.length} / 4,000</span>
        <input name="_honey" type="text" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true" />
        {status === 'error' && <div className="form-error" role="alert">Your feedback couldn’t be sent. Please try again, or email <a href={`mailto:fdnyscheduler@gmail.com?subject=${encodeURIComponent(`FDNY Mutual Tracker — ${type}`)}&body=${encodeURIComponent(message)}`}>fdnyscheduler@gmail.com</a> directly. Your message is still here.</div>}
        <button className="button-red submit-feedback" type="submit" disabled={status === 'sending'}>{status === 'sending' ? <><LoaderCircle size={18} className="spinner" /> Sending feedback…</> : <><MessageSquare size={17} />Send feedback<ArrowRight size={17} /></>}</button>
        <p className="form-privacy"><ShieldCheck size={15} /><span>Sent to the developer via FormSubmit. Your email is only used to reply. <a href="https://formsubmit.co/privacy" target="_blank" rel="noreferrer">Privacy policy</a></span></p>
      </form>
    </>}
  </div></div>
}
