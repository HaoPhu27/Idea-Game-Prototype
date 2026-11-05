// Booster proof model: only accepts a candidate after finding an actual winning path.
// A search cutoff is inconclusive, never proof of solvability.
export function boosterSnapshot(engine) {
    const all = [...engine.boxes, ...engine.queue];
    const indices = new Map(all.map((b, i) => [String(b.id), i]));
    return {
        b: all.map(b => b.items.slice()),
        c: engine.columns.map(c => c.map(id => indices.get(String(id))).filter(i => i !== undefined)),
        q: engine.queue.map(b => indices.get(String(b.id))),
        t: engine.conveyor.allTrays.filter(t => !t.isFull()).map(t => t.targetItemId),
        rows: engine.visibleRows, cap: engine.maxQueueSize, active: engine.conveyor.maxActive,
        reference: (engine.boosterReferenceSolution || []).map(m => ({ f: indices.get(String(m.from)), t: indices.get(String(m.to)), it: m.itemId })),
    };
}

function boosterClone(s) { return { ...s, b: s.b.map(b => b && b.slice()), c: s.c.map(c => c.slice()), q: s.q.slice(), t: s.t.slice() }; }
function boosterWrapped(b) { return b && b.length === 3 && b.every(it => it === b[0]); }
function boosterNormalize(s) {
    // Free accepted wrapped boxes and reveal their column successors, as runtime does.
    let progress = true;
    while (progress) {
        progress = false;
        for (const col of s.c) {
            for (const id of col.slice(0, s.rows)) {
                if (!boosterWrapped(s.b[id])) continue;
                col.splice(col.indexOf(id), 1); s.q.push(id); progress = true;
            }
        }
        for (let qi = 0; qi < s.q.length;) {
            const id = s.q[qi];
            const ti = s.t.slice(0, s.active).indexOf(s.b[id][0]);
            if (ti < 0) { qi++; continue; }
            s.t.splice(ti, 1); s.b[id] = null; s.q.splice(qi, 1); progress = true;
        }
        if (s.q.length > s.cap) return false;
    }
    return true;
}
function boosterWon(s) { return !s.t.length && !s.q.length && s.b.every(b => !b || !b.length); }
function boosterMoves(s) {
    const ids = s.c.flatMap(c => c.slice(0, s.rows));
    const moves = [];
    for (const f of ids) {
        const src = s.b[f];
        if (!src || boosterWrapped(src)) continue;
        for (const it of new Set(src)) for (const t of ids) {
            const dst = s.b[t];
            if (t === f || !dst || dst.length >= 3 || boosterWrapped(dst)) continue;
            const same = dst.filter(x => x === it).length;
            const wanted = s.t.slice(0, s.active).includes(it);
            const score = same === 2 ? (wanted ? 1000 : 300 - s.q.length * 70)
                : dst.length === 2 ? -1000 : same === 1 ? (wanted ? 110 : 70) : -20 - dst.length * 5;
            moves.push({ f, t, it, score: score + (src.length === 1 ? (same === 2 ? 20 : -80) : 0) });
        }
    }
    return moves.sort((a, b) => b.score - a.score);
}
function boosterStep(s, m) {
    const n = boosterClone(s); n.b[m.f].splice(n.b[m.f].indexOf(m.it), 1); n.b[m.t].push(m.it);
    if (!n.b[m.f].length) {
        n.b[m.f] = null;
        for (const col of n.c) { const at = col.indexOf(m.f); if (at >= 0) col.splice(at, 1); }
    }
    return boosterNormalize(n) ? n : null;
}
function boosterKey(s) { return JSON.stringify([s.c.map(c => c.map(i => s.b[i].slice().sort())), s.q.map(i => s.b[i][0]).sort(), s.t]); }
export function boosterMatchingInvariant(s) {
    const counts = new Map();
    for (const b of s.b) for (const it of b || []) counts.set(it, (counts.get(it) || 0) + 1);
    for (const it of s.t) counts.set(it, (counts.get(it) || 0) - 3);
    return [...counts.values()].every(n => n === 0);
}
// Group one complete visible triple using only legal simulated moves. Moving
// contaminants first makes the plan reason about a whole set instead of cycling
// between locally attractive pairs. Every returned child carries a real path.
function boosterMacroChildren(s, deadline, maxPlans = 24) {
    const ids = s.c.flatMap(c => c.slice(0, s.rows));
    const counts = new Map();
    for (const id of ids) for (const it of s.b[id] || []) counts.set(it, (counts.get(it) || 0) + 1);
    const desired = s.t.slice(0, s.active);
    const plans = [];
    for (const [it, count] of counts) {
        if (count < 3) continue;
        for (const target of ids) {
            const b = s.b[target];
            if (!b || boosterWrapped(b) || !b.includes(it)) continue;
            const same = b.filter(x => x === it).length;
            plans.push({ it, target, score: (desired.includes(it) ? 1000 : 0) + same * 100 - b.length * 10 - s.q.length * (desired.includes(it) ? 0 : 80) });
        }
    }
    plans.sort((a, b) => b.score - a.score);
    const children = [];
    for (const plan of plans.slice(0, maxPlans)) {
        if (Date.now() >= deadline) break;
        // Different buffer choices preserve alternatives where a future reveal
        // depends on keeping a particular almost-empty box alive.
        for (let variant = 0; variant < 2; variant++) {
            let n = boosterClone(s), valid = true;
            const target = plan.target, it = plan.it;
            while (n.b[target] && n.b[target].some(x => x !== it)) {
                const bad = n.b[target].find(x => x !== it);
                const acc = n.c.flatMap(c => c.slice(0, n.rows));
                const buffers = acc.filter(i => i !== target && n.b[i] && n.b[i].length < 3 && !boosterWrapped(n.b[i]));
                buffers.sort((a, b) => {
                    const score = i => n.b[i].filter(x => x === bad).length * 20 + n.b[i].length * (variant ? -1 : 1) - (n.b[i].includes(it) ? 50 : 0);
                    return score(b) - score(a);
                });
                const buffer = buffers[0];
                if (buffer === undefined) { valid = false; break; }
                n = boosterStep(n, { f: target, t: buffer, it: bad });
                if (!n || !n.b[target]) { valid = false; break; }
            }
            if (!valid) continue;
            while (n.b[target] && n.b[target].length < 3) {
                const acc = n.c.flatMap(c => c.slice(0, n.rows));
                const sources = acc.filter(i => i !== target && n.b[i] && !boosterWrapped(n.b[i]) && n.b[i].includes(it));
                sources.sort((a, b) => variant ? n.b[a].length - n.b[b].length : n.b[b].length - n.b[a].length);
                if (!sources.length) { valid = false; break; }
                n = boosterStep(n, { f: sources[0], t: target, it });
                if (!n) { valid = false; break; }
            }
            if (valid && n && (!n.b[target] || boosterWrapped(n.b[target]))) children.push(n);
        }
    }
    return children;
}
function boosterMacroProof(initial, deadline) {
    for (let variant = 0; variant < 3 && Date.now() < deadline; variant++) {
        let state = initial;
        for (let depth = 0; depth <= initial.t.length && Date.now() < deadline; depth++) {
            const children = boosterMacroChildren(state, deadline, 3);
            if (!children.length) break;
            children.sort((a, b) => a.t.length - b.t.length || a.q.length - b.q.length);
            state = children[Math.min(variant % 2, children.length - 1)];
            if (boosterWon(state)) return true;
        }
    }
    let beam = [initial]; const seen = new Set([boosterKey(initial)]);
    const limit = initial.t.length + 1;
    for (let depth = 0; depth < limit && beam.length && Date.now() < deadline; depth++) {
        const next = [];
        for (const state of beam) {
            for (const child of boosterMacroChildren(state, deadline)) {
                if (boosterWon(child)) return true;
                const key = boosterKey(child); if (seen.has(key)) continue;
                seen.add(key); next.push(child);
            }
            if (Date.now() >= deadline) break;
        }
        // Prefer delivered orders, then exposed free capacity. Keep several
        // alternate completion sequences instead of assuming one greedy route.
        const score = st => st.t.length * 10000 + st.q.length * 100 + st.c.flatMap(c => c.slice(0, st.rows)).reduce((sum, id) => sum + st.b[id].length, 0);
        next.sort((a, b) => score(a) - score(b));
        beam = next.slice(0, 6);
    }
    return false;
}

export function boosterProveSolvable(snapshot, deadline = Date.now() + 120) {
    if (!boosterMatchingInvariant(snapshot)) return false;
    const initial = boosterClone(snapshot);
    if (!boosterNormalize(initial)) return false;
    if (boosterWon(initial)) return true;
    // The authored route is a useful execution order after a booster too, but
    // it is never trusted blindly: replay only moves legal in this exact state.
    let referenceState = boosterClone(initial);
    for (const m of initial.reference || []) {
        if (Date.now() >= deadline) return false;
        const visible = referenceState.c.flatMap(c => c.slice(0, referenceState.rows));
        const src = referenceState.b[m.f], dst = referenceState.b[m.t];
        if (!visible.includes(m.f) || !visible.includes(m.t) || !src || !dst || boosterWrapped(src) || boosterWrapped(dst) || dst.length >= 3 || !src.includes(m.it)) continue;
        const next = boosterStep(referenceState, m);
        if (!next) break;
        referenceState = next;
        if (boosterWon(referenceState)) return true;
    }
    if (referenceState.t.length < initial.t.length && boosterMacroProof(referenceState, Math.min(deadline, Date.now() + 30))) return true;
    // Reserve a bounded portion for set-level beam planning before the smaller
    // item-level fallback. Both prove by replay, rather than by a heuristic score.
    const macroDeadline = Math.min(deadline, Date.now() + Math.max(30, (deadline - Date.now()) * 0.65));
    if (boosterMacroProof(initial, macroDeadline)) return true;
    // Multiple deterministic constructive attempts are cheap on large levels.
    for (let variant = 0; variant < 8; variant++) {
        if (Date.now() >= deadline) return false;
        let s = boosterClone(initial); const seen = new Set();
        for (let step = 0; step < Math.max(60, s.b.length * 18); step++) {
            if (Date.now() >= deadline) return false;
            const key = boosterKey(s); if (seen.has(key)) break; seen.add(key);
            const moves = boosterMoves(s); if (!moves.length) break;
            let candidates = moves;
            if (variant) candidates = moves.slice().sort((a, b) =>
                (b.score + ((b.f * 31 + b.t * 17 + step * 13 + variant * 7) % (variant * 35))) -
                (a.score + ((a.f * 31 + a.t * 17 + step * 13 + variant * 7) % (variant * 35))));
            let next = null;
            for (const m of candidates) {
                const n = boosterStep(s, m);
                if (n && !seen.has(boosterKey(n))) { next = n; break; }
            }
            if (!next) break; s = next;
            if (boosterWon(s)) return true;
        }
    }
    if (initial.b.filter(Boolean).length > 16) return false;
    let budget = 6000; const seen = new Map();
    function search(s, depth) {
        if (boosterWon(s)) return true;
        if (budget <= 0 || depth > 100 || Date.now() >= deadline) return false;
        budget--;
        const key = boosterKey(s); if ((seen.get(key) ?? Infinity) <= depth) return false; seen.set(key, depth);
        for (const m of boosterMoves(s)) {
            if (budget <= 0 || Date.now() >= deadline) break;
            const n = boosterStep(s, m); if (n && search(n, depth + 1)) return true;
        }
        return false;
    }
    return search(initial, 0);
}
