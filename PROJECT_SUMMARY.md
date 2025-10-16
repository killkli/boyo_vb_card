# VBCards 專案總結

## 專案概述

VBCards 是一個靜態網頁應用程式，專為英文單字記憶學習設計。使用翻卡互動方式，結合圖片視覺輔助，幫助學生有效記憶 18 個級數的英文單字。

## 資料來源分析

### 現有資料結構
- **位置**: `/output/images/`
- **大小**: ~2.6GB
- **包含內容**:
  - 18 個級數 (level_1 到 level_18)
  - 每個級數有一個 manifest JSON 檔案
  - 每個級數有一個圖片資料夾
  - 總共約 1200+ 單字及圖片

### Manifest 檔案結構
每個 `level_{number}_manifest.json` 包含:
- `level`: 級數編號 (1-18)
- `levelName`: 級數名稱 (如: "英文單字認讀基礎級(一)")
- `totalWords`: 該級數單字總數
- `results`: 單字陣列，每個單字包含:
  - `word`: 英文單字
  - `meaning`: 中文意思
  - `filename`: 圖片檔名 (如: "0001_I.png")
  - `boyo_id`: Boyo 系統 ID
  - `id`: 單字 ID

### 範例資料 (Level 1)
- 級數名稱: "英文單字認讀基礎級(一)"
- 單字數量: 33 個
- 單字範例: I (我), you (你、你們), he (他), she (她), father (爸爸), mother (媽媽)...

## 技術選型決策

### 為什麼選擇 React?
1. **元件化**: 翻卡、卡組、級數選擇器都是獨立可重用元件
2. **生態系**: React Router (路由)、豐富的 UI 函式庫
3. **TypeScript 支援**: 優秀的型別推斷和開發體驗
4. **效能**: Virtual DOM 高效更新，適合互動式 UI

### 為什麼選擇 Vite?
1. **快速開發**: HMR (熱模組替換) 極速
2. **最佳化建置**: ESBuild + Rollup 產生最佳化的生產程式碼
3. **靜態資源處理**: 完善的 public 資料夾支援
4. **零配置**: 開箱即用的 TypeScript、JSX 支援

### 為什麼選擇 TailwindCSS?
1. **快速開發**: Utility-first，不需寫 CSS 檔案
2. **響應式設計**: 內建斷點系統，輕鬆處理多螢幕尺寸
3. **一致性**: 設計系統內建，顏色、間距、字體大小統一
4. **檔案小**: PurgeCSS 自動移除未使用的樣式

## 核心功能設計

### 1. 級數選擇頁面 (Home)
**功能**:
- 展示 18 個級數的卡片網格
- 顯示每個級數的名稱與單字數量
- 點擊進入該級數的學習頁面

**技術實作**:
- 使用 Grid 佈局 (Tailwind: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`)
- 載入所有 manifest 檔案的 metadata (level, levelName, totalWords)
- React Router Link 導航到學習頁面

### 2. 翻卡學習頁面 (Learn)
**功能**:
- 一次顯示一張卡片
- 點擊卡片翻轉 (正面: 英文單字+圖片，背面: 中文意思)
- 上一張/下一張按鈕導航
- 進度顯示 (如: "5 / 33")
- 返回級數選擇

**技術實作**:
- CSS 3D Transform (`rotateY(180deg)`) 實現翻轉動畫
- React State 管理當前卡片索引和翻轉狀態
- 圖片路徑: `/data/level_{level}/{filename}`
- 鍵盤事件: 左右鍵換卡，空白鍵翻卡

### 3. 翻卡元件 (FlashCard)
**設計**:
```
┌─────────────────┐     點擊/空白鍵      ┌─────────────────┐
│                 │  ←────────────→  │                 │
│   [圖片]        │                   │   中文意思      │
│                 │                   │                 │
│   English Word  │                   │   meaning       │
└─────────────────┘                   └─────────────────┘
     正面 (Front)                          背面 (Back)
```

**動畫細節**:
- 翻轉時間: 0.6s
- 緩動函數: ease-in-out
- 3D 透視效果: perspective(1000px)
- 背面初始狀態: rotateY(180deg)

## 專案結構設計

```
VBCards/
├── public/
│   └── data/                      # 搬移 output/images 到這裡
│       ├── level_1/
│       ├── level_1_manifest.json
│       └── ... (2-18)
├── src/
│   ├── components/
│   │   ├── FlashCard.tsx          # 翻卡元件 (可重用)
│   │   ├── CardDeck.tsx           # 卡組容器 (管理導航邏輯)
│   │   ├── LevelSelector.tsx      # 級數選擇網格
│   │   ├── ProgressBar.tsx        # 進度條元件
│   │   └── Header.tsx             # 頁首元件
│   ├── pages/
│   │   ├── Home.tsx               # 首頁 (級數選擇)
│   │   └── Learn.tsx              # 學習頁面 (翻卡)
│   ├── hooks/
│   │   ├── useFlashCards.ts       # 卡片狀態管理 Hook
│   │   └── useLevelData.ts        # 載入級數資料 Hook
│   ├── types/
│   │   └── vocabulary.ts          # TypeScript 型別定義
│   ├── utils/
│   │   ├── dataLoader.ts          # 載入 manifest 檔案
│   │   └── shuffle.ts             # 陣列隨機排序
│   ├── App.tsx                    # 主應用元件 (Router)
│   ├── main.tsx                   # 進入點
│   └── index.css                  # Tailwind 導入
├── IMPLEMENTATION_PLAN.md         # 詳細實作計劃
├── README.md                      # 專案說明
├── vite.config.ts                 # Vite 配置
├── tsconfig.json                  # TypeScript 配置
├── tailwind.config.js             # Tailwind 配置
└── package.json
```

## 資料流設計

### 初始載入流程
```
App 啟動
  ↓
Home 頁面
  ↓
載入所有 manifest 的 metadata (18 個檔案)
  ↓
顯示級數選擇網格
  ↓
使用者選擇級數 (如: Level 1)
  ↓
導航到 Learn 頁面 (/learn/1)
  ↓
載入 level_1_manifest.json (完整資料)
  ↓
顯示第一張卡片
```

### 翻卡互動流程
```
顯示卡片正面 (英文 + 圖片)
  ↓
使用者點擊卡片
  ↓
觸發 flip state 切換
  ↓
CSS animation 執行 (rotateY 180deg)
  ↓
顯示卡片背面 (中文意思)
  ↓
再次點擊 → 翻回正面
```

### 導航流程
```
目前卡片索引: currentIndex = 0
  ↓
使用者點擊「下一張」
  ↓
currentIndex++
  ↓
更新卡片顯示
  ↓
自動翻回正面 (flip state = false)
  ↓
進度更新 (2 / 33)
```

## 效能最佳化策略

### 1. 圖片載入最佳化
- **Lazy Loading**: 使用 `<img loading="lazy">` 延遲載入
- **Preloading**: 預載下一張、上一張卡片的圖片
- **圖片大小**: 建議壓縮到 100KB 以下 (如果原圖太大)

### 2. 資料載入策略
- **按需載入**: 只載入當前級數的 manifest (不是一次載入 18 個)
- **Metadata 快取**: Home 頁面的級數資訊快取在 Context
- **漸進式載入**: 可考慮先顯示卡片文字，圖片後載入

### 3. 建置最佳化
- **Code Splitting**: React.lazy() 載入頁面元件
- **Tree Shaking**: Vite 自動移除未使用的程式碼
- **Assets Chunking**: Rollup 配置分離 vendor 和 app 程式碼
- **圖片不打包**: 保持在 public/ 資料夾，避免 bundle 過大

### 4. 執行時效能
- **避免重渲染**: 使用 React.memo() 包裝卡片元件
- **事件委派**: 在父元件監聽鍵盤事件，不在每張卡片上綁定
- **CSS 動畫**: 使用 transform 而非 left/top (GPU 加速)

## 未來擴充功能

### Phase 1 (MVP - 最小可行產品)
- [x] 級數選擇
- [x] 翻卡學習
- [x] 基本導航 (上一張/下一張)
- [x] 進度顯示

### Phase 2 (進階功能)
- [ ] 學習進度追蹤 (LocalStorage)
- [ ] 標記「已學會」功能
- [ ] 複習模式 (只顯示未學會的卡片)
- [ ] 隨機模式 (打亂卡片順序)

### Phase 3 (互動增強)
- [ ] 語音發音 (Web Speech API)
- [ ] 觸控手勢 (左右滑動換卡)
- [ ] 自動播放模式
- [ ] 學習統計圖表

### Phase 4 (PWA)
- [ ] Service Worker (離線支援)
- [ ] App Manifest (安裝到桌面)
- [ ] Push Notifications (學習提醒)

## 開發時程估計

### Week 1: 基礎建設
- Day 1-2: Vite 專案初始化、相依套件安裝、資料搬移
- Day 3-4: TypeScript 型別定義、資料載入工具函式
- Day 5: 基本路由設定、頁面框架

### Week 2: 核心功能
- Day 1-2: FlashCard 元件開發 (翻轉動畫)
- Day 3: CardDeck 導航邏輯
- Day 4: LevelSelector 網格佈局
- Day 5: 整合測試、RWD 調整

### Week 3: 優化與部署
- Day 1-2: 效能最佳化、圖片載入優化
- Day 3: 跨瀏覽器測試、無障礙測試
- Day 4: 建置配置、部署設定
- Day 5: 文件撰寫、使用者手冊

## 部署建議

### 建置指令
```bash
npm run build
```

### 輸出目錄
```
dist/
├── index.html           # 入口 HTML
├── assets/              # JS/CSS bundles
│   ├── index-[hash].js
│   └── index-[hash].css
└── data/                # 單字資料與圖片 (從 public 複製)
    ├── level_1/
    └── ...
```

### 託管選項
1. **GitHub Pages** (推薦，免費)
   - 設定 `vite.config.ts` 的 `base: '/VBCards/'`
   - 推送到 `gh-pages` branch

2. **Netlify** (自動部署)
   - 連接 GitHub repo
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Vercel** (同 Netlify)
   - 零配置部署
   - 自動 HTTPS

4. **自架伺服器**
   - Nginx/Apache 設定 SPA fallback
   - 所有路由指向 index.html

## 測試計劃

### 單元測試
- [ ] dataLoader 函式測試 (載入 manifest)
- [ ] shuffle 函式測試 (陣列隨機)
- [ ] useFlashCards Hook 測試

### 元件測試
- [ ] FlashCard 翻轉行為測試
- [ ] CardDeck 導航測試
- [ ] LevelSelector 點擊測試

### 整合測試
- [ ] 路由導航測試 (Home → Learn)
- [ ] 資料載入流程測試
- [ ] 鍵盤操作測試

### E2E 測試 (可選)
- [ ] 完整學習流程 (選級數 → 學習 → 完成)
- [ ] 跨瀏覽器測試 (Chrome, Firefox, Safari)
- [ ] 行動裝置測試 (iOS, Android)

## 品質檢查清單

### 功能性
- [ ] 所有 18 個級數都能正常載入
- [ ] 圖片都能正確顯示
- [ ] 翻卡動畫流暢
- [ ] 導航功能正常 (上一張/下一張/鍵盤)
- [ ] 進度顯示正確

### 效能
- [ ] Lighthouse Performance > 90
- [ ] 首次內容繪製 (FCP) < 1.5s
- [ ] 最大內容繪製 (LCP) < 2.5s
- [ ] 建置檔案大小 < 500KB (不含圖片)

### 無障礙
- [ ] Lighthouse Accessibility > 90
- [ ] 鍵盤完全可操作
- [ ] ARIA 標籤完整
- [ ] 色彩對比度符合 WCAG AA

### 瀏覽器相容
- [ ] Chrome/Edge (最新版)
- [ ] Firefox (最新版)
- [ ] Safari (最新版)
- [ ] Mobile Safari (iOS 14+)
- [ ] Chrome Mobile (Android)

## 技術債務與風險

### 已知限制
1. **圖片大小**: 2.6GB 可能造成初次載入較慢
   - 緩解: 使用 CDN、圖片壓縮
2. **靜態資料**: 無法動態新增單字
   - 緩解: 提供資料更新流程說明
3. **無伺服器**: 無法同步學習進度到雲端
   - 緩解: 使用 LocalStorage，未來可加 Firebase

### 技術風險
1. **瀏覽器相容**: 舊版瀏覽器可能不支援 CSS 3D Transform
   - 緩解: 提供 fallback 方案 (簡單淡入淡出)
2. **行動裝置效能**: 大圖片可能造成卡頓
   - 緩解: 圖片壓縮、lazy loading
3. **SEO 限制**: SPA 對 SEO 較不友善
   - 緩解: 使用 Vite SSG 或 React Helmet

## 結論

VBCards 專案設計為輕量、高效、易用的單字學習工具。透過 React + Vite + TailwindCSS 的現代技術堆疊，能快速開發並部署為靜態網站。專案採用模組化架構，便於未來擴充進階功能。

下一步: 開始執行 IMPLEMENTATION_PLAN.md 中的 Stage 1 (專案初始化與資料整合)。
