/// <reference types="react-dom/client" />

// Ensure react-dom/client types are available
declare module 'react-dom/client' {
  import * as ReactDOM from 'react-dom'
  export * from 'react-dom'
  
  interface Root {
    render(children: React.ReactNode): void
    unmount(): void
  }
  
  export function createRoot(container: Element | DocumentFragment): Root
}

