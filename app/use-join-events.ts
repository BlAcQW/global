"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { JoinEvent, Slug } from "@/components/flag-globe/types";
import { order } from "@/components/flag-globe/data/countries";

const LIFE_MS = 3400; // keep an event "active" until its arc animation finishes
const FEED_MAX = 6;
const QUEUE_MAX = 24; // drop stale backlog so the sequence stays current
const SLUGS = new Set<string>(order as readonly string[]);

export interface FeedItem {
  id: string;
  country: Slug;
  name?: string;
}

export interface JoinState {
  active: JoinEvent[];
  feed: FeedItem[];
  total: number;
  countryCount: number;
  /** The attendee currently in the spotlight (globe turns to them). */
  featured: Slug | null;
}

export interface UseJoinOptions {
  hub: Slug;
  pool: Slug[] | "all";
  demo: boolean;
  base: number;
  reducedMotion: boolean;
}

interface Pending {
  id: string;
  country: Slug;
  name?: string;
}

/**
 * Drives the live-seminar layer. Incoming joins (demo loop + real /api/join) are
 * queued and revealed ONE AT A TIME by a steady sequencer, so the globe turns to
 * each attendee in turn — smooth and fast, none skipped. Exposes the active
 * events (for the globe), a short feed, running totals, and the featured country.
 */
export function useJoinEvents({
  hub,
  pool,
  demo,
  base,
  reducedMotion,
}: UseJoinOptions): JoinState {
  const [active, setActive] = useState<JoinEvent[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [total, setTotal] = useState(base);
  const [countryCount, setCountryCount] = useState(0);
  const [featured, setFeatured] = useState<Slug | null>(null);

  const queue = useRef<Pending[]>([]);
  const seen = useRef<Set<string>>(new Set());
  const countrySet = useRef<Set<Slug>>(new Set());

  useEffect(() => setTotal((t) => (t < base ? base : t)), [base]);

  const enqueue = useCallback((country: Slug, name?: string, id?: string) => {
    const eid = id ?? crypto.randomUUID();
    if (seen.current.has(eid)) return;
    seen.current.add(eid);
    queue.current.push({ id: eid, country, name });
    if (queue.current.length > QUEUE_MAX) {
      queue.current.splice(0, queue.current.length - QUEUE_MAX);
    }
  }, []);

  // Sequencer — reveal one queued attendee per step, in arrival order.
  useEffect(() => {
    const STEP = reducedMotion ? 2600 : 1500;
    let idle = 0;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      const next = queue.current.shift();
      if (next) {
        idle = 0;
        const ev: JoinEvent = {
          id: next.id,
          country: next.country,
          name: next.name,
          at: performance.now(),
        };
        setActive((a) => [...a, ev].slice(-14));
        setFeed((f) => [{ id: next.id, country: next.country, name: next.name }, ...f].slice(0, FEED_MAX));
        setTotal((t) => t + 1);
        if (!countrySet.current.has(next.country)) {
          countrySet.current.add(next.country);
          setCountryCount(countrySet.current.size);
        }
        if (!reducedMotion) setFeatured(next.country);
      } else {
        // Nothing waiting — after a couple of empty steps, ease back to the host.
        idle += 1;
        if (idle >= 3) setFeatured(null);
      }
      timer = setTimeout(step, STEP);
    };
    timer = setTimeout(step, 500);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  // Prune expired active events (their arcs have finished).
  useEffect(() => {
    const id = setInterval(() => {
      const now = performance.now();
      setActive((a) => {
        const next = a.filter((e) => now - e.at < LIFE_MS);
        return next.length === a.length ? a : next;
      });
    }, 400);
    return () => clearInterval(id);
  }, []);

  // Demo loop — a shuffled "bag" so every country in the pool appears once per
  // cycle before repeating. Feeds the queue; the sequencer paces the reveal.
  useEffect(() => {
    if (!demo) return;
    const poolArr = (pool === "all" ? [...order] : pool).filter((s) => s !== hub);
    if (poolArr.length === 0) return;
    let bag: Slug[] = [];
    const refill = () => {
      bag = [...poolArr];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
    };
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (bag.length === 0) refill();
      enqueue(bag.pop()!);
      const min = reducedMotion ? 2600 : 1400;
      const max = reducedMotion ? 4200 : 2200;
      timer = setTimeout(tick, min + Math.random() * (max - min));
    };
    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, [demo, pool, hub, reducedMotion, enqueue]);

  // Poll real joins from the API. First poll only syncs the cursor (no replay).
  useEffect(() => {
    let since = 0;
    let first = true;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const res = await fetch(`/api/join?since=${since}`, { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as {
            events: { id: string; country: string; name?: string }[];
            now: number;
          };
          since = data.now ?? since;
          if (!first) {
            for (const e of data.events) {
              if (SLUGS.has(e.country)) enqueue(e.country as Slug, e.name, e.id);
            }
          }
          first = false;
        }
      } catch {
        /* offline / transient — try again next tick */
      }
      if (!stopped) timer = setTimeout(poll, 2500);
    };
    timer = setTimeout(poll, 1200);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [enqueue]);

  return { active, feed, total, countryCount, featured };
}
