import type { JSX } from 'react'

const checklistStorageKey = 'fdny-howto3-checks'

const steps = [
  { id: 'newReport', title: 'Start a new report scan', image: '/images/equalization-step-2.png', alt: 'New overtime equalization report scan screen' },
  { id: 'scanOptions', title: 'Capture the sheet', image: '/images/equalization-step-3.png', alt: 'Overtime report scan options' },
  { id: 'projectedMsot', title: 'Read your projected MSOT number', image: '/images/equalization-step-4.png', alt: 'Projected MSOT result on the report' },
  { id: 'calendarStats', title: 'Clear the calendar alerts', image: '/images/equalization-step-1.png', alt: 'Calendar overtime equalization statistics' },
]

export function OvertimeEqualizationGuide({ onFeedback }: { onFeedback: () => void }): JSX.Element {
  return <article className="msot-guide">
    <header>
      <p>HOW-TO #03</p>
      <h1>SCAN &amp; VERIFY MSOT</h1>
    </header>
    {steps.map(step => <section id={step.id} key={step.id}>
      <h2>{step.title}</h2>
      <img src={step.image} alt={step.alt} />
    </section>)}
    <section>
      <label htmlFor="calendar-hours">Calendar hours</label>
      <input id="calendar-hours" type="range" min="0" max="36" step="1" defaultValue="24" />
    </section>
    <button type="button" onClick={onFeedback}>Send feedback</button>
    <span hidden>{checklistStorageKey}</span>
  </article>
}
