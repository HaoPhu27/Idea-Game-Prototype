export const ITEM_CATALOG = {
    categories: [
        {
            id: 'stuffed_animals',
            label: 'Thú nhồi bông',
            color: '#FFB6C1', // Pink
            items: [
                { id: 'bear', emoji: '🧸', label: 'Gấu bông' },
                { id: 'duck', emoji: '🦆', label: 'Vịt bông' },
                { id: 'bunny', emoji: '🐰', label: 'Thỏ bông' },
            ]
        },
        {
            id: 'food',
            label: 'Đồ ăn',
            color: '#FFDAB9', // Peach
            items: [
                { id: 'apple', emoji: '🍎', label: 'Táo' },
                { id: 'pizza', emoji: '🍕', label: 'Pizza' },
                { id: 'donut', emoji: '🍩', label: 'Donut' },
            ]
        },
        {
            id: 'stationery',
            label: 'Văn phòng phẩm',
            color: '#ADD8E6', // Light Blue
            items: [
                { id: 'pencil', emoji: '✏️', label: 'Bút chì' },
                { id: 'paperclip', emoji: '📎', label: 'Kẹp giấy' },
                { id: 'scissors', emoji: '✂️', label: 'Kéo' },
            ]
        },
        {
            id: 'sports',
            label: 'Thể thao',
            color: '#90EE90', // Light Green
            items: [
                { id: 'soccer', emoji: '⚽', label: 'Bóng đá' },
                { id: 'basketball', emoji: '🏀', label: 'Bóng rổ' },
                { id: 'tennis', emoji: '🎾', label: 'Bóng tennis' }
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
