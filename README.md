# VBCards - 單字翻卡學習系統

英文單字記憶學習網頁應用程式，使用翻卡互動方式幫助學生記憶單字。

## ✨ 功能特色

- **18 個級數**: 從基礎級到進階級，共 18 個學習級數
- **創新翻卡設計**:
  - **正面**: 中文意思 + 視覺化圖片（先看中文，猜英文）
  - **背面**: 英文單字 + 詳細解釋 + 例句
- **3D 翻轉動畫**: 流暢的卡片翻轉效果，提升學習體驗
- **進度追蹤**: 即時顯示學習進度（第幾張 / 總共幾張）
- **鍵盤快捷鍵**: 支援空白鍵翻卡、方向鍵切換
- **響應式設計**: 支援手機、平板、桌面裝置
- **零後端**: 純靜態網頁，可離線存取

## 🚀 快速開始

### 安裝相依套件

```bash
npm install
# 或
pnpm install
```

### 啟動開發伺服器

```bash
npm run dev
# 或
pnpm dev
```

開發伺服器預設執行在 `http://localhost:5173`

### 建置生產版本

```bash
npm run build
# 或
pnpm build
```

建置輸出位於 `dist/` 目錄

### 預覽建置結果

```bash
npm run preview
# 或
pnpm preview
```

## 📁 專案結構

```
VBCards/
├── public/
│   └── data/              # 單字資料與圖片（2.6GB）
│       ├── level_1/       # 級數 1 圖片
│       ├── level_1_manifest.json
│       └── ...            # 級數 2-18
├── src/
│   ├── components/        # React 元件
│   │   ├── FlashCard.tsx       # 翻卡元件（3D動畫）
│   │   ├── LevelSelector.tsx   # 級數選擇器
│   │   └── ProgressBar.tsx     # 進度條
│   ├── pages/             # 頁面元件
│   │   ├── Home.tsx            # 首頁（級數選擇）
│   │   └── Learn.tsx           # 學習頁面
│   ├── hooks/             # 自訂 Hooks
│   │   ├── useFlashCards.ts    # 翻卡狀態管理
│   │   └── useLevelData.ts     # 資料載入
│   ├── types/             # TypeScript 型別
│   │   └── vocabulary.ts
│   ├── utils/             # 工具函式
│   │   ├── dataLoader.ts       # 資料載入工具
│   │   └── shuffle.ts          # 隨機排序
│   ├── App.tsx            # 路由設定
│   ├── main.tsx           # 進入點
│   └── index.css          # 全域樣式 + Tailwind
├── IMPLEMENTATION_PLAN.md # 實作計劃
├── PROJECT_SUMMARY.md     # 專案總結
└── package.json
```

## 🎮 使用方式

### 網頁操作

1. **選擇級數**: 在首頁點擊任一級數卡片
2. **翻卡學習**:
   - 看到中文意思和圖片（正面）
   - 點擊卡片翻轉，查看英文單字和詳解（背面）
3. **切換卡片**: 使用「上一張」「下一張」按鈕
4. **返回首頁**: 點擊左上角「返回級數選擇」

### 鍵盤快捷鍵

- <kbd>空白鍵</kbd> - 翻卡
- <kbd>←</kbd> - 上一張卡片
- <kbd>→</kbd> - 下一張卡片
- <kbd>ESC</kbd> - 返回級數選擇頁面

## 🛠 技術架構

- **框架**: React 19 + TypeScript
- **建置工具**: Vite 5
- **樣式**: Tailwind CSS 4.0
- **路由**: React Router DOM 7.1
- **動畫**: CSS 3D Transforms

## 📊 資料格式

每個級數的 manifest JSON 檔案結構:

```json
{
  "level": 1,
  "levelName": "英文單字認讀基礎級(一)",
  "totalWords": 33,
  "results": [
    {
      "word": "hello",
      "meaning": "哈囉、你好",
      "filename": "0001_hello.png",
      "level": 1,
      "id": 1
    }
  ]
}
```

## 🚀 部署

建置完成後，將 `dist/` 目錄內容部署到任何靜態網頁託管服務:

- **GitHub Pages**: 免費，需設定 base path
- **Netlify**: 自動部署，零配置
- **Vercel**: 支援 Vite，極速部署
- **AWS S3 + CloudFront**: 企業級方案

### GitHub Pages 部署範例

```bash
# 1. 在 vite.config.ts 設定 base
export default defineConfig({
  base: '/VBCards/',
  // ...
})

# 2. 建置
npm run build

# 3. 部署到 gh-pages branch
# (使用 gh-pages 套件或手動推送)
```

## 🌐 瀏覽器支援

- Chrome/Edge (最新版) ✅
- Firefox (最新版) ✅
- Safari (最新版) ✅
- iOS Safari (iOS 14+) ✅
- Chrome Mobile (Android) ✅

## 📝 授權

此專案為 Boyo VB Online 後端系統的子專案。

## 🔗 相關文件

- [實作計劃](./IMPLEMENTATION_PLAN.md) - 詳細開發階段與規格
- [專案總結](./PROJECT_SUMMARY.md) - 技術決策與架構設計

---

Made with ❤️ for English learners
