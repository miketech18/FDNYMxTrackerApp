import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnnouncementBanner, Header, Footer, DownloadBar } from './components/Layout'
import { FeedbackModal } from './components/FeedbackModal'
import { Home } from './pages/Home'
import { Guides, GuidePage, NotFound } from './pages/Guides'
import { guides } from './lib/guides'

function AppContent() {
  const [feedback, setFeedback] = useState(() => window.location.hash === '#feedback-section')
  const location = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const guide = guides.find(item => location.pathname === `/guides/${item.slug}`)
    document.title = guide ? `${guide.title} · FDNY Mutual Tracker` : location.pathname.includes('guides') ? 'How-to Guides · FDNY Mutual Tracker' : 'FDNY Mutual Tracker · Built for our job'
  }, [location.pathname])

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <AnnouncementBanner />
      <Header key={location.pathname} onFeedback={() => setFeedback(true)} />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home onFeedback={() => setFeedback(true)} />} />
          <Route path="/guides" element={<Guides onFeedback={() => setFeedback(true)} />} />
          <Route path="/guides/:slug" element={<GuidePage key={location.pathname} onFeedback={() => setFeedback(true)} />} />
          <Route path="/how-to-share-calendar.html" element={<Navigate to="/guides/share-calendar" replace />} />
          <Route path="/Send-MxP-Mutuals.html" element={<Navigate to="/guides/send-mxp-mutuals" replace />} />
          <Route path="/how-to-overtime-equalization.html" element={<Navigate to="/guides/overtime-equalization" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer onFeedback={() => setFeedback(true)} />
      <DownloadBar />
      {feedback && <FeedbackModal onClose={() => setFeedback(false)} context={location.pathname} />}
    </>
  )
}

function App() {
  return <BrowserRouter><AppContent /></BrowserRouter>
}

export default App
