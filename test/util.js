export function fireEvent(el, name) {
  const e = new Event(name, { bubbles: true, cancelable: false })

  el.dispatchEvent(e)
}

export const sleep = (timeout) => new Promise((r) => setTimeout(r, timeout))

export const base = 'https://riot.rocks'
