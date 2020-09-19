import {HASH, SLASH} from './constants'
import {defaults} from 'rawth'
import {getWindow} from './util'

export const normalizeInitialSlash = str => str[0] === SLASH ? str : `${SLASH}${str}`
export const removeTrailingSlash = str => str[str.length - 1] === SLASH ? str.substr(0, str.length - 1) : str

export const normalizeBase = base => {
  const win = getWindow()
  const loc = win.location
  const root = loc ? `${loc.protocol}//${loc.host}` : ''
  const {pathname} = loc ? loc : {}

  switch (true) {
  // pure root url + pathname
  case Boolean(base) === false:
    return removeTrailingSlash(`${root}${pathname || ''}`)
  // full path base
  case /(www|http(s)?:)/.test(base):
    return base
  // hash navigation
  case base[0] === HASH:
    return `${root}${pathname && pathname !== SLASH ? pathname : ''}${base}`
  // root url with trailing slash
  case base === SLASH:
    return removeTrailingSlash(root)
  // custom pathname
  default:
    return removeTrailingSlash(`${root}${normalizeInitialSlash(base)}`)
  }
}


export default function setBase(base) {
  defaults.base = normalizeBase(base)
}
