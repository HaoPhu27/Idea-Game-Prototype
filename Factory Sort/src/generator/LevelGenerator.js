import {
  generateLevel,
  configForLevelNumber,
} from './SolvableLevelGenerator.js';
import { solveConstructive } from './Solver.js';

/**
 * LevelGenerator — lop adapter mong giua UI va bo sinh man nguoc.
 *
 * TRUOC DAY file nay tu sinh man theo huong THUAN:
 *   - Math.random() khong seed  => khong tai lap duoc level de debug/bao loi.
 *   - sort(() => 0.5 - Math.random()) => comparator khong nhat quan, phan phoi
 *     lech nang (khong phai Fisher-Yates).
 *   - Solver bi bo qua hoan toan (`while (!levelData && attempts < 1)`), nen
 *     KHONG co bao dam giai duoc nao — chi la mot gia dinh.
 *   - Vi tron ngau nhien, 23% level 1 sinh ra da co san mot Thung WRAPPED
 *     (3 mon giong nhau roi vao cung Thung) => nguoi choi duoc thung mien phi,
 *     duong cong do kho vo nghia (do bang tools/selftest.js TEST 5).
 *   - `import { Solver }` tro toi mot export khong con ton tai => ban ESM cua
 *     index.html nem loi ngay khi load.
 *
 * NAY uy quyen cho SolvableLevelGenerator (sinh NGUOC tu trang thai THANG):
 *   - solvability la bat bien cau truc, khong phai ket qua tim kiem;
 *   - kem `referenceSolution` da duoc replay kiem chung;
 *   - RNG co seed => cung levelNumber luon ra cung man choi.
 */
export class LevelGenerator {
  /**
   * @param {object} config
   *   Dang moi (uu tien): { levelNumber: 7, ...overrides }
   *   Dang cu (tuong thich nguoc): { numBoxes, numEmptyBoxes, numCategories, itemTypesPerCat }
   * @returns level object dung duoc truc tiep boi GameEngine.startLevel()
   */
  static generateLevel(config = {}) {
    const cfg = LevelGenerator.toGeneratorConfig(config);

    let level;
    try {
      level = generateLevel(cfg);
    } catch (err) {
      // Cau hinh bat kha thi (vd: so bo > so o chua duoc). Noi long dan cho
      // toi khi hop le thay vi nem loi ra UI.
      console.warn('[LevelGenerator] cau hinh khong hop le, dang noi long:', err.message);
      level = LevelGenerator.generateWithRelaxedConfig(cfg);
    }

    return LevelGenerator.toEngineLevel(level);
  }

  /** Chuyen config cua UI thanh config cua bo sinh nguoc. */
  static toGeneratorConfig(config) {
    if (config.levelNumber != null) {
      const { levelNumber, ...overrides } = config;
      return configForLevelNumber(levelNumber, overrides);
    }

    // --- Duong tuong thich nguoc cho loi goi cu ---
    const {
      numBoxes = 6,
      numEmptyBoxes = 1,
      numCategories = 2,
      itemTypesPerCat = 2,
      ...rest
    } = config;
    return configForLevelNumber(1, {
      numBoxes,
      numEmptyBoxes,
      numSets: numBoxes - numEmptyBoxes,
      numCategories,
      itemTypesPerCategory: itemTypesPerCat,
      seed: (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0,
      ...rest,
    });
  }

  /**
   * Ha dan so bo hang cho toi khi cau hinh kha thi.
   * So o trong toi thieu la 3 (dinh ly solvability: F = 3N - 3S >= 3),
   * nen numSets khong duoc vuot qua numBoxes - 1.
   */
  static generateWithRelaxedConfig(cfg) {
    for (let sets = Math.min(cfg.numSets, cfg.numBoxes - 1); sets >= 1; sets--) {
      try {
        return generateLevel({ ...cfg, numSets: sets });
      } catch (_) { /* thu tiep */ }
    }
    throw new Error(`[LevelGenerator] khong sinh duoc man choi tu config: ${JSON.stringify(cfg)}`);
  }

  /** Dat lai ten truong cho khop hop dong ma GameEngine.startLevel() doc. */
  static toEngineLevel(level) {
    return {
      id: `lv_${level.seed}`,
      boxes: level.boxes,
      trays: level.trays,
      conveyorType: level.conveyor.type,
      maxActiveTrays: level.conveyor.maxActive,

      // Bang chung + sieu du lieu, cho HUD / hint / phan tich.
      solvable: level.solvable,
      referenceSolution: level.referenceSolution,
      difficulty: level.difficulty,
      rules: level.rules,
      config: level.config,
    };
  }

  /**
   * Goi y nuoc di ke tiep tu trang thai HIEN TAI (khong phai tu trang thai dau).
   * Dung loi giai kien thiet O(S) — luon tra ve ket qua tuc thi, khong search,
   * nen dung duoc lam nut "Hint" va luoi chan ket cuc "nguoi choi tuong minh ket".
   * @param {Array<{items:string[]}>|string[][]} boxes trang thai hien tai
   * @returns {{from:number,index:number,to:number}|null}
   */
  static hint(boxes) {
    const state = boxes.map((b) => (Array.isArray(b) ? b.slice() : b.items.slice()));
    const r = solveConstructive(state);
    return r.solved && r.moves.length ? r.moves[0] : null;
  }
}
