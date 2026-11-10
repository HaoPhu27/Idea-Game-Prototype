// ThemeManager.js — quản lý theme skin cho item art (candy mặc định, food, ...).
// Map 32 catalog id (theo thứ tự ổn định của ItemCatalog) -> asset PNG của theme.
// Không đụng tới core: chỉ là metadata + helper tra asset/label + refresh DOM.

import { ITEM_CATALOG } from '../data/ItemCatalog.js';

// Thứ tự catalog chính thức, ổn định (8 nhóm x 4 = 32).
const THEME_CATALOG_IDS = ITEM_CATALOG.categories.reduce((acc, cat) => {
    for (const item of cat.items) acc.push(item.id);
    return acc;
}, []);

// Thứ tự manifest 32 của GPT (candy_01..32 / food_01..32) khớp đúng thứ tự
// catalog trên. Chỉ khác cách đặt tên file nên ta lưu relativePath theo index.
const THEME_CANDY_FILES = [
    'gpt/candy/items/candy_01_spiral_lollipop.png',
    'gpt/candy/items/candy_02_heart_lollipop.png',
    'gpt/candy/items/candy_03_star_lollipop.png',
    'gpt/candy/items/candy_04_candy_cane.png',
    'gpt/candy/items/candy_05_twistwrapped_bonbon.png',
    'gpt/candy/items/candy_06_round_truffle.png',
    'gpt/candy/items/candy_07_square_praline.png',
    'gpt/candy/items/candy_08_striped_toffee.png',
    'gpt/candy/items/candy_09_gummy_bear.png',
    'gpt/candy/items/candy_10_gummy_ring.png',
    'gpt/candy/items/candy_11_gummy_worm.png',
    'gpt/candy/items/candy_12_gummy_peach.png',
    'gpt/candy/items/candy_13_jelly_bean.png',
    'gpt/candy/items/candy_14_sugar_drop.png',
    'gpt/candy/items/candy_15_candy_corn.png',
    'gpt/candy/items/candy_16_mint_disc.png',
    'gpt/candy/items/candy_17_pink_macaron.png',
    'gpt/candy/items/candy_18_cream_wafer.png',
    'gpt/candy/items/candy_19_chocolate_sandwich_cookie.png',
    'gpt/candy/items/candy_20_butter_biscuit.png',
    'gpt/candy/items/candy_21_sprinkle_donut.png',
    'gpt/candy/items/candy_22_strawberry_cupcake.png',
    'gpt/candy/items/candy_23_cake_roll.png',
    'gpt/candy/items/candy_24_berry_tart.png',
    'gpt/candy/items/candy_25_popsicle.png',
    'gpt/candy/items/candy_26_icecream_cone.png',
    'gpt/candy/items/candy_27_sundae_cup.png',
    'gpt/candy/items/candy_28_mochi_ball.png',
    'gpt/candy/items/candy_29_chocolate_bar.png',
    'gpt/candy/items/candy_30_peanut_brittle.png',
    'gpt/candy/items/candy_31_fudge_cube.png',
    'gpt/candy/items/candy_32_marshmallow_twist.png',
];

const THEME_FOOD_FILES = [
    'gpt/food/items/food_01_apple.png',
    'gpt/food/items/food_02_orange.png',
    'gpt/food/items/food_03_strawberry.png',
    'gpt/food/items/food_04_pear.png',
    'gpt/food/items/food_05_broccoli.png',
    'gpt/food/items/food_06_carrot.png',
    'gpt/food/items/food_07_corn_cob.png',
    'gpt/food/items/food_08_mushroom.png',
    'gpt/food/items/food_09_fried_egg.png',
    'gpt/food/items/food_10_croissant.png',
    'gpt/food/items/food_11_pancake_stack.png',
    'gpt/food/items/food_12_toast.png',
    'gpt/food/items/food_13_burger.png',
    'gpt/food/items/food_14_pizza_slice.png',
    'gpt/food/items/food_15_taco.png',
    'gpt/food/items/food_16_hotdog.png',
    'gpt/food/items/food_17_sushi_roll.png',
    'gpt/food/items/food_18_dumpling.png',
    'gpt/food/items/food_19_rice_ball.png',
    'gpt/food/items/food_20_noodle_bowl.png',
    'gpt/food/items/food_21_chicken_drumstick.png',
    'gpt/food/items/food_22_steak.png',
    'gpt/food/items/food_23_shrimp.png',
    'gpt/food/items/food_24_salmon_fillet.png',
    'gpt/food/items/food_25_fries_carton.png',
    'gpt/food/items/food_26_pretzel.png',
    'gpt/food/items/food_27_sandwich.png',
    'gpt/food/items/food_28_soup_bowl.png',
    'gpt/food/items/food_29_milk_carton.png',
    'gpt/food/items/food_30_juice_bottle.png',
    'gpt/food/items/food_31_tea_cup.png',
    'gpt/food/items/food_32_smoothie_glass.png',
];

// Label themed thực tế theo THỨ TỰ manifest (khớp catalog index).
// candy_01 -> bear, candy_02 -> duck, ... (identity mapping ổn định).
const THEME_CANDY_LABELS = [
    'Kẹo mút xoắn ốc',
    'Kẹo mút hình tim',
    'Kẹo mút ngôi sao',
    'Gậy kẹo bạc hà',
    'Kẹo bonbon gói xoắn',
    'Truffle tròn',
    'Praline vuông',
    'Toffee sọc',
    'Gấu dẻo',
    'Vòng dẻo',
    'Sâu dẻo',
    'Đào dẻo',
    'Kẹo đậu jelly',
    'Giọt đường',
    'Kẹo bắp',
    'Bánh bạc hà',
    'Macaron hồng',
    'Bánh wafer kem',
    'Bánh quy kem sô-cô-la',
    'Bánh quy bơ',
    'Donut rắc',
    'Cupcake dâu',
    'Bánh cuộn kem',
    'Tart quả mọng',
    'Kem que',
    'Kem ốc quế',
    'Ly sundae',
    'Bánh mochi',
    'Thanh sô-cô-la',
    'Kẹo đậu phộng',
    'Khối fudge',
    'Kẹo marshmallow xoắn',
];

const THEME_FOOD_LABELS = [
    'Quả táo',
    'Quả cam',
    'Quả dâu tây',
    'Quả lê',
    'Bông cải xanh',
    'Củ cà rốt',
    'Bắp ngô',
    'Cây nấm',
    'Trứng chiên',
    'Bánh sừng bò',
    'Chồng bánh pancake',
    'Bánh mì nướng',
    'Bánh mì kẹp',
    'Miếng pizza',
    'Bánh taco',
    'Xúc xích kẹp',
    'Sushi cuộn',
    'Bánh há cảo',
    'Cơm nắm',
    'Bát mì',
    'Đùi gà chiên',
    'Bít tết',
    'Tôm',
    'Phi lê cá hồi',
    'Hộp khoai tây chiên',
    'Bánh pretzel',
    'Bánh sandwich',
    'Bát súp',
    'Hộp sữa',
    'Chai nước cam',
    'Tách trà',
    'Ly sinh tố',
];

const THEME_ASSET_ROOT = '../assets/retheme-review/2026-11-10';

function themeBuildRelativeMap(files) {
    const map = {};
    THEME_CATALOG_IDS.forEach((id, idx) => {
        if (files[idx]) map[id] = files[idx];
    });
    return map;
}

function themeBuildLabelMap(labels) {
    const map = {};
    THEME_CATALOG_IDS.forEach((id, idx) => {
        if (labels[idx]) map[id] = labels[idx];
    });
    return map;
}

// Metadata theme: id, label, items {catalogId -> relativePath},
// labels {catalogId -> themed label}.
export const THEMES = {
    candy: {
        id: 'candy',
        label: 'Kẹo ngọt',
        items: themeBuildRelativeMap(THEME_CANDY_FILES),
        labels: themeBuildLabelMap(THEME_CANDY_LABELS),
    },
    food: {
        id: 'food',
        label: 'Đồ ăn',
        items: themeBuildRelativeMap(THEME_FOOD_FILES),
        labels: themeBuildLabelMap(THEME_FOOD_LABELS),
    },
};

export const DEFAULT_THEME_ID = 'candy';
const THEME_STORAGE_KEY = 'factory-sort-theme';

function themeHas(id) {
    return typeof id === 'string' && Object.prototype.hasOwnProperty.call(THEMES, id);
}

function themeSafeStorageGet() {
    try {
        if (typeof localStorage === 'undefined' || !localStorage) return null;
        return localStorage.getItem(THEME_STORAGE_KEY);
    } catch (e) {
        return null;
    }
}

function themeSafeStorageSet(id) {
    try {
        if (typeof localStorage === 'undefined' || !localStorage) return;
        localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch (e) {
        // ignore quota / security errors
    }
}

function themeInitialId() {
    const stored = themeSafeStorageGet();
    if (themeHas(stored)) return stored;
    return DEFAULT_THEME_ID;
}

let themeCurrentId = themeInitialId();

// Áp vào body.dataset.theme (an toàn khi không có document).
function themeApplyBodyDataset(id) {
    try {
        if (typeof document === 'undefined' || !document) return;
        const body = document.body;
        if (!body) return;
        if (!body.dataset) body.dataset = {};
        body.dataset.theme = id;
    } catch (e) {
        // ignore
    }
}

export function getTheme() {
    return themeCurrentId;
}

// Trả về true nếu theme thay đổi thật sự (và persist + dispatch), false nếu
// không thay đổi hoặc id không hợp lệ.
export function setTheme(id) {
    if (!themeHas(id)) return false;
    if (id === themeCurrentId) return false;
    themeCurrentId = id;
    themeSafeStorageSet(id);
    themeApplyBodyDataset(id);
    themeRefreshAllElements();
    try {
        if (typeof document !== 'undefined' && document &&
            typeof document.dispatchEvent === 'function' &&
            typeof CustomEvent !== 'undefined') {
            document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: id } }));
        }
    } catch (e) {
        // ignore
    }
    return true;
}

function themeIsMaskedElement(el) {
    if (!el) return false;
    if (typeof el.closest === 'function') {
        try {
            if (el.closest('.blocker-masked, .blocker-concealed')) return true;
        } catch (e) {
            // ignore
        }
    }
    if (typeof el.matches === 'function') {
        try {
            if (el.matches('.blocker-masked, .blocker-concealed')) return true;
        } catch (e) {
            // ignore
        }
    }
    let p = el;
    while (p && p !== el.ownerDocument) {
        const cls = p.classList;
        if (cls && typeof cls.contains === 'function') {
            if (cls.contains('blocker-masked') || cls.contains('blocker-concealed')) return true;
        }
        p = p.parentNode;
    }
    return false;
}

// Cập nhật title/aria-label chỉ khi element chưa có label do blocker quản lý
// hoặc label hiện tại chính là label theme đã đặt trước đó (qua dataset.themeLabel).
function themeApplyOwnedLabel(el, label) {
    if (!label) return;
    const ds = el.dataset;
    const prevTitle = ds && ds.themeTitle;
    const prevAria = ds && ds.themeAriaLabel;
    const curTitle = 'title' in el ? el.title : undefined;
    const curAria = typeof el.getAttribute === 'function' ? el.getAttribute('aria-label') : undefined;
    if (curTitle === undefined || curTitle === '' || curTitle === prevTitle) {
        if ('title' in el) el.title = label;
        if (ds) ds.themeTitle = label;
    }
    if (curAria === undefined || curAria === null || curAria === '' || curAria === prevAria) {
        if (typeof el.setAttribute === 'function') el.setAttribute('aria-label', label);
        if (ds) ds.themeAriaLabel = label;
    }
}

function themeRefreshElement(el) {
    if (!el || !el.dataset) return;
    if (themeIsMaskedElement(el)) return;
    const itemId = el.dataset.itemId;
    if (!itemId) return;
    const uri = getThemedItemAsset(itemId, themeCurrentId);
    if (!uri) return;
    const label = getThemedItemLabel(itemId, themeCurrentId);
    el.dataset.itemArt = uri;
    if (el.style && typeof el.style.setProperty === 'function') {
        el.style.setProperty('--item-art', `url("${uri}")`);
    }
    themeApplyOwnedLabel(el, label);
}

function themeRefreshAllElements() {
    try {
        if (typeof document === 'undefined' || !document ||
            typeof document.querySelectorAll !== 'function') return;
        const nodes = document.querySelectorAll('[data-item-id]');
        for (let i = 0; i < nodes.length; i++) themeRefreshElement(nodes[i]);
    } catch (e) {
        // ignore
    }
}

// Đường dẫn tương đối dùng cho kiểm tra filesystem trong Node.
function themeNodeRelativeAssetPath(itemId, themeId) {
    const themeConfig = THEMES[themeId];
    if (!themeConfig) return null;
    const rel = themeConfig.items[itemId];
    if (!rel) return null;
    return `${THEME_ASSET_ROOT}/${rel}`;
}

// Trả về URL asset đã theme: ưu tiên map nhúng của build standalone,
// sau đó URL tương đối theo document.baseURI (xử lý cả /ab_test/dist/).
export function getThemedItemAsset(itemId, themeId = getTheme()) {
    if (!itemId || !themeHas(themeId)) return null;
    const themeConfig = THEMES[themeId];
    const rel = themeConfig.items[itemId];
    if (!rel) return null;

    // 1) Map nhúng sẵn của build standalone.
    try {
        const injected = globalThis.__FACTORY_THEME_ASSETS__;
        if (injected && injected[themeId] && injected[themeId][itemId]) {
            return injected[themeId][itemId];
        }
    } catch (e) {
        // ignore
    }

    // 2) Node / không có document => trả về đường dẫn tương đối cho fs check.
    if (typeof document === 'undefined' || !document) {
        return themeNodeRelativeAssetPath(itemId, themeId);
    }

    // 3) Browser: URL tương đối, detect /dist/ trong base pathname.
    try {
        const base = document.baseURI || '';
        let pathname = base;
        try {
            pathname = new URL('.', base).pathname || base;
        } catch (e) {
            pathname = base;
        }
        const up = /\/dist\/?$/.test(pathname) ? '../../' : '../';
        return new URL(`${up}assets/retheme-review/2026-11-10/${rel}`, base).href;
    } catch (e) {
        return themeNodeRelativeAssetPath(itemId, themeId);
    }
}

export function getThemedItemLabel(itemId, themeId = getTheme()) {
    if (!itemId || !themeHas(themeId)) return null;
    const themeConfig = THEMES[themeId];
    const label = themeConfig.labels[itemId];
    if (!label) return null;
    return label;
}

// Áp theme đã lưu khi module được import.
themeApplyBodyDataset(themeCurrentId);
