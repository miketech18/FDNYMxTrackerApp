// The single source of truth for the WCAG 2.5.8 (target size) probe, shared by
// the CI guard in scripts/test.mjs and the standalone scripts/audit-tap-targets.mjs.
//
// Everything that decides a pass or a fail lives here, because the two copies
// this replaced had already drifted: the audit swept textareas and the CI guard
// did not, so a sub-24px textarea could fail locally and pass CI silently.

export const MIN_TARGET = 24

// Anything that can receive a pointer. A control the site ships but this list
// omits is simply never measured, so keep it complete.
const CONTROL_SELECTOR = 'a[href], button, [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])'

// Pinned chrome is switched to static for the duration of the probe so a fixed
// header, banner or sidebar cannot sit on top of a control and answer the hit
// test in its place.
const STICKY_CHROME = '.site-header,.download-bar,.announcement-banner,.guide-progress,.article-sidebar'

// How far the flood may reach past a control's own border box, and how far the
// viewport may be nudged to drag a control out from under covering chrome.
const WALK_LIMIT = 80
const SCROLL_OFFSETS = [0, 120, -120, 260, -260]

/**
 * Measures every interactive control on the page and reports the region that
 * actually receives the pointer, not the element's border box.
 *
 * A control may legitimately grow its target with padding or an ::after overlay
 * (the carousel dots used one), so the box is found by pushing elementFromPoint
 * outward from the control's centre until the point stops resolving to it.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ min?: number }} [options]
 * @returns {Promise<Array<{ path: string, tag: string, text: string,
 *   width: number, height: number, layoutWidth: number, layoutHeight: number,
 *   undersized: boolean }>>}
 */
export async function measureTargets(page, { min = MIN_TARGET } = {}) {
  return page.evaluate(({ min, CONTROL_SELECTOR, STICKY_CHROME, WALK_LIMIT, SCROLL_OFFSETS }) => {
    const isHit = (x, y, el) => {
      if (x < 0 || y < 0 || x > window.innerWidth - 1 || y > window.innerHeight - 1) return false
      const top = document.elementFromPoint(x, y)
      return !!top && (top === el || el.contains(top))
    }
    // The hit region of one control, or null when its centre is not reachable
    // (covered by chrome, or scrolled out of the viewport).
    const boxOf = (el) => {
      const rect = el.getBoundingClientRect()
      if (!rect.width || !rect.height) return null
      const cx = Math.round(rect.left + rect.width / 2)
      const cy = Math.round(rect.top + rect.height / 2)
      if (!isHit(cx, cy, el)) return null
      let left = 0, right = 0, up = 0, down = 0
      while (left < WALK_LIMIT && isHit(Math.round(rect.left) - left - 1, cy, el)) left += 1
      while (right < WALK_LIMIT && isHit(Math.round(rect.right) + right, cy, el)) right += 1
      while (up < WALK_LIMIT && isHit(cx, Math.round(rect.top) - up - 1, el)) up += 1
      while (down < WALK_LIMIT && isHit(cx, Math.round(rect.bottom) + down, el)) down += 1
      return {
        width: rect.width + left + right,
        height: rect.height + up + down,
        layout: { width: rect.width, height: rect.height }
      }
    }

    const chrome = document.createElement('style')
    chrome.textContent = `${STICKY_CHROME}{position:static!important}`
    document.head.appendChild(chrome)

    // A transform: scale() reports presentation size, not the size the control
    // was authored at. The phone mock is an illustration of the app rather than
    // the app UI, so its controls are out of scope while the mock is scaled.
    const device = document.querySelector('.sim-device')
    const mockIsScaled = !!device && getComputedStyle(device).transform !== 'none'

    const results = []
    for (const el of document.querySelectorAll(CONTROL_SELECTOR)) {
      const style = getComputedStyle(el)
      if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') continue
      if (el.disabled) continue
      if (mockIsScaled && el.closest('.sim-device')) continue
      if (!el.getBoundingClientRect().height) continue

      const path = []
      let node = el
      while (node && node !== document.body) {
        const cls = typeof node.className === 'string' && node.className ? '.' + node.className.trim().split(/\s+/).join('.') : ''
        path.unshift(node.tagName.toLowerCase() + cls)
        node = node.parentElement
      }

      // The site sets scroll-behavior: smooth, so a programmatic scroll has to
      // be forced instant or the probe races the animation and measures the
      // control at the position it is leaving.
      el.scrollIntoView({ block: 'center', behavior: 'instant' })
      let best = null
      for (const offset of SCROLL_OFFSETS) {
        if (offset) window.scrollBy({ top: offset, behavior: 'instant' })
        const box = boxOf(el)
        if (!box) continue
        if (!best || box.width * box.height > best.width * best.height) best = box
        if (box.width >= min && box.height >= min) break
      }
      if (!best) continue

      results.push({
        path: path.join(' > '),
        tag: el.tagName.toLowerCase(),
        text: (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 46),
        width: best.width,
        height: best.height,
        layoutWidth: best.layout.width,
        layoutHeight: best.layout.height,
        undersized: best.width < min || best.height < min
      })
    }

    chrome.remove()
    return results
  }, { min, CONTROL_SELECTOR, STICKY_CHROME, WALK_LIMIT, SCROLL_OFFSETS })
}

/** Formats one finding as `WxH tag "text"`, for guards and logs. */
export const describeTarget = (item) => `${Math.round(item.width)}x${Math.round(item.height)} ${item.tag} "${item.text}"`
