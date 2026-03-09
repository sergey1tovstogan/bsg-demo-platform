/// <reference types="vite/client" />

declare const __APP_VERSION__: string
declare const __GITHUB_REPO__: string

declare module '*.png' {
  const value: string
  export default value
}

declare module '*.jpg' {
  const value: string
  export default value
}

declare module '*.jpeg' {
  const value: string
  export default value
}

declare module '*.svg' {
  const value: string
  export default value
}

declare module '*.gif' {
  const value: string
  export default value
}

declare module '*.webp' {
  const value: string
  export default value
}

declare module 'rehype-sanitize' {
  import type { Plugin } from 'unified'
  const rehypeSanitize: Plugin
  export default rehypeSanitize
}
