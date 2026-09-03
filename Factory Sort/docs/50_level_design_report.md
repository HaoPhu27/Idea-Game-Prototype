# Factory Sort — Thiet ke 50 level & nang do kho tier hard / super hard

Bao cao ky thuat, 09/2026. Nguon so lieu: `node tools/selftest.js` (8 test) va
`tools/levels50.json` (bang 50 level da tuyen).

---

## 1. Yeu cau va nhung gi da giao

| Yeu cau | Trang thai |
|---|---|
| Doc lai cau hinh thuat toan sinh level | Xong — viet lai `configForLevelNumber`, hieu chuan lai bo cham diem |
| Tang manh do kho hard + super hard, chi dung core gameplay san co | Xong — khong them co che moi, chi siet ba don bay da co |
| 50 level: 1-10 onboarding, 11-20 lam quen, 21+ duoi 5 = hard / duoi 9 = super hard | Xong — Test 3 xac nhan dinh tuyen dung ca 50 level |
| "Kho chu khong phai choi lau ton thoi gian" | Xong — par lon nhat: normal 17, hard/super hard 18 |

---

## 2. Thuoc do do kho: TY LE THUA, khong phai diem so

Diem `difficulty.score` chi de xep hang va hien thi. **Thuoc do su that** la ty le
thua cua chinh sach `smart` trong `GameSim`: mot nguoi choi khong bao gio pham loi
hien nhien (khong bao gio bo qua mot lan giao hang hop le, khong bao gio do item vao
Thung lam hong no) nhung **khong nhin truoc** thu tu Khay lan cac Thung bi che.

Van nao chinh sach do van thua la van doi hoi **lap ke hoach that** — dung nghia "kho
ma hay". Van nao no thang 100% ma par lai dai thi chi la "choi lau".

Moi so lieu duoi day do tren 60 playout/level, xac nhan lai o 400 playout tren nhieu
luong RNG cho cac cau hinh then chot.

---

## 3. Ba phat hien dinh hinh lai thiet ke

### (1) Cua so bang chuyen la don bay manh nhat — va truoc day bi cham NGUOC dau

`conveyor.allTrays.slice(0, conveyorMaxActive)` la mot **tien to co dinh**, khong xoay
vong duoc. `conveyorMaxActive = 1` nghia la ca man chi co dung mot Khay voi toi; moi
Thung wrap ra deu phai vua Khay do hoac nam lai chiem cho.

Do duoc, cung cau hinh con lai:

| cua so | ty le thua |
|---:|---|
| 1 | 55-93% |
| 2 | 45-75% |
| 3 | 0-33% |

Ban cham diem cu dung `clamp((conveyorMaxActive - 3) / 4)` — tuc la coi **nhieu** Khay
la kho hon. He qua: no cho **0 diem** truc nay cho moi level hard/super hard (cua so
1-2) va chi cho diem duong cho level onboarding (cua so 4). Truc da duoc thay bang
`nq = clamp((5 - conveyorMaxActive) / 4)` (do chat cua cua so) va nhan trong so lon
thu hai (0.20).

### (2) Phong to ban khong lam kho them, chi lam DAI them

N18 / visibleRows 4 chi thua 9%, trong khi N12 / visibleRows 3 thua 22% voi mot phan ba
so nuoc di. Vi vay truc khoi luong bi ha 0.26 -> 0.20, va super hard **ghim** N = 13
(do duoc: N13 thua 90% o cua so 1, N14 chi 45%). Day chinh la dieu kien "kho chu khong
dai" duoc dua thang vao trong so.

### (3) Bai toan con cua cac Thung gan nhu khong co chieu sau

Voi `numSets = numBoxes - 1`, so o trong bat bien `F = 3N - 3S = 3`. Ba o trong la qua
it de tao chieu sau tim kiem: Test 6 cho thay loi giai kien thiet luon xong duoi 2.9
nuoc/bo (can tren ly thuyet la 4). Ket luan: **do kho khong the den tu viec xao Thung**
(nen `extraScramble` giu nguyen 0), ma phai den tu *thu tu Khay* va *thong tin bi che*.

Truc moi `hiddenDepth` (so Thung nam ngoai `visibleRows`) duoc them voi trong so 0.08:
thong tin an phat nguoi khong lap ke hoach, chu khong bat ho bam them nuoc di.

---

## 4. Thay doi trong thuat toan

**`configForLevelNumber` — viet lai theo 5 tier.** Hard va super hard gio siet dong thoi
ba don bay:

| | hard (25/35/45) | super hard (29/39/49) |
|---|---|---|
| cua so bang chuyen | 2 | **1** |
| thu tu Khay | `reverse` | `reverse` |
| che do khop Khay | `itemType` (100% strict) | `itemType` (100% strict) |
| visibleRows | 3 (co Thung bi che) | 3 |
| numBoxes | 12 -> 14 | **ghim 13** |
| moveLimitSlack | 1.40 -> 1.25 | 1.30 -> 1.15 |

**Bo cham diem — hieu chuan lai 8 truc.** Trong so moi:

```
0.20*volume + 0.12*depth + 0.10*mix + 0.12*confusion
+ 0.08*trayBacklog + 0.20*windowTightness + 0.08*hiddenDepth + 0.10*strictness
```

Da **bo** tin dung cho `secondsPerMove` va `undoCount`: `GameEngine` khong cai dat dong
ho lan hoan tac (kiem chung bang grep), nen cham diem cho chung la tinh cong mot luat
khong ton tai. Hai truong nay van duoc sinh ra trong config de danh cho tuong lai, nhung
khong con anh huong toi diem.

**Seed da tuyen (`LEVEL_SEEDS`).** O cung mot cau hinh, seed co the lam chenh ty le thua
toi **40 diem phan tram**. Vi vay 50 level khong de bo sinh tu chon seed: moi level dung
mot seed da quet va cham chon, bake san trong bang. Ngoai pham vi 1-50, he thong quay ve
seed suy ra nhu cu.

**`DEFAULTS.maxAttempts` 400.** Gia tri cu qua thap khien bo sinh bo cuoc tren cac cau
hinh chat va am tham roi ve cau hinh de hon.

---

## 5. Bang 50 level

| Lv | Tier | Box | vr | cua so | par | limit | thua(smart) | seed |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | onboarding | 4 | 4 | 3 | 3 | - | 0% | 506952114 |
| 2 | onboarding | 5 | 4 | 4 | 4 | - | 0% | 1013904228 |
| 3 | onboarding | 5 | 4 | 4 | 4 | - | 0% | 1520888018 |
| 4 | onboarding | 6 | 4 | 3 | 5 | - | 0% | 2027848051 |
| 5 | onboarding | 6 | 4 | 3 | 5 | 10 | 0% | 387284842 |
| 6 | onboarding | 7 | 4 | 3 | 7 | 14 | 0% | 894229037 |
| 7 | onboarding | 7 | 4 | 3 | 8 | 15 | 0% | 1401204908 |
| 8 | onboarding | 8 | 4 | 3 | 9 | 17 | 0% | 1908133265 |
| 9 | onboarding | 9 | 4 | 3 | 9 | 16 | 0% | 267625489 |
| 10 | onboarding | 9 | 4 | 3 | 10 | 17 | 0% | 774561765 |
| 11 | acclimation | 9 | 4 | 3 | 9 | 16 | 0% | 1281513879 |
| 12 | acclimation | 9 | 4 | 3 | 9 | 16 | 0% | 1788648130 |
| 13 | acclimation | 10 | 4 | 3 | 11 | 19 | 0% | 148053245 |
| 14 | acclimation | 10 | 4 | 3 | 11 | 18 | 0% | 655227091 |
| 15 | acclimation | 10 | 4 | 3 | 11 | 18 | 0% | 1161949554 |
| 16 | acclimation | 11 | 3 | 3 | 11 | 18 | 0% | 1668893749 |
| 17 | acclimation | 11 | 3 | 3 | 12 | 19 | 0% | 28663138 |
| 18 | acclimation | 11 | 3 | 3 | 11 | 17 | 0% | 535306411 |
| 19 | acclimation | 12 | 3 | 3 | 13 | 20 | 0% | 1042377310 |
| 20 | acclimation | 12 | 3 | 3 | 13 | 19 | 0% | 1549321505 |
| 21 | normal | 11 | 3 | 3 | 16 | 24 | 10% | 2056115239 |
| 22 | normal | 11 | 3 | 3 | 15 | 23 | 13% | 416066765 |
| 23 | normal | 11 | 3 | 3 | 15 | 23 | 15% | 922694200 |
| 24 | normal | 11 | 3 | 3 | 16 | 24 | 10% | 1429986831 |
| 25 | hard | 12 | 3 | 2 | 13 | 19 | 70% | 1939457187 |
| 26 | normal | 11 | 3 | 3 | 15 | 23 | 11% | 296858795 |
| 27 | normal | 11 | 3 | 3 | 16 | 24 | 15% | 803209065 |
| 28 | normal | 12 | 3 | 3 | 14 | 21 | 11% | 1310422506 |
| 29 | superhard | 13 | 3 | 1 | 16 | 21 | 91% | 1818538713 |
| 30 | normal | 12 | 3 | 3 | 17 | 25 | 17% | 176217486 |
| 31 | normal | 12 | 3 | 3 | 17 | 25 | 13% | 683391332 |
| 32 | normal | 12 | 3 | 3 | 16 | 24 | 18% | 1190185066 |
| 33 | normal | 12 | 3 | 3 | 17 | 25 | 12% | 1697121342 |
| 34 | normal | 12 | 3 | 3 | 17 | 25 | 13% | 56819460 |
| 35 | hard | 13 | 3 | 2 | 15 | 20 | 67% | 565418726 |
| 36 | normal | 12 | 3 | 3 | 15 | 22 | 18% | 1070969177 |
| 37 | normal | 12 | 3 | 3 | 16 | 23 | 18% | 1577430313 |
| 38 | normal | 12 | 3 | 3 | 13 | 19 | 18% | 2084437860 |
| 39 | superhard | 13 | 3 | 1 | 16 | 20 | 90% | 445363423 |
| 40 | normal | 12 | 3 | 3 | 16 | 23 | 17% | 950866360 |
| 41 | normal | 12 | 3 | 3 | 18 | 26 | 12% | 1457842231 |
| 42 | normal | 13 | 3 | 3 | 19 | 27 | 18% | 1964643884 |
| 43 | normal | 13 | 3 | 3 | 17 | 24 | 20% | 324199460 |
| 44 | normal | 13 | 3 | 3 | 17 | 24 | 15% | 831397063 |
| 45 | hard | 14 | 3 | 2 | 18 | 23 | 67% | 1338040336 |
| 46 | normal | 13 | 3 | 3 | 17 | 24 | 18% | 1845332967 |
| 47 | normal | 13 | 3 | 3 | 17 | 24 | 18% | 204967733 |
| 48 | normal | 13 | 3 | 3 | 17 | 24 | 28% | 711927766 |
| 49 | superhard | 13 | 3 | 1 | 17 | 20 | 88% | 1221382284 |
| 50 | normal | 13 | 3 | 3 | 17 | 23 | 13% | 1725317259 |

*(vr = visibleRows, cua so = conveyorMaxActive, thua = ty le thua chinh sach `smart`,
limit = gioi han nuoc chuyen mon; "-" nghia la khong dat gioi han)*

Tong hop theo tier:

| tier | n | ty le thua | par | cua so |
|---|---:|---|---|---:|
| onboarding | 10 | 0% | 3-10 | 3-4 |
| acclimation | 10 | 0% | 9-13 | 3 |
| normal | 24 | 10-28% | 13-19 | 3 |
| hard | 3 | 67-70% | 13-18 | 2 |
| super hard | 3 | 88-91% | 16-17 | **1** |

Dieu dang chu y: **par cua super hard (16-17) con NGAN HON par cua normal (toi 19)**,
trong khi ty le thua cao gap bon lan. Do la bang chung dinh luong cho "kho chu khong dai".

---

## 6. Hai loi ky thuat phat hien va sua trong qua trinh lam

### (1) Gioi han nuoc di lam van hoan hao bi xu THUA — `GameEngine.checkConditions()`

Day la loi nang nhat, va khong test nao truoc day bat duoc.

`moveCount` **chi dem nuoc chuyen mon**; keo Thung da wrap len Khay la **mien phi**. Code
cu ket thuc van ngay khi cham gioi han:

```js
if (this.moveLimit && this.moveCount >= this.moveLimit) {
    this.setGameState('LOST');
    return;
}
```

He qua: mot van **hoan hao** — nuoc cuoi cung wrap not Thung cuoi — bi xu thua *truoc khi*
nguoi choi kip keo Thung do len Khay. Noi cach khac, **dung dung par thi khong bao gio
thang duoc**, va tier cang kho (slack cang sat 1.0) thi cang de dinh. Da thay bang:

```js
if (this.moveLimit && this.moveCount >= this.moveLimit) {
    const canStillDeliver = this.boxes.some(
        (b) => b && b.isWrapped && this.isAccessible(b.id) && this.conveyor.findMatchingTray(b)
    );
    if (!canStillDeliver) {
        this.setGameState('LOST');
        return;
    }
}
```

Sau khi sua, Test 7 di tu 56/60 len **60/60** tren moi level. Cac that bai kieu "engine tu
choi nuoc di" cung bien mat theo, vi engine khong nhan input khi `gameState` da roi
`PLAYING` — hai trieu chung, mot nguyen nhan.

### (2) Gioi han nuoc di co CONG BANG khong? — Test 8 (moi)

`moveLimit = ceil(par * moveLimitSlack)`, ma `par` den tu `solveIDA(boxes)` — mot loi giai
**chi nhin cac Thung**, khong biet gi ve thu tu Khay. Neu viec xep hang theo dung thu tu
Khay ton them nuoc di thi gioi han se **hep hon toi uu that su** va man choi thanh *khong
the thang*. `GameSim` khong he mo hinh hoa `moveLimit` (moi ty le thua do duoc deu chi den
tu deadlock), nen khong co gi bao chung dieu nay.

Test 8 giai **toan cuc** bang `solveFull` (co bang chuyen, co cua so, co thu tu) roi so voi
gioi han. Ket qua: **46/46 level co gioi han deu dat duoc**, 0 level het ngan sach tim kiem.
Du dia hep nhat la 3 nuoc (level 49). Ket luan: khong can noi `moveLimitSlack`.

> Cam bay khi viet test nay: `solveFull` tra ve **hai loai** nuoc — giao hang `{k:'d'}` va
> chuyen mon `{k:'m'}` — trong khi `moveCount` chi dem loai sau. So `r.moves.length` voi
> `moveLimit` se thoi phong con so len khoang gap doi va bao dong gia.

---

## 7. Kiem chung

```bash
node tools/selftest.js
```

8/8 test pass trong ~8 giay:

| Test | Noi dung |
|---|---|
| 1 | Replay loi giai tham chieu qua engine sim, moi preset x 400 seed |
| 2 | IDA* xac nhan 100% level co loi giai; chenh lech trung binh 1.07 nuoc |
| 3 | Dinh tuyen tier dung ca 50 level + chot "par lon nhat: normal 17, hard/superhard 18" |
| 4 | Stress cau hinh khac nghiet (ke ca cac cau hinh bat kha thi phai bao loi som) |
| 5 | Kiem chung gia dinh "co 1 Box rong => luon giai duoc" (GDD 8.2) |
| 6 | Loi giai kien thiet <= 4 nuoc/bo, khong can search |
| 7 | Tich hop that: LevelGenerator -> GameEngine -> WON, 60/60 moi level |
| 8 | **Moi** — gioi han nuoc di vs loi giai toi uu day du, 46/46 dat duoc |

Ban standalone da build lai: `FactorySort_Standalone.html` (va `bundle.js`, 3528 dong).

---

## 8. Ghi chu cho lan sau

- **Dung tang do kho bang cach phong to ban.** Da do: no chi lam dai.
- **Seed quan trong ngang cau hinh.** Bat ky thay doi nao len `configForLevelNumber` deu
  can quet lai `LEVEL_SEEDS` bang `tools/curate50.mjs` + `tools/refine.mjs`.
- **`GameSim` khong biet `moveLimit`.** Ty le thua do duoc la *can duoi* cua do kho that.
- `secondsPerMove` va `undoCount` van chua duoc `GameEngine` cai dat — neu sau nay cai, phai
  dua lai vao bo cham diem.
