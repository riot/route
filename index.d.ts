import { RiotComponentWrapper, RiotComponent } from 'riot'
import { URLWithParams } from 'rawth'

export * from 'rawth'
export type Route = RiotComponentWrapper<
  RiotComponent<{
    path: string
    'on-before-mount'?: (path: URLWithParams) => void
    'on-mounted'?: (path: URLWithParams) => void
    'on-before-unmount'?: (path: URLWithParams) => void
    'on-unmounted'?: (path: URLWithParams) => void
  }>
>
export type Router = RiotComponentWrapper<
  RiotComponent<{
    base?: string
    'initial-route'?: string
    'on-started'?: (route: string) => void
  }>
>
export declare function getCurrentRoute(): string
export declare function initDomListeners(): void
export declare function setBase(base: string): void
