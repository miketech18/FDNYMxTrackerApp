import { CalendarDays, ArrowLeftRight, ScanLine } from 'lucide-react'

export type GuideStep = { title: string; text: string; bullets?: string[]; image?: string; imageAlt?: string; note?: string }
export const guides = [
  {
    slug: 'share-calendar', title: 'Share your calendar with family', shortTitle: 'Share calendar with family',
    description: 'Keep everyone in the loop. Share your schedule with the people who matter.',
    category: 'Calendar', time: '4 min read', icon: CalendarDays, label: 'KEEP THE FAMILY IN THE LOOP',
    intro: 'Let your family see your tours, overtime, and mutuals in the calendar they already use. Share once, and your schedule stays connected.',
    steps: [
      { title: 'Find Share Calendar in Settings', text: 'Open FDNY Mutual Tracker and tap Settings in the bottom navigation. Scroll to Data & Maintenance, then tap Share Calendar.', image: '/images/step-1-settings.webp', imageAlt: 'FDNY Mutual Tracker settings with the Share Calendar option' },
      { title: 'Generate your share link', text: 'Tap Generate New Link. If you already have a link, tap Share Link. This creates a unique URL that your family can use to subscribe to your schedule.', image: '/images/step-2-generate-link.webp', imageAlt: 'Share Calendar panel with a generated calendar link', note: 'Keep this link private. Anyone with the link can view your shared schedule.' },
      { title: 'Copy and share the link', text: 'Tap and hold the link to select and copy the full URL. Send it to your family member by email or message. They will use this link in their preferred calendar app.' },
      { title: 'Add it to Google Calendar', text: 'On a computer, open calendar.google.com and sign in. Find Other calendars in the left sidebar, click the + button, and choose From URL.', image: '/images/step-3-google-calendar-menu.webp', imageAlt: 'Google Calendar with the Other calendars menu open', bullets: ['Paste your shared calendar link into the URL of calendar field.', 'Click Add calendar.', 'Your FDNY schedule will appear under Other calendars.'] },
      { title: 'You’re connected', text: 'Your family’s calendar now subscribes to your FDNY schedule. Updates to your tours, overtime, and mutual exchanges will sync without having to share a new link.', note: 'Subscribed calendars do not always update immediately. Refresh timing is controlled by the calendar provider, not FDNY Mutual Tracker.' },
    ] as GuideStep[],
    faqs: [
      { question: 'Can my family use Apple Calendar or Outlook?', answer: 'Yes. Your share link uses the iCalendar (.ics) format. In Apple Calendar on a Mac, choose File → New Calendar Subscription and paste the link. In Outlook, use Add calendar → Subscribe from web. Follow your calendar app’s subscription prompts.' },
      { question: 'Can a family member edit my schedule?', answer: 'A calendar subscription is read-only. Your family can view your shared schedule, but updates are made in your FDNY Mutual Tracker app.' },
      { question: 'How do I stop sharing?', answer: 'Open Settings → Share Calendar and tap Stop Sharing. The share link will stop working. Calendar apps may retain events they already downloaded until they refresh or the subscriber removes the calendar.' },
    ],
  },
  {
    slug: 'send-mxp-mutuals', title: 'Send mutuals to your MX partner', shortTitle: 'Send MXP mutuals',
    description: 'Send a set, get approval, and keep both calendars on the same page.',
    category: 'Mutuals', time: '3 min read', icon: ArrowLeftRight, label: 'LESS BACK-AND-FORTH. MORE IN SYNC.',
    intro: 'Choose your mutual sets, send them to your MX partner for approval, and let the app take care of marking their calendar.',
    steps: [
      { title: 'Open Month View and pick your sets', text: 'Start in the Calendar tab. Tap the day you want to exchange, then enter the set: First, Second, Inside, or Outsides.', image: '/images/mutual-1788729491787_0nrhy6es0.webp', imageAlt: 'Month view showing marked mutual tours', note: 'Calendar first. The app pulls the tours you send from your existing calendar entries.' },
      { title: 'Go to My Crew → MX Partner', text: 'Tap My Crew in the bottom navigation, then open the MX Partner tab. Confirm your active partner and tap Send MX Partner Mutuals.', image: '/images/mutual-1788729492918_za86km1t1.webp', imageAlt: 'My Crew screen with the Send MX Partner Mutuals button' },
      { title: 'Review and send your mutual set', text: 'Enter the date range for the sets you want to send. Tap Review Calendar Mutuals, check the proposed sets, and send them to your partner.', image: '/images/mutual-1788729493290_5iwa4zhya.webp', imageAlt: 'Send Partner Mutuals screen with the date range and review button', bullets: ['Check that your date range includes all the tours you want to exchange.', 'Review the opposite sets that will be sent to your partner.', 'Submit the mutual set for approval.'] },
      { title: 'Your partner approves. Tours auto-mark.', text: 'Your partner receives a notification to review the set. Once they approve, the opposite tours are automatically marked with a grey shade on their calendar. No manual entry needed.', image: '/images/mutual-step-4.3.webp', imageAlt: 'MX Partner mutuals awaiting approval with Accept and Decline actions', bullets: ['Check pending swaps under MX Partner Sets Awaiting Their Approval.', 'Review completed swaps in MX Partner History.'] },
    ] as GuideStep[],
    faqs: [
      { question: 'How do I add an MX partner?', answer: 'Go to My Crew → MX Partner. If you do not have a partner, tap Add Crew and search by name or unit. Once added, they will appear as your active MX partner.' },
      { question: 'What if my partner rejects the mutual swap?', answer: 'The swap will appear in MX Partner History with a rejected status. You can update the tours on your calendar and send a new mutual set.' },
      { question: 'Can I edit tours after sending them?', answer: 'A submitted set cannot be edited directly. Ask your partner to reject the set, then correct your calendar entries and submit a new set.' },
    ],
  },
  {
    slug: 'overtime-equalization', title: 'Scan and verify your MSOT', shortTitle: 'Scan & verify MSOT',
    description: 'Scan your OT sheet, read the projection, and reconcile MSOT alerts.',
    category: 'Overtime', time: '5 min read', icon: ScanLine, label: 'ONE REPORT. FOUR CHECKS.',
    intro: 'Use the latest Overtime Equalization Report to check projected MSOT and compare report hours with your calendar.',
    steps: [] as GuideStep[],
    faqs: [],
  },
]
