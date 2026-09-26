export function Icon({ name, size = 16 }: { name: 'terminal' | 'up' | 'down' | 'slight' | 'undo' | 'expand' | 'close' | 'copy' | 'check' | 'arrow' | 'spark'; size?: number }) {
  const paths = {
    terminal: <><path d="m4 5 6 7-6 7M14 19h6" /></>,
    up: <><path d="M12 20V4m-7 7 7-7 7 7" /></>,
    down: <><path d="M12 4v16m-7-7 7 7 7-7" /></>,
    slight: <><path d="M5 19 19 5M6 5h13v13" /></>,
    undo: <><path d="M8 4 3 9l5 5M3 9h11a7 7 0 0 1 0 14" /></>,
    expand: <><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /></>,
    close: <><path d="m6 6 12 12M6 18 18 6" /></>,
    copy: <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M15 8V3H3v13h5" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    arrow: <><path d="M4 12h16m-6-6 6 6-6 6" /></>,
    spark: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
