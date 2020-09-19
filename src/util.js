export const getWindow = () => typeof window === 'undefined' ? null : window
export const getDocument = () => typeof document === 'undefined' ? null : document
export const getHistory = () => getWindow() && history
export const getLocation = () => {
  const win = getWindow()
  const hist = getHistory()

  return win && (hist.location || win.location)
}
