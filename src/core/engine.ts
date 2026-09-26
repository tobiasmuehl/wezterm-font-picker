export type Vote = 'left' | 'right' | 'both' | 'neither';
export type Event = { pair: [string, string]; vote: Vote };
export type Session = { revision: string; seed: number; events: Event[] };
export const LIMIT = 20;
export function shuffled(ids: string[], seed: number) {
  const result = [...ids];
  let state = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function derive(ids: string[], session: Session) {
  const waiting = shuffled(ids, session.seed);
  let active: string[] = [];
  const liked = new Map<string, number>();
  const rejected = new Set<string>();
  const encounters = new Map<string, number>();
  let tiedFinal = false;
  const pairKey = (a: string, b: string) => [a, b].sort().join('|');
  const nextPair = (): [string, string] | null => {
    if (waiting.length >= 2) return [waiting[0], waiting[1]];
    if (waiting.length === 1) { active.push(waiting.shift()!); }
    if (active.length < 2 || tiedFinal) return null;
    const first = active[0];
    const rest = active.slice(1).sort((a, b) => (encounters.get(pairKey(first, a)) || 0) - (encounters.get(pairKey(first, b)) || 0));
    return [first, rest[0]];
  };
  for (const event of session.events) {
    const expected = nextPair();
    if (!expected || expected.some((id, i) => id !== event.pair[i])) throw new Error('Invalid comparison history');
    const [a, b] = expected;
    const initial = waiting.length >= 2;
    if (initial) waiting.splice(0, 2);
    active = active.filter(id => id !== a && id !== b);
    const winners = event.vote === 'both' ? [a, b] : event.vote === 'left' ? [a] : event.vote === 'right' ? [b] : [];
    for (const id of winners) { active.push(id); liked.set(id, (liked.get(id) || 0) + 1); }
    if (event.vote === 'neither') { rejected.add(a); rejected.add(b); }
    encounters.set(pairKey(a, b), (encounters.get(pairKey(a, b)) || 0) + 1);
    if (!initial && event.vote === 'both' && active.length === 2) tiedFinal = true;
  }
  const candidatePair = nextPair();
  const done = session.events.length >= LIMIT || !candidatePair;
  const favorites = active.filter(id => liked.has(id));
  const runners = [...liked].filter(([id]) => !favorites.includes(id) && !rejected.has(id)).sort((a, b) => b[1] - a[1]).map(([id]) => id);
  return { pair: done ? null : candidatePair, done, finalists: favorites, runners: runners.slice(0, 2), liked: [...liked.keys()].filter(id => !rejected.has(id)), seen: new Set(session.events.flatMap(e => e.pair)).size, tied: favorites.length > 1 };
}
export function restore(raw: string | null, ids: string[], revision: string): Session | null {
  if (!raw || raw.length > 20000) return null;
  try {
    const s = JSON.parse(raw);
    if (s.revision !== revision || !Number.isSafeInteger(s.seed) || s.seed < 0 || s.seed > 0xffffffff || !Array.isArray(s.events) || s.events.length > LIMIT) return null;
    if (s.events.some((e: Event) => !e || !Array.isArray(e.pair) || e.pair.length !== 2 || e.pair.some(id => !ids.includes(id)) || !['left','right','both','neither'].includes(e.vote))) return null;
    // Check every prefix: no events may follow an already completed session.
    for (let i = 0; i < s.events.length; i++) if (derive(ids, {...s, events: s.events.slice(0, i)}).done) return null;
    derive(ids, s);
    return s;
  } catch { return null; }
}
