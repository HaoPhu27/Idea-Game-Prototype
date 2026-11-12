// GripperRenderer.js — vẽ cặp máy gắp hai ngón treo trên băng tải IN (bên phải)
// và OUT (bên trái). Module CHỈ vẽ theo tâm khay do game truyền vào; mọi chuyển
// động thật của khay do control chính lo. Không timer, không API ảnh, chỉ SVG.

const SVGNS = 'http://www.w3.org/2000/svg';

const STEEL_TOP = '#dfe5ee';
const STEEL_MID = '#a9b2c0';
const STEEL_LOW = '#7c8593';
const STEEL_EDGE = '#5a6270';
const HONEY = '#f0b429';
// Màu theme đi qua class CSS (var() không đáng tin trong presentation attribute);
// attribute cùng tên giữ vai trò fallback khi thiếu biến.
const INK = '#2f3440';
const ACCENT = '#ff6fa5';
const ACCENT_SOFT = '#68e0c0';
const CLS_ACCENT = 'g-accent';
const CLS_ACCENT_SOFT = 'g-accent2';

const DEFAULT_W = 74;
const DEFAULT_H = 62;

function el(name, attrs) {
    const node = document.createElementNS(SVGNS, name);
    if (attrs) {
        for (const key in attrs) {
            const value = attrs[key];
            if (value !== undefined && value !== null) node.setAttribute(key, value);
        }
    }
    return node;
}

function num(value, fallback) {
    return typeof value === 'number' && isFinite(value) ? value : fallback;
}

function clamp01(value) {
    return Math.min(1, Math.max(0, value));
}

function smooth(value) {
    const t = clamp01(value);
    return t * t * (3 - 2 * t);
}

// Trả về trạng thái ngón theo tiến trình gắp của từng phía.
// IN : giữ hàng 0 → .65, mở .65 → .85, rút lên .85 → 1.
// OUT: mở sẵn 0 → .15, kẹp .15 → .3, giữ tới .85, nhả cuối .85 → 1.
function jawState(side, progress) {
    const p = clamp01(progress);
    if (side === 'in') {
        if (p < 0.65) return { open: 0, lift: 0, contact: 1, ring: 0 };
        // Vòng đáp chỉ nhấp nháy trong khoảng .65 → .9 (biên độ theo hàm sin).
        const ringPhase = clamp01((p - 0.65) / 0.25);
        const ring = Math.abs(Math.sin(ringPhase * Math.PI * 2));
        if (p < 0.85) return { open: smooth((p - 0.65) / 0.2), lift: 0, contact: 0, ring };
        return { open: 1, lift: smooth((p - 0.85) / 0.15) * 15, contact: 0, ring };
    }
    if (p < 0.15) return { open: 1, lift: 0, contact: 0, ring: 0 };
    if (p < 0.3) return { open: 1 - smooth((p - 0.15) / 0.15), lift: 0, contact: 1, ring: 0 };
    if (p < 0.85) return { open: 0, lift: 0, contact: 1, ring: 0 };
    return { open: smooth((p - 0.85) / 0.15), lift: 0, contact: 0, ring: 0 };
}

export class GripperRenderer {
    constructor(container) {
        this.container = container || null;
        this.root = null;
        this._uid = 'grp' + Math.random().toString(36).slice(2, 8);
        this._seq = 0;
    }

    // Vẽ lại toàn bộ; root SVG được tái sử dụng (tránh mất root khi container
    // bị reset innerHTML).
    render(jobs) {
        const root = this._ensureRoot();
        if (!root) return;

        const view = this._measure();
        const list = Array.isArray(jobs) ? jobs : [];
        const bySide = { in: null, out: null };
        for (let i = 0; i < list.length; i++) {
            const job = list[i];
            if (!job) continue;
            const side = job.side === 'out' ? 'out' : 'in';
            if (!bySide[side]) bySide[side] = job;
        }

        this._seq += 1;
        const suffix = this._uid + '-' + this._seq;
        const nodes = [this._defs(suffix)];

        // OUT vẽ trước để máy IN (bên phải) luôn nằm trên khi chồng nhau.
        nodes.push(this._machine('out', bySide.out, view, suffix));
        nodes.push(this._machine('in', bySide.in, view, suffix));

        while (root.firstChild) root.removeChild(root.firstChild);
        for (let i = 0; i < nodes.length; i++) root.appendChild(nodes[i]);
    }

    // Gỡ root an toàn, không đụng tới phần còn lại của container.
    reset() {
        const owned = (node) => node && node.getAttribute && node.getAttribute('data-gripper-root') === this._uid;
        const root = this.root;
        if (root && owned(root) && root.parentNode) root.parentNode.removeChild(root);
        this.root = null;
        const host = this.container;
        if (host && host.querySelectorAll) {
            const stale = host.querySelectorAll('.gripper-overlay');
            for (let i = 0; i < stale.length; i++) {
                const node = stale[i];
                if (owned(node) && node.parentNode) node.parentNode.removeChild(node);
            }
        }
    }

    _measure() {
        const host = this.container;
        let width = 0;
        let height = 0;
        if (host) {
            width = host.clientWidth || 0;
            height = host.clientHeight || 0;
            if ((!width || !height) && host.getBoundingClientRect) {
                const rect = host.getBoundingClientRect();
                width = width || rect.width || 0;
                height = height || rect.height || 0;
            }
        }
        return {
            width: width || 360,
            height: height || 640,
        };
    }

    _ensureRoot() {
        const host = this.container;
        if (!host) return null;

        let root = this.root;
        if (root && root.parentNode === host) return root;

        // Root absolute cần host làm gốc toạ độ; chỉ đụng tới position khi host
        // còn static để không phá layout sẵn có.
        this._ensurePositioned(host);

        // Container có thể đã bị reset innerHTML → root cũ mất cha, thử nhặt lại
        // một overlay còn sót rồi mới tạo mới; root thật sự mồ côi bị bỏ đi.
        const found = host.querySelector ? host.querySelector('.gripper-overlay') : null;
        root = found || document.createElementNS(SVGNS, 'svg');
        root.setAttribute('class', 'gripper-overlay');
        root.setAttribute('data-gripper-root', this._uid);
        root.setAttribute('aria-hidden', 'true');
        root.setAttribute('focusable', 'false');
        root.removeAttribute('viewBox');
        const style = root.style;
        style.position = 'absolute';
        style.inset = '0';
        style.left = '0';
        style.top = '0';
        style.width = '100%';
        style.height = '100%';
        style.overflow = 'visible';
        style.pointerEvents = 'none';
        style.zIndex = '9';

        host.appendChild(root);
        this.root = root;
        return root;
    }

    _ensurePositioned(host) {
        try {
            if (typeof window === 'undefined' || !window.getComputedStyle) return;
            const computed = window.getComputedStyle(host);
            if (computed && computed.position === 'static') host.style.position = 'relative';
        } catch (e) {
            // Không đo được thì thôi, overlay vẫn vẽ theo host.
        }
    }

    _defs(suffix) {
        const defs = el('defs');

        // Đèn nhỏ lấy màu accent của theme; attribute fill giữ fallback.
        const style = el('style');
        style.textContent =
            '.gripper-overlay .g-accent{fill:var(--theme-accent,' + ACCENT + ')}' +
            '.gripper-overlay .g-accent2{fill:var(--theme-accent-2,' + ACCENT_SOFT + ')}' +
            '.gripper-overlay .g-accent-ring{stroke:var(--theme-accent,' + ACCENT + ')}';
        defs.appendChild(style);

        const steel = el('linearGradient', {
            id: 'steel-' + suffix,
            x1: '0', y1: '0', x2: '0', y2: '1',
        });
        steel.appendChild(el('stop', { offset: '0', 'stop-color': STEEL_TOP }));
        steel.appendChild(el('stop', { offset: '0.55', 'stop-color': STEEL_MID }));
        steel.appendChild(el('stop', { offset: '1', 'stop-color': STEEL_LOW }));
        defs.appendChild(steel);

        const dark = el('linearGradient', {
            id: 'dark-' + suffix,
            x1: '0', y1: '0', x2: '1', y2: '0',
        });
        dark.appendChild(el('stop', { offset: '0', 'stop-color': STEEL_EDGE }));
        dark.appendChild(el('stop', { offset: '0.5', 'stop-color': STEEL_MID }));
        dark.appendChild(el('stop', { offset: '1', 'stop-color': STEEL_EDGE }));
        defs.appendChild(dark);

        return defs;
    }

    _machine(side, job, view, suffix) {
        const isOut = side === 'out';
        const active = !!job;

        const bw = Math.max(28, num(job && job.w, DEFAULT_W));
        const bh = Math.max(28, num(job && job.h, DEFAULT_H));
        const headW = Math.min(132, Math.max(56, bw + 28));
        const half = headW / 2;
        const jaws = active
            ? jawState(side, num(job && job.progress, 0))
            : { open: 0, lift: 0, contact: 0, ring: 0 };

        // IN đứng sát mép phải, OUT sát mép trái; đều thấp gần đáy container.
        // Nắn vào trong vừa đủ để đầu máy không tràn khỏi khung.
        const edgeX = isOut ? 24 : view.width - 24;
        const idleX = Math.max(half + 6, Math.min(view.width - half - 6, edgeX));
        const idleY = Math.max(66 + bh / 2, view.height - 64);

        const cx = num(job && job.x, idleX);
        const cy = num(job && job.y, idleY);

        const group = el('g', {
            'data-gripper': side,
            opacity: active ? 1 : 0.94,
        });

        // Vòng đáp nhẹ khi máy IN nhả hàng (opacity theo sin, không dùng timer).
        if (jaws.ring > 0.001) {
            group.appendChild(el('ellipse', {
                cx: cx, cy: cy,
                rx: bw / 2 + 15,
                ry: bh * 0.62,
                fill: 'none',
                stroke: ACCENT,
                class: 'g-accent-ring',
                'stroke-width': 2,
                'stroke-dasharray': '6 7',
                'stroke-linecap': 'round',
                opacity: (0.12 + 0.55 * jaws.ring).toFixed(3),
            }));
        }

        const headH = 15;
        // Đầu máy luôn nằm trên đỉnh carton, không bao giờ trùm lên hàng.
        const headBottom = Math.max(headH + 24, cy - bh / 2 - 16 - jaws.lift);
        const headTop = headBottom - headH;
        const stemTop = Math.max(2, headTop - 26);

        // Cột trượt lồng nhau (ống lồng trên ống mảnh) + vai treo có bu lông.
        const stemH = Math.max(4, headTop - stemTop);
        group.appendChild(el('rect', {
            x: cx - 2.5, y: stemTop + 10, width: 5, height: stemH,
            rx: 2.5, fill: STEEL_MID, stroke: INK, 'stroke-width': 1.4,
        }));
        group.appendChild(el('rect', {
            x: cx - 7, y: stemTop + 8, width: 14, height: Math.max(6, stemH * 0.55),
            rx: 4, fill: 'url(#steel-' + suffix + ')', stroke: INK, 'stroke-width': 1.6,
        }));
        group.appendChild(el('rect', {
            x: cx - 19, y: stemTop, width: 38, height: 10,
            rx: 5, fill: 'url(#steel-' + suffix + ')', stroke: INK, 'stroke-width': 1.6,
        }));
        group.appendChild(el('circle', { cx: cx - 13, cy: stemTop + 5, r: 1.8, fill: INK, opacity: 0.45 }));
        group.appendChild(el('circle', { cx: cx + 13, cy: stemTop + 5, r: 1.8, fill: INK, opacity: 0.45 }));

        // Đầu máy: thanh gắp ngang, có đèn accent nhỏ và highlight mềm.
        group.appendChild(el('rect', {
            x: cx - half, y: headTop, width: headW, height: headH,
            rx: 6, fill: 'url(#steel-' + suffix + ')', stroke: INK, 'stroke-width': 1.8,
        }));
        group.appendChild(el('rect', {
            x: cx - half + 5, y: headTop + 3, width: Math.max(4, headW - 10), height: 3.6,
            rx: 1.8, fill: '#ffffff', opacity: 0.55,
        }));
        group.appendChild(el('circle', { cx: cx, cy: headTop + headH / 2, r: 5, fill: ACCENT, class: CLS_ACCENT, opacity: 0.28 }));
        group.appendChild(el('circle', { cx: cx, cy: headTop + headH / 2, r: 2.6, fill: ACCENT, class: CLS_ACCENT, stroke: INK, 'stroke-width': 0.9 }));
        group.appendChild(el('circle', { cx: cx - half + 8, cy: headTop + headH / 2, r: 2, fill: ACCENT_SOFT, class: CLS_ACCENT_SOFT, stroke: INK, 'stroke-width': 0.8 }));
        group.appendChild(el('circle', { cx: cx + half - 8, cy: headTop + headH / 2, r: 2, fill: ACCENT_SOFT, class: CLS_ACCENT_SOFT, stroke: INK, 'stroke-width': 0.8 }));

        // Ray trượt dưới đầu máy.
        const railHalf = Math.max(half - 6, bw / 2 + 12);
        group.appendChild(el('rect', {
            x: cx - railHalf, y: headBottom - 2.5, width: railHalf * 2, height: 5,
            rx: 2.5, fill: 'url(#dark-' + suffix + ')', stroke: INK, 'stroke-width': 1.2,
        }));

        // Hai ngón kẹp hai bên khay (đệm sát hông, không trùm nội dung khay).
        const fingerLen = Math.max(18, (cy + bh * 0.18) - headBottom);
        const fingerBottom = headBottom + fingerLen;
        for (let i = 0; i < 2; i++) {
            const dir = i === 0 ? -1 : 1;
            const fx = cx + dir * (bw / 2 + 5 + jaws.open * 8);

            group.appendChild(el('rect', {
                x: fx - 7, y: headBottom - 4, width: 14, height: 8,
                rx: 3, fill: STEEL_EDGE, stroke: INK, 'stroke-width': 1.3,
            }));
            group.appendChild(el('rect', {
                x: fx - 3.5, y: headBottom - 3, width: 7, height: fingerLen,
                rx: 3.5, fill: 'url(#dark-' + suffix + ')', stroke: INK, 'stroke-width': 1.5,
            }));
            group.appendChild(el('rect', {
                x: fx - 1.8, y: headBottom + 3, width: 2, height: Math.max(4, fingerLen - 12),
                rx: 1, fill: '#ffffff', opacity: 0.4,
            }));
            // Đệm kẹp sát hông khay + chấm tiếp xúc màu mật ong.
            group.appendChild(el('rect', {
                x: fx - 4.5, y: fingerBottom - 12, width: 9, height: 12,
                rx: 3, fill: STEEL_TOP, stroke: INK, 'stroke-width': 1.4,
            }));
            group.appendChild(el('circle', {
                cx: fx - dir * 3.2, cy: fingerBottom - 6, r: 2.2,
                fill: HONEY, stroke: INK, 'stroke-width': 0.8,
                opacity: jaws.contact ? 1 : 0.2,
            }));
        }

        return group;
    }
}

export default GripperRenderer;
