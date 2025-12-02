// Type declaration for react-dom/client
// This ensures TypeScript recognizes the module even if @types/react-dom is not fully resolved
declare module 'react-dom/client' {
  import { ReactNode } from 'react'
  
  export interface Root {
    render(children: ReactNode): void
    unmount(): void
  }
  
  export function createRoot(
    container: Element | DocumentFragment,
    options?: {
      identifierPrefix?: string
      onRecoverableError?: (error: unknown) => void
    }
  ): Root
  
  export function hydrateRoot(
    container: Element | DocumentFragment,
    initialChildren: ReactNode,
    options?: {
      identifierPrefix?: string
      onRecoverableError?: (error: unknown) => void
    }
  ): Root
}

