import { useEffect, useMemo, useState } from 'react';
import { derive, LIMIT, restore, type Session, type Vote } from './core/engine';
import { checkedAt, fonts, loadFont, revision, type Face, type Font } from './core/fonts';
import { fontConfig, readPalette, type Palette } from './core/palette';
import { Specimen } from './components/Specimen';
const ids = fonts.map(f => f.id);
const key = 'wezterm-font-picker.session.v1';
const newSession = (): Session => ({revision, seed: crypto.getRandomValues(new Uint32Array(1))[0], events: []});
function initialSession() { try { return restore(localStorage.getItem(key), ids, revision) || newSession(); } catch { return newSession(); } }
function CopyBlock({ value, label }: {value: string; label: string}) {
  const [status, setStatus] = useState('');
  useEffect(() => setStatus(''), [value]);
  const copy = async () => { try { await navigator.clipboard.writeText(value); setStatus('Copied'); } catch { setStatus('Select the text below to copy.'); } };
  return <div className="copy-block"><div><span>{label}</span><button onClick={() => void copy()}>{status === 'Copied' ? 'Copied ✓' : 'Copy'}</button></div><pre tabIndex={0}>{value}</pre>{status && <small role="status">{status}</small>}</div>;
}
function useFaces(faces: Face[]) {
  const identity = faces.map(f => f.file).join('|');
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState<{identity: string; aliases: string[]; error: boolean}>({identity: '', aliases: [], error: false});
  useEffect(() => {
    let alive = true;
    setState({identity, aliases: [], error: false});
    Promise.all(faces.map(loadFont)).then(aliases => { if (alive) setState({identity, aliases, error: false}); }).catch(() => { if (alive) setState({identity, aliases: [], error: true}); });
    return () => { alive = false; };
  }, [identity, retry]);
  const ready = state.identity === identity && state.aliases.length === faces.length && faces.length > 0;
  return { ready, aliases: ready ? state.aliases : [], error: state.identity === identity && state.error, retry: () => setRetry(n => n + 1) };
}
function Result({ choices, runners, palette, tied, count, onBack, onRestart }: {choices: Font[]; runners: Font[]; palette: Palette; tied: boolean; count: number; onBack: () => void; onRestart: () => void}) {
  const [selected, setSelected] = useState(choices[0]?.id || '');
  const [variant, setVariant] = useState(-1);
  const [ligatures, setLigatures] = useState(false);
  const all = [...choices, ...runners];
  const font = all.find(f => f.id === selected) || choices[0];
  const face = font?.variants[variant] || font;
  const loading = useFaces(face ? [face] : []);
  if (!font) return <section className="empty"><p className="eyebrow">NO FAVORITE YET</p><h1>Nothing felt right.</h1><p>No font gets called a winner after you reject it.</p><button className="primary" onClick={onBack}>Undo last comparison</button><button onClick={onRestart}>Try again</button></section>;
  return <section className="results"><div className="intro"><p className="eyebrow">{count} COMPARISONS · YOUR SHORTLIST</p><h1>{tied ? 'A few fonts feel right.' : 'Meet your new terminal font.'}</h1><p>{tied ? 'These favorites are tied. Pick one below to inspect it.' : 'The font you kept coming back to.'}</p></div><div className="result-layout"><div className="terminal"><div className="terminal-title"><span className="lights">● ● ●</span><span>{font.label}</span><span>REGULAR · 17 PX</span></div>{loading.ready ? <Specimen alias={loading.aliases[0]} palette={palette} ligatures={ligatures} /> : <div className="loading">{loading.error ? <button onClick={loading.retry}>Retry font download</button> : 'Loading the actual font…'}</div>}<div className="terminal-footer">{palette.name} <span>Same sample. Your chosen font.</span></div></div><aside className="details"><p className="eyebrow">{choices.some(f => f.id === font.id) ? tied ? 'JOINT FAVORITE' : 'YOUR PICK' : 'ALSO LIKED'}</p><h2>{font.label}</h2><p className="family">{face.family}</p>{font.variants.length > 0 && <label className="variant">Face <select aria-label="Font face" value={variant} onChange={e => {setVariant(Number(e.target.value)); setLigatures(false);}}><option value={-1}>Standard</option>{font.variants.map((v,i) => <option key={v.file} value={i}>{v.label}</option>)}</select></label>}<label className="ligatures"><input type="checkbox" checked={ligatures} disabled={variant >= 0} onChange={e => setLigatures(e.target.checked)} />Preview code ligatures</label><CopyBlock label="1. Install with Homebrew" value={font.brewCommand} /><CopyBlock label="2. Add to wezterm.lua" value={fontConfig(face.family, ligatures)} /><p className="help">Add these lines before <code>return config</code>, replacing existing font settings. Keep your chosen color scheme. The preview uses 17 CSS pixels, approximately 13 terminal points; check the final rendering in WezTerm.</p>{all.length > 1 && <div className="shortlist"><p className="eyebrow">{tied ? 'FAVORITES & ALTERNATIVES' : 'YOUR SHORTLIST'}</p>{all.map(f => <button className="font-option" aria-pressed={font.id === f.id} key={f.id} onClick={() => {setSelected(f.id); setVariant(-1);}}><span>{f.label}</span><span>{choices.includes(f) ? tied ? 'Joint favorite' : 'Your pick' : 'Also liked'}</span></button>)}</div>}<details><summary>Font source & licenses</summary><p>Homebrew Nerd Fonts {font.version}. Verified {checkedAt}.</p><a href={`https://formulae.brew.sh/cask/${font.cask}`} target="_blank" rel="noreferrer">Homebrew package ↗</a>{font.licenses.map(path => <a key={path} href={`${import.meta.env.BASE_URL}${path}`} target="_blank" rel="noreferrer">{path.split('/').pop()} ↗</a>)}<a href={`${import.meta.env.BASE_URL}licenses/NERD-FONTS-LICENSE.txt`} target="_blank" rel="noreferrer">Nerd Fonts attribution ↗</a></details><div className="result-actions"><button onClick={onBack}>← Back to comparisons</button><button onClick={onRestart}>Start fresh</button></div></aside></div></section>;
}
export function App() {
  const [session, setSession] = useState(initialSession);
  const [palette, setPalette] = useState(readPalette);
  useEffect(() => {
    const update = () => setPalette(readPalette());
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  const [early, setEarly] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const state = useMemo(() => derive(ids, session), [session]);
  const pairFonts = (state.pair || []).map(id => fonts.find(f => f.id === id)!);
  const loading = useFaces(pairFonts);
  const finished = state.done || early;
  useEffect(() => { try {localStorage.setItem(key, JSON.stringify(session)); setSaveError(false);} catch {setSaveError(true);} }, [session]);
  const undo = () => { if (early) {setEarly(false); return;} setSession(s => ({...s, events: s.events.slice(0, -1)})); };
  const vote = (value: Vote) => {
    if (!loading.ready || finished || !state.pair) return;
    const pair = state.pair;
    setSession(s => s.events.length === session.events.length ? {...s, events: [...s.events, {pair, vote: value}]} : s);
  };
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || (event.target instanceof Element && event.target.closest('input,textarea,select,[contenteditable="true"]'))) return;
      if (event.key.toLowerCase() === 'u' && session.events.length) {event.preventDefault(); undo(); return;}
      const choice = ({ArrowLeft:'left', ArrowRight:'right', ArrowUp:'both', ArrowDown:'neither'} as Record<string, Vote>)[event.key];
      if (choice && !finished) {event.preventDefault(); vote(choice);}
    };
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler);
  });
  const favorites = early ? [...new Set([...state.finalists, ...state.liked])] : state.finalists;
  const choices = favorites.map(id => fonts.find(f => f.id === id)!);
  const runners = state.runners.filter(id => !favorites.includes(id)).map(id => fonts.find(f => f.id === id)!);
  return <div className="app"><header><a className="brand" href={import.meta.env.BASE_URL}><span className="brand-icon">Aa</span><span>Terminal <b>Font Duel</b></span></a><span className="header-note">16 NERD FONTS <span className="dot">·</span> HOMEBREW READY</span></header>{finished ? <Result key={`${session.events.length}-${early}`} choices={choices} runners={runners} palette={palette} tied={choices.length > 1} count={session.events.length} onBack={undo} onRestart={() => {setSession(newSession()); setEarly(false);}} /> : <main><div className="intro-row"><div className="intro"><p className="eyebrow">LESS SEARCHING. MORE SEEING.</p><h1>Which one reads better?</h1><p>Same code. Same colors. Just trust your eyes.</p></div><div className="progress"><strong>{String(session.events.length).padStart(2,'0')}<span> / {LIMIT}</span></strong><span>comparisons · {state.seen} of 16 fonts seen</span><div className="progress-track"><i style={{width:`${session.events.length / LIMIT * 100}%`}} /></div></div></div><div className="comparison-meta"><span><span className="swatch" style={{background:palette.background}} />{palette.name}</span><span>Names hidden · Regular · 17 px · Ligatures off</span></div><div className="pair" aria-busy={!loading.ready}>{pairFonts.map((font,i) => <div className="terminal" key={`${i}-${font.id}`}><div className="terminal-title"><span className="lights">● ● ●</span><span>Font {i === 0 ? 'A' : 'B'}</span><kbd>{i === 0 ? '←' : '→'}</kbd></div>{loading.ready ? <Specimen alias={loading.aliases[i]} palette={palette} /> : <div className="loading">{loading.error ? 'Font could not load. No vote has been recorded.' : 'Loading the actual fonts…'}</div>}<button className="choose" disabled={!loading.ready} onClick={() => vote(i === 0 ? 'left' : 'right')}>{i === 0 ? '← Left' : 'Right →'}<span>This one reads better</span></button></div>)}</div><div className="controls"><button disabled={!loading.ready} onClick={() => vote('both')}><kbd>↑</kbd> Both good</button><button disabled={!loading.ready} onClick={() => vote('neither')}><kbd>↓</kbd> Neither</button><span className="control-divider" /><button disabled={!session.events.length} onClick={undo}><kbd>U</kbd> Undo</button><button className="review" disabled={!state.liked.length} onClick={() => setEarly(true)}>See favorites so far ↗</button></div>{loading.error && <div role="alert" className="error">A real font is required for each preview. <button onClick={loading.retry}>Retry loading</button></div>}<p className="bottom-note" role="status">{saveError ? 'Progress cannot be saved in this browser. Keep this tab open.' : 'Progress saved here automatically. No names, no setup, no wrong answer.'}</p></main>}<footer><span>Made for your everyday terminal.</span><a href="licenses/index.html" target="_blank" rel="noreferrer">Font credits & licenses ↗</a></footer></div>;
}
