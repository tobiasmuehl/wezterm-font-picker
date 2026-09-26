import { describe, it, expect } from 'vitest';
import { derive, restore, LIMIT, type Session, type Vote } from '../src/core/engine';
const ids = Array.from({length:16}, (_,i) => String(i));
const start = (seed = 42): Session => ({revision:'test', seed, events:[]});
const step = (s:Session, vote:Vote): Session => ({...s, events:[...s.events, {pair:derive(ids,s).pair!, vote}]});
describe('blind comparison', () => {
  it('shows every family in the first eight comparisons', () => {
    let s=start(); for(let i=0;i<8;i++) s=step(s,'left');
    expect(derive(ids,s).seen).toBe(16);
    expect(new Set(s.events.flatMap(e=>e.pair)).size).toBe(16);
  });
  it('finds a consistently preferred font in 15 comparisons across seeds', () => {
    for(let seed=0;seed<100;seed++) {
      let s=start(seed);
      while(!derive(ids,s).done) {
        const pair=derive(ids,s).pair!;
        s=step(s,Number(pair[0])<Number(pair[1])?'left':'right');
      }
      expect(s.events).toHaveLength(15);
      expect(derive(ids,s).finalists).toEqual(['0']);
    }
  });
  it('neither rejects all without fabricating a winner', () => {
    let s=start();for(let i=0;i<8;i++)s=step(s,'neither');
    expect(derive(ids,s)).toMatchObject({done:true,finalists:[],runners:[],seen:16});
  });
  it('both retains two finalists as joint favorites', () => {
    let s=start();for(let i=0;i<14;i++)s=step(s,'left');
    const pair=derive(ids,s).pair!;s=step(s,'both');
    expect(derive(ids,s)).toMatchObject({done:true,tied:true,finalists:pair});
  });
  it('caps all-tie sessions at 20, retaining all tied fonts', () => {
    let s=start();while(!derive(ids,s).done)s=step(s,'both');
    expect(s.events).toHaveLength(LIMIT);expect(derive(ids,s).finalists).toHaveLength(16);
  });
  it('undo restores the exact pair and preferences', () => {
    const s=step(step(start(),'both'),'neither');const before=derive(ids,s);
    const after=step(s,'left');after.events.pop();expect(derive(ids,after)).toEqual(before);
  });
  it('never suggests explicitly rejected fonts as runners up', () => {
    let s=start();for(let i=0;i<8;i++)s=step(s,'left');
    const rejected=derive(ids,s).pair!;s=step(s,'neither');
    for(const id of rejected)expect([...derive(ids,s).runners,...derive(ids,s).liked,...derive(ids,s).finalists]).not.toContain(id);
  });
  it('roundtrips sessions and rejects corrupt, stale, or post-result history', () => {
    const s=step(start(),'both');expect(restore(JSON.stringify(s),ids,'test')).toEqual(s);
    expect(restore(JSON.stringify(s),ids,'other')).toBeNull();
    expect(restore('{',ids,'test')).toBeNull();
    expect(restore(JSON.stringify({...s,events:[{pair:['0','1'],vote:'invalid'}]}),ids,'test')).toBeNull();
    let end=start();for(let i=0;i<8;i++)end=step(end,'neither');
    end.events.push({pair:['0','1'],vote:'both'});expect(restore(JSON.stringify(end),ids,'test')).toBeNull();
  });
});
