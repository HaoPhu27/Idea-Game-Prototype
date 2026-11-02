/**
 * Offline order pacing inspired by pressure/release authoring in Fish Sort.
 * These blocks are authored against the reference completion sequence, not the
 * player's live progress. No orders or difficulty are changed during a game.
 */
export const ORDER_PACING_PROFILES = {
  normal: { name: 'flow', extras: [0, 1, 1, 1, 0] },
  hard: { name: 'wave', extras: [1, 2, 1, 2, 1] },
  superhard: { name: 'double', extras: [2, 3, 1, 3, 1] },
};

function pacingShuffle(values, rng) {
  const out = values.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * In a block of B orders with A active trays, at most B-A completions can wait
 * before one of the active requests is reached. The next completion adds one
 * transient queue entry. For Q >= 2 (the game uses Q=5), B <= A + Q - 2 reserves
 * at least one queue slot in the instant-delivery reference replay. This is not
 * a bound for every player path or physical OUT timing: outgoing full trays can
 * temporarily retain active positions, and the real engine waits for their exit.
 * Full replay remains the final check of the authored reference route.
 */
export function createOrderSchedule(referenceTypes, cfg, rng) {
  const total = referenceTypes.length;
  const active = Math.max(1, Math.floor(cfg.conveyorMaxActive || 1));
  const capacity = Math.max(1, Math.floor(cfg.queueCapacity || 5));
  const profile = cfg.trayJitter === false ? null : ORDER_PACING_PROFILES[cfg.tier];
  const trayTypes = [];
  const authoredBlocks = [];
  let guaranteedQueueUpperBound = total ? 1 : 0;

  for (let from = 0; from < total;) {
    const phase = Math.min(4, Math.floor(from / total * 5));
    const desiredExtra = profile ? profile.extras[phase] : 0;
    const extra = Math.min(desiredExtra, Math.max(0, capacity - 2));
    const size = Math.min(total - from, cfg.trayJitter === false ? 1 : active + extra);
    const values = referenceTypes.slice(from, from + size);
    let ordered;
    if (extra > 0 && size > active) {
      // Delay the earliest completion beyond the initially active prefix. The
      // remaining requests vary with the seed; repeated types can soften the
      // effective pressure, so consumers must inspect the replay measurements.
      ordered = pacingShuffle(values.slice(1), rng).concat(values[0]);
    } else {
      ordered = cfg.trayJitter === false ? values : pacingShuffle(values, rng);
    }
    const queueUpperBound = Math.max(1, size - active + 1);
    guaranteedQueueUpperBound = Math.max(guaranteedQueueUpperBound, queueUpperBound);
    authoredBlocks.push({
      from, to: from + size,
      fromProgress: from / total, toProgress: (from + size) / total,
      phase, desiredExtra, appliedExtra: extra,
      queueUpperBound,
    });
    trayTypes.push(...ordered);
    from += size;
  }
  return {
    trayTypes,
    profile: profile ? profile.name : 'legacy',
    authoredProgressBasis: 'reference-completions',
    authoredBlocks,
    guaranteedQueueUpperBound,
    authoringFallback: false,
  };
}
