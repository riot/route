import rawth, { router as rawthRouter } from 'rawth'
import initDomListeners from './dom'

export const route = rawth
export const router = rawthRouter
export const listenDOMEvents = initDomListeners