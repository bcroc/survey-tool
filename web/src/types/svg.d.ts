declare module '*.svg' {
  const src: string;
  export default src;
}

// Support Vite `?url` imports which return a string URL
declare module '*?url' {
  const src: string;
  export default src;
}
