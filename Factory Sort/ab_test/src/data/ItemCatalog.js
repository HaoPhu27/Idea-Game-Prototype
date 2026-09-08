export const ITEM_CATALOG = {
    // 8 nhom hang x 4 loai = 32 loai item.
    //
    // Vi sao mo rong tu 4x3=12 len 8x4=32 (9/2026): duong cong do kho gio ep vao
    // 30 level, va tu L11 tro di ban co luon 9-10 Thung. Voi pool 12 loai thi mot
    // man 9 bo phai dung >= 9/12 pool -> cac man lien tiep gan nhu trung nhau,
    // nguoi choi nhin thay dung mot rem emoji suot ca chang. Pool 32 loai cho phep
    // moi man rut mot lat cat khac han.
    //
    // LUU Y: so loai/nhom KHONG con la hang so 3. Moi cho cham diem hoac clamp
    // dua tren "3 loai" hay "12 loai" phai doc tu catalog (xem MAX_TYPES_PER_CAT
    // trong SolvableLevelGenerator.js), khong duoc hardcode lai.
    categories: [
        {
            id: 'stuffed_animals',
            label: 'Thú nhồi bông',
            icon: '🧸',
            color: '#F26D8C', // Pink
            items: [
                { id: 'bear', emoji: '🧸', label: 'Gấu bông' },
                { id: 'duck', emoji: '🦆', label: 'Vịt bông' },
                { id: 'bunny', emoji: '🐰', label: 'Thỏ bông' },
                { id: 'penguin', emoji: '🐧', label: 'Chim cánh cụt bông' },
            ]
        },
        {
            id: 'food',
            label: 'Đồ ăn',
            icon: '🍔',
            color: '#F59E3C', // Peach / Orange
            items: [
                { id: 'apple', emoji: '🍎', label: 'Táo' },
                { id: 'pizza', emoji: '🍕', label: 'Pizza' },
                { id: 'donut', emoji: '🍩', label: 'Donut' },
                { id: 'burger', emoji: '🍔', label: 'Bánh mì kẹp' },
            ]
        },
        {
            id: 'stationery',
            label: 'Văn phòng phẩm',
            icon: '✏️',
            color: '#4FA8F5', // Light Blue
            items: [
                { id: 'pencil', emoji: '✏️', label: 'Bút chì' },
                { id: 'paperclip', emoji: '📎', label: 'Kẹp giấy' },
                { id: 'scissors', emoji: '✂️', label: 'Kéo' },
                { id: 'ruler', emoji: '📐', label: 'Thước ê ke' },
            ]
        },
        {
            id: 'sports',
            label: 'Thể thao',
            icon: '🏆',
            color: '#3FBF6F', // Light Green
            items: [
                { id: 'soccer', emoji: '⚽', label: 'Bóng đá' },
                { id: 'basketball', emoji: '🏀', label: 'Bóng rổ' },
                { id: 'tennis', emoji: '🎾', label: 'Bóng tennis' },
                { id: 'volleyball', emoji: '🏐', label: 'Bóng chuyền' },
            ]
        },
        {
            id: 'tools',
            label: 'Dụng cụ',
            icon: '🛠️',
            color: '#9AA6B8', // Steel grey
            items: [
                { id: 'hammer', emoji: '🔨', label: 'Búa' },
                { id: 'wrench', emoji: '🔧', label: 'Cờ lê' },
                { id: 'nut_and_bolt', emoji: '🔩', label: 'Ốc vít' },
                { id: 'gear', emoji: '⚙️', label: 'Bánh răng' },
            ]
        },
        {
            id: 'music',
            label: 'Nhạc cụ',
            icon: '🎵',
            color: '#A96BE8', // Plum / Purple
            items: [
                { id: 'guitar', emoji: '🎸', label: 'Đàn ghi ta' },
                { id: 'trumpet', emoji: '🎺', label: 'Kèn trumpet' },
                { id: 'drum', emoji: '🥁', label: 'Trống' },
                { id: 'piano', emoji: '🎹', label: 'Đàn phím' },
            ]
        },
        {
            id: 'kitchen',
            label: 'Đồ bếp',
            icon: '🍳',
            color: '#EFCB3A', // Soft yellow
            items: [
                { id: 'pan', emoji: '🍳', label: 'Chảo' },
                { id: 'cutlery', emoji: '🍴', label: 'Dao dĩa' },
                { id: 'cup', emoji: '☕', label: 'Tách' },
                { id: 'knife', emoji: '🔪', label: 'Dao bếp' },
            ]
        },
        {
            id: 'garden',
            label: 'Cây cảnh',
            icon: '🪴',
            color: '#2FC3AE', // Teal
            items: [
                { id: 'cactus', emoji: '🌵', label: 'Xương rồng' },
                { id: 'sunflower', emoji: '🌻', label: 'Hướng dương' },
                { id: 'mushroom', emoji: '🍄', label: 'Nấm' },
                { id: 'pine', emoji: '🌲', label: 'Cây thông' },
            ]
        }
    ]
};

export function getCategoryByItemId(itemId) {
    for (const cat of ITEM_CATALOG.categories) {
        for (const item of cat.items) {
            if (item.id === itemId) {
                return cat.id;
            }
        }
    }
    return null;
}

export function getItemEmoji(itemId) {
    for (const cat of ITEM_CATALOG.categories) {
        for (const item of cat.items) {
            if (item.id === itemId) {
                return item.emoji;
            }
        }
    }
    return '❓';
}

export function getCategoryConfig(categoryId) {
    return ITEM_CATALOG.categories.find(c => c.id === categoryId);
}

export function getCategoryIcon(categoryId) {
    const cat = getCategoryConfig(categoryId);
    return cat ? cat.icon : '📦';
}
