import { add, remove } from 'bianco.events'
import { defaults, router } from 'rawth'
import { has } from 'bianco.attr'

const WINDOW_EVENTS = 'popstate'
const CLICK_EVENT = 'click'
const DOWNLOAD_LINK_ATTRIBUTE = 'download'
const HREF_LINK_ATTRIBUTE = 'href'
const TARGET_SELF_LINK_ATTRIBUTE = '_self'
const LINK_TAG_NAME = 'A'
const HASH = '#'
const RE_ORIGIN = /^.+?\/\/+[^/]+/
const UNDEFINED = 'undefined'

const win = typeof window !== UNDEFINED && window
const doc = typeof document !== UNDEFINED && document
const hist = win && history
const loc = win && (hist.location || win.location)

const onWindowEvent = () => router.push(normalizePath(String(loc.href)))
const getLinkElement = node => node && !isLinkNode(node) ? getLinkElement(node.parentNode) : node
const isLinkNode = node => node.nodeName === LINK_TAG_NAME
const isCrossOriginLink = path => path.indexOf(loc.href.match(RE_ORIGIN)[0]) === -1
const isTargetSelfLink = el => el.target && el.target !== TARGET_SELF_LINK_ATTRIBUTE
const isEventForbidden = event => (event.which && event.which !== 1) // not left click
    || event.metaKey || event.ctrlKey || event.shiftKey // or meta keys
    || event.defaultPrevented // or default prevented
const isForbiddenLink = el => !el || !isLinkNode(el) // not A tag
    || has(el, DOWNLOAD_LINK_ATTRIBUTE) // has download attr
    || !has(el, HREF_LINK_ATTRIBUTE) // has no href attr
    || isTargetSelfLink(el.target)
    || isCrossOriginLink(el.href)
const isHashLink = path => path.split(HASH).length > 1
const normalizePath = path => path.replace(defaults.base, '')

/**
 * Callback called anytime something will be clicked on the page
 * @param   {HTMLEvent} event - click event
 * @returns {undefined} void method
 */
const onClick = event => {
  if (isEventForbidden(event)) return

  const el = getLinkElement(event.target)

  if (isForbiddenLink(el) || isHashLink(el.href)) return

  const path = normalizePath(el.href)

  router.push(path)
  hist.pushState(null, el.title || doc.title, path)
  event.preventDefault()
}

/**
 * Link the rawth router to the DOM events
 * @param { HTMLElement } container - DOM node where the links are located
 * @returns {Function} teardown function
 */
export default function initDomListeners(container) {
  const root = container || doc

  add(win, WINDOW_EVENTS, onWindowEvent)
  add(root, CLICK_EVENT, onClick)

  return () => {
    remove(win, WINDOW_EVENTS, onWindowEvent)
    remove(root, CLICK_EVENT, onClick)
  }
}