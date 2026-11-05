// ItemArt.js — vector illustration helper for the 32 catalog item ids.
// Renders a flat, outlined SVG (stroke #3b2a20, candy fills, white highlight)
// as a data:image/svg+xml CSS variable on elements marked .item-art.
// The emoji/text content stays intact as the accessible fallback.

const STROKE = '#3b2a20';
const STROKE_W = '2.2';
const VB = '0 0 40 40';

function svgWrap(inner) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB}" width="40" height="40" fill="none" stroke="${STROKE}" stroke-width="${STROKE_W}" stroke-linejoin="round" stroke-linecap="round">${inner}</svg>`;
}

// Shared primitives
function hl(cx, cy, r) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" stroke="none" opacity="0.85"/>`;
}
function fill(path, color) {
    return `<path d="${path}" fill="${color}"/>`;
}

const BUILDERS = {
    // ---- Stuffed animals ----
    bear: () => svgWrap(
        fill('M11 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10z', '#C98B5E') +
        fill('M29 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10z', '#C98B5E') +
        fill('M20 10c-6 0-10 4-10 9s4 9 10 9 10-4 10-9-4-9-10-9z', '#D69A6C') +
        `<circle cx="16" cy="17" r="1.4" fill="#3b2a20" stroke="none"/>` +
        `<circle cx="24" cy="17" r="1.4" fill="#3b2a20" stroke="none"/>` +
        fill('M17 22h6l-3 3z', '#3b2a20') +
        hl(16, 14.2, 1.3)
    ),
    duck: () => svgWrap(
        fill('M14 12a5 5 0 1 1 10 0 5 5 0 0 1-10 0z', '#F7C948') +
        fill('M10 20c0-4 5-7 10-7s10 3 10 7-5 7-10 7-10-3-10-7z', '#FFD84D') +
        fill('M29 19l6 2-6 2z', '#F2A03D') +
        `<circle cx="18" cy="17" r="1.3" fill="#3b2a20" stroke="none"/>` +
        hl(16, 14, 1.4)
    ),
    bunny: () => svgWrap(
        fill('M14 5a3 8 0 0 1 4 0 3 8 0 0 1-4 0z', '#F5E1E9') +
        fill('M22 5a3 8 0 0 0 4 0 3 8 0 0 0-4 0z', '#F5E1E9') +
        fill('M20 12c-6 0-10 5-10 10s4 9 10 9 10-4 10-9-4-10-10-10z', '#FBE9F0') +
        `<circle cx="16" cy="21" r="1.4" fill="#3b2a20" stroke="none"/>` +
        `<circle cx="24" cy="21" r="1.4" fill="#3b2a20" stroke="none"/>` +
        `<circle cx="20" cy="25" r="1.2" fill="#F26D8C" stroke="none"/>` +
        hl(15, 17, 1.4)
    ),
    penguin: () => svgWrap(
        fill('M20 6c-6 0-10 5-10 12s4 15 10 15 10-8 10-15-4-12-10-12z', '#2E3A4F') +
        fill('M20 11c-4 0-6 4-6 9s2 9 6 9 6-4 6-9-2-9-6-9z', '#F7F3EE') +
        `<circle cx="18" cy="16" r="1.2" fill="#3b2a20" stroke="none"/>` +
        `<circle cx="22" cy="16" r="1.2" fill="#3b2a20" stroke="none"/>` +
        fill('M19 20h2l-1 2z', '#F2A03D') +
        hl(16, 13, 1.2)
    ),

    // ---- Food ----
    apple: () => svgWrap(
        fill('M20 12c-7 0-11 5-11 11s5 10 11 10 11-4 11-10-4-11-11-11z', '#E8453C') +
        fill('M18 8c0-3 2-5 4-5-1 2-1 4-1 6z', '#3FBF6F') +
        fill('M20 6c1 1 3 1 4 0 0 2-1 3-2 3s-2-1-2-3z', '#3FBF6F') +
        hl(15, 18, 2.2)
    ),
    pizza: () => svgWrap(
        fill('M20 8L34 32H6z', '#F2B04C') +
        fill('M20 13l8 15H12z', '#E8453C') +
        `<circle cx="20" cy="22" r="1.8" fill="#F7E7C1" stroke="none"/>` +
        `<circle cx="16" cy="26" r="1.6" fill="#F7E7C1" stroke="none"/>` +
        `<circle cx="24" cy="26" r="1.6" fill="#F7E7C1" stroke="none"/>` +
        hl(18, 18, 1.3)
    ),
    donut: () => svgWrap(
        fill('M20 8a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm0 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12z', '#E8A98B') +
        fill('M20 9.5a10.5 10.5 0 0 0-4 20.2l1-2.3A8 8 0 0 1 20 12z', '#F26D8C') +
        fill('M20 9.5a10.5 10.5 0 0 1 4 20.2l-1-2.3A8 8 0 0 0 20 12z', '#F26D8C') +
        `<path d="M14 15l2-1 1 2-2 1z" fill="#4FA8F5" stroke="none"/>` +
        `<path d="M25 24l2-1 1 2-2 1z" fill="#3FBF6F" stroke="none"/>` +
        hl(15, 13, 1.2)
    ),
    burger: () => svgWrap(
        fill('M8 14c0-6 5-8 12-8s12 2 12 8z', '#E8A15C') +
        fill('M7 17h26v3H7z', '#3FBF6F') +
        fill('M7 20h26v4H7z', '#8B4B2E') +
        fill('M7 24h26v3H7z', '#F2B04C') +
        fill('M7 27h26c0 3-2 5-5 5H12c-3 0-5-2-5-5z', '#E8A15C') +
        hl(13, 12, 1.3)
    ),

    // ---- Stationery ----
    pencil: () => svgWrap(
        fill('M8 30l3-10 18-18 7 7-18 18z', '#F2B04C') +
        fill('M29 2l7 7-3 3-7-7z', '#E87B8A') +
        fill('M8 30l2-6 4 4z', '#3b2a20') +
        `<line x1="12" y1="26" x2="26" y2="12" stroke="#8B4B2E" stroke-width="1"/>` +
        hl(11, 27, 1)
    ),
    paperclip: () => svgWrap(
        `<path d="M14 9v18a6 6 0 0 0 12 0V11a4 4 0 0 0-8 0v16" fill="none" stroke="#3b2a20" stroke-width="2.6"/>` +
        `<path d="M14 9v18a6 6 0 0 0 12 0V11a4 4 0 0 0-8 0v16" fill="none" stroke="#C8CCD4" stroke-width="2"/>` +
        hl(15, 12, 1.2)
    ),
    scissors: () => svgWrap(
        `<line x1="10" y1="8" x2="30" y2="30" stroke="#B7BEC9" stroke-width="3"/>` +
        `<line x1="30" y1="8" x2="10" y2="30" stroke="#B7BEC9" stroke-width="3"/>` +
        `<circle cx="10" cy="32" r="3" fill="#E8453C"/>` +
        `<circle cx="30" cy="32" r="3" fill="#E8453C"/>` +
        hl(13, 11, 1.1)
    ),
    ruler: () => svgWrap(
        fill('M6 14h28v12H6z', '#F2E3A1') +
        `<line x1="11" y1="14" x2="11" y2="19" stroke="#8B7A3E"/>` +
        `<line x1="16" y1="14" x2="16" y2="21" stroke="#8B7A3E"/>` +
        `<line x1="21" y1="14" x2="21" y2="19" stroke="#8B7A3E"/>` +
        `<line x1="26" y1="14" x2="26" y2="21" stroke="#8B7A3E"/>` +
        hl(9, 16, 1.1)
    ),

    // ---- Sports ----
    soccer: () => svgWrap(
        `<circle cx="20" cy="20" r="13" fill="#F7F3EE"/>` +
        fill('M20 15l4 3-1.5 5h-5L16 18z', '#2E3A4F') +
        fill('M20 7v4l3 2 -3 2 -3-2 3-2z', '#2E3A4F') +
        fill('M8 17l3-2 3 2 -1 4 -3 1z', '#2E3A4F') +
        fill('M32 17l-3-2 -3 2 1 4 3 1z', '#2E3A4F') +
        hl(15, 14, 1.4)
    ),
    basketball: () => svgWrap(
        `<circle cx="20" cy="20" r="13" fill="#E8803D"/>` +
        `<path d="M20 7v26M7 20h26" stroke="#3b2a20" stroke-width="2"/>` +
        `<path d="M11 11a16 16 0 0 1 18 0M11 29a16 16 0 0 0 18 0" fill="none"/>` +
        hl(15, 14, 1.6)
    ),
    tennis: () => svgWrap(
        `<circle cx="20" cy="20" r="13" fill="#D7F24E"/>` +
        `<path d="M11 12c6 4 12 4 18 0M11 28c6-4 12-4 18 0" fill="none"/>` +
        hl(15, 14, 1.6)
    ),
    volleyball: () => svgWrap(
        `<circle cx="20" cy="20" r="13" fill="#F7F3EE"/>` +
        `<path d="M20 7c-4 8-4 18 0 26" fill="none"/>` +
        `<path d="M7 20c8-4 18-4 26 0" fill="none"/>` +
        `<path d="M11 11c3 6 9 12 18 14" fill="none"/>` +
        hl(15, 14, 1.4)
    ),

    // ---- Tools ----
    hammer: () => svgWrap(
        fill('M8 12h20v4H8z', '#B7BEC9') +
        fill('M22 12l6-2 4 4 -4 4 -6-2z', '#8891A0') +
        fill('M17 16h4v20h-4z', '#8B4B2E') +
        hl(11, 13.5, 1.2)
    ),
    wrench: () => svgWrap(
        `<path d="M30 8a7 7 0 0 0-9 9L9 29l3 3 12-12a7 7 0 0 0 9-9l-4 4-3-3z" fill="#B7BEC9"/>` +
        `<circle cx="10.5" cy="30.5" r="2.5" fill="#8891A0"/>` +
        hl(28, 11, 1.3)
    ),
    nut_and_bolt: () => svgWrap(
        fill('M10 15l6-3 6 3v8l-6 3-6-3z', '#B7BEC9') +
        `<circle cx="16" cy="19" r="2.2" fill="#2E3A4F" stroke="none"/>` +
        fill('M22 17h10v4H22z', '#8891A0') +
        fill('M32 17l4-2 4 2v4l-4 2-4-2z', '#8891A0') +
        hl(12, 16, 1.2)
    ),
    gear: () => svgWrap(
        `<path d="M20 8l2 3 4-1 1 4 4 1-1 4 3 2-3 2 1 4-4 1-1 4-4-1-2 3-2-3-4 1-1-4-4-1 1-4-3-2 3-2-1-4 4-1 1-4 4 1z" fill="#B7BEC9"/>` +
        `<circle cx="20" cy="20" r="4" fill="#2E3A4F" stroke="none"/>` +
        hl(16, 16, 1.4)
    ),

    // ---- Music ----
    guitar: () => svgWrap(
        fill('M13 21a7 7 0 1 0 14 0 7 7 0 0 0-14 0z', '#E8803D') +
        fill('M20 16l-2-10h4z', '#8B4B2E') +
        fill('M19 16l-2-6 3-1 3 1-1 6z', '#8B4B2E') +
        `<line x1="20" y1="14" x2="20" y2="26" stroke="#3b2a20" stroke-width="1.2"/>` +
        `<circle cx="20" cy="23" r="2" fill="#3b2a20" stroke="none"/>` +
        hl(15, 19, 1.5)
    ),
    trumpet: () => svgWrap(
        fill('M8 18h14v4H8z', '#F2B04C') +
        fill('M22 16l10-4v16l-10-4z', '#E8A132') +
        fill('M6 17l3-1 0 8 -3-1z', '#B7BEC9') +
        fill('M10 16l2-4 4 0 -2 4z', '#F2B04C') +
        hl(12, 19, 1.2)
    ),
    drum: () => svgWrap(
        `<ellipse cx="20" cy="15" rx="12" ry="4" fill="#F7F3EE"/>` +
        fill('M8 15v12c0 2 5 4 12 4s12-2 12-4V15c0 2-5 4-12 4s-12-2-12-4z', '#E8453C') +
        `<line x1="8" y1="15" x2="8" y2="27" stroke="#3b2a20"/>` +
        `<line x1="32" y1="15" x2="32" y2="27" stroke="#3b2a20"/>` +
        `<line x1="14" y1="15" x2="14" y2="30" stroke="#3b2a20"/>` +
        `<line x1="26" y1="15" x2="26" y2="30" stroke="#3b2a20"/>` +
        hl(14, 14, 1.4)
    ),
    piano: () => svgWrap(
        fill('M6 14h28v14H6z', '#2E3A4F') +
        fill('M7 15h6v12H7z', '#F7F3EE') +
        fill('M14 15h5v12h-5z', '#F7F3EE') +
        fill('M20 15h5v12h-5z', '#F7F3EE') +
        fill('M26 15h7v12h-7z', '#F7F3EE') +
        fill('M11 15h2v7h-2z', '#2E3A4F') +
        fill('M16 15h2v7h-2z', '#2E3A4F') +
        fill('M24 15h2v7h-2z', '#2E3A4F') +
        hl(9, 17, 1)
    ),

    // ---- Kitchen ----
    pan: () => svgWrap(
        fill('M8 18h20v6a6 6 0 0 1-6 6h-8a6 6 0 0 1-6-6z', '#2E3A4F') +
        fill('M6 18h24v3H6z', '#B7BEC9') +
        fill('M28 18l10-3v4l-10 3z', '#8891A0') +
        fill('M11 20h14v4H11z', '#F2B04C') +
        hl(13, 20, 1.4)
    ),
    cutlery: () => svgWrap(
        fill('M12 8h2v22h-2z', '#B7BEC9') +
        `<circle cx="13" cy="9" r="3" fill="#8891A0"/>` +
        fill('M26 8h2v10l-2 1z', '#B7BEC9') +
        fill('M24 8h2v10l-2 1z', '#8891A0') +
        fill('M28 19h1v11h-1z', '#B7BEC9') +
        hl(13, 13, 1)
    ),
    cup: () => svgWrap(
        fill('M10 12h18v18a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3z', '#F7F3EE') +
        fill('M28 16h4a3 3 0 0 1 0 6h-4z', '#F7F3EE') +
        fill('M12 15h14v4H12z', '#8B4B2E') +
        `<path d="M16 8c0-2 2-3 4-3s4 1 4 3" fill="none"/>` +
        hl(14, 20, 1.3)
    ),
    knife: () => svgWrap(
        fill('M12 30l14-22 4 3-12 21z', '#B7BEC9') +
        fill('M12 12l2 2 3-3-2-2z', '#F2B04C') +
        fill('M14 32l6-2 2-4-8 1z', '#8B4B2E') +
        hl(20, 15, 1.2)
    ),

    // ---- Garden ----
    cactus: () => svgWrap(
        fill('M17 8h6v22h-6z', '#3FBF6F') +
        fill('M10 14h5v10h-5z', '#3FBF6F') +
        fill('M10 14h7v3h-7z', '#3FBF6F') +
        fill('M25 18h5v10h-5z', '#3FBF6F') +
        fill('M23 18h7v3h-7z', '#3FBF6F') +
        fill('M14 30h12v4H14z', '#8B4B2E') +
        hl(19, 12, 1.1)
    ),
    sunflower: () => svgWrap(
        `<circle cx="20" cy="16" r="6" fill="#8B4B2E"/>` +
        fill('M20 7l2 4-2 1-2-1z', '#F2B04C') +
        fill('M20 25l2-4-2-1-2 1z', '#F2B04C') +
        fill('M11 16l4 2 1-2-1-2z', '#F2B04C') +
        fill('M29 16l-4 2-1-2 1-2z', '#F2B04C') +
        fill('M20 22v14', '#3FBF6F') +
        `<path d="M20 22v14" stroke="#3FBF6F" stroke-width="2.4"/>` +
        fill('M14 26l6-2v3l-6 2z', '#3FBF6F') +
        hl(18, 14, 1.2)
    ),
    mushroom: () => svgWrap(
        fill('M20 8c-8 0-13 6-13 11h26c0-5-5-11-13-11z', '#E8453C') +
        `<circle cx="14" cy="14" r="2" fill="#F7F3EE" stroke="none"/>` +
        `<circle cx="24" cy="13" r="1.6" fill="#F7F3EE" stroke="none"/>` +
        `<circle cx="27" cy="16" r="1.2" fill="#F7F3EE" stroke="none"/>` +
        fill('M15 19h10v11a5 5 0 0 1-10 0z', '#F7F3EE') +
        hl(13, 12, 1.4)
    ),
    pine: () => svgWrap(
        fill('M20 6l8 12h-4l6 9h-8v5h-4v-5h-8l6-9h-4z', '#2FA35A') +
        fill('M19 32h2v4h-2z', '#8B4B2E') +
        hl(17, 13, 1.1)
    ),
};

function encodeSvg(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const URI_CACHE = new Map();

// Returns the data:image/svg+xml URL for a known item id, else null.
export function getItemArtDataUri(itemId) {
    if (!itemId || !Object.prototype.hasOwnProperty.call(BUILDERS, itemId)) return null;
    if (!URI_CACHE.has(itemId)) URI_CACHE.set(itemId, encodeSvg(BUILDERS[itemId]()));
    return URI_CACHE.get(itemId);
}

// Applies the vector illustration to an element while keeping the text
// (emoji/label) as the accessible fallback. Unknown/null clears stale art
// so reused DOM slots never inherit a previous identity's drawing.
export function applyItemArt(element, itemId) {
    if (!element || !element.style || !element.classList) return;
    if (typeof element.style.setProperty !== 'function' ||
        typeof element.style.removeProperty !== 'function' ||
        typeof element.classList.add !== 'function' ||
        typeof element.classList.remove !== 'function') {
        return;
    }
    const uri = getItemArtDataUri(itemId);
    if (uri) {
        element.classList.add('item-art');
        element.style.setProperty('--item-art', `url("${uri}")`);
    } else {
        element.classList.remove('item-art');
        element.style.removeProperty('--item-art');
    }
}
