// src/core/Tube.js

/**
 * Lấy thông tin cụm slime trên cùng của Tube.
 * @param {string[]} tube - Mảng chứa các màu slime (index 0 là đáy, index cuối là đỉnh)
 * @returns {{color: string, size: number} | null} - Màu và số lượng slime trong cụm (null nếu tube rỗng)
 */
export function getTopCluster(tube) {
    if (isEmpty(tube)) return null;
    
    const topColor = tube[tube.length - 1];
    let size = 0;
    
    // Đếm ngược từ đỉnh xuống để tìm cụm cùng màu
    for (let i = tube.length - 1; i >= 0; i--) {
        if (tube[i] === topColor) {
            size++;
        } else {
            break;
        }
    }
    
    return { color: topColor, size };
}

/**
 * Kiểm tra xem có thể đổ từ src vào dst không theo luật Slime Sort.
 * @param {string[]} src - Tube nguồn
 * @param {string[]} dst - Tube đích
 * @param {number} capacity - Sức chứa tối đa của mỗi tube
 * @returns {boolean} - true nếu hợp lệ
 */
export function canPourInto(src, dst, capacity) {
    if (isEmpty(src)) return false;
    if (src === dst) return false;
    
    const space = capacity - dst.length;
    if (space <= 0) return false; // Không còn chỗ trống
    
    const cluster = getTopCluster(src);
    return cluster.size <= space; // Chỉ hợp lệ khi số slime cần chuyển <= chỗ trống
}

/**
 * Thực hiện đổ slime từ src sang dst.
 * Lưu ý: Phải gọi canPourInto trước khi gọi hàm này để đảm bảo hợp lệ.
 * @param {string[]} src - Tube nguồn
 * @param {string[]} dst - Tube đích
 * @param {number} capacity - Sức chứa tối đa (không cần thiết trong logic pour thực tế nếu đã kiểm tra, nhưng giữ theo signature plan)
 * @returns {number} - Số lượng slime đã đổ
 */
export function pourTube(src, dst, capacity) {
    const cluster = getTopCluster(src);
    if (!cluster) return 0;
    
    for (let i = 0; i < cluster.size; i++) {
        dst.push(src.pop());
    }
    
    return cluster.size;
}

/**
 * Đổ slime từ tube ra băng chuyền.
 * @param {string[]} tube - Tube nguồn
 * @param {object} conveyor - Đối tượng Conveyor (có method canReceive, enqueue)
 * @returns {boolean} - true nếu thành công
 */
export function pourToConveyor(tube, conveyor) {
    const cluster = getTopCluster(tube);
    if (!cluster) return false;
    
    if (conveyor.canReceive(cluster.size)) {
        conveyor.enqueue(cluster.color, cluster.size);
        for (let i = 0; i < cluster.size; i++) {
            tube.pop();
        }
        return true;
    }
    
    return false;
}

/**
 * Kiểm tra xem tube có rỗng không.
 * @param {string[]} tube 
 * @returns {boolean}
 */
export function isEmpty(tube) {
    return tube.length === 0;
}

/**
 * Helper kiểm tra tube có duy nhất 1 màu không.
 * @param {string[]} tube 
 * @returns {boolean}
 */
export function isSingleColor(tube) {
    if (isEmpty(tube)) return false;
    const firstColor = tube[0];
    return tube.every(color => color === firstColor);
}
