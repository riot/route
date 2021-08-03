export const getGlobal = () => getWindow() || global
export const getWindow = () => typeof window === 'undefined' ? null : window
export const getDocument = () => typeof document === 'undefined' ? null : document
export const getHistory = () => typeof history === 'undefined' ? null : history
export const getLocation = () => {
  const win = getWindow()
  return win ? win.location : {}
}

export const defer = (() => {
  const globalScope = getGlobal()

  return globalScope.requestAnimationFrame || globalScope.setTimeout
})()

export const cancelDefer = (() => {
  const globalScope = getGlobal()

  return globalScope.cancelAnimationFrame || globalScope.clearTimeout
})()
