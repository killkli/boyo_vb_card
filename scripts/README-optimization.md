# 圖片優化工具使用說明

## 概述

此腳本用於優化 `public/data` 目錄下的圖片檔案,支援 PNG 壓縮和 WebP 格式轉換。

**重要**: 腳本不會改變圖片尺寸 (保持原始 1024x1024),只進行壓縮和格式轉換。

## 安裝必要工具

### 1. 安裝 Homebrew (如果尚未安裝)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. 安裝圖片優化工具

```bash
# 安裝 WebP 工具 (用於 WebP 格式轉換)
brew install webp

# 安裝 pngquant (用於 PNG 壓縮)
brew install pngquant
```

### 3. 給予腳本執行權限

```bash
chmod +x scripts/optimize-images.sh
```

## 使用方法

### 基本用法

```bash
# 轉換為 WebP 格式 (預設,輸出到 public/data-optimized)
./scripts/optimize-images.sh

# 只優化 PNG (不轉換格式)
./scripts/optimize-images.sh --format png

# 同時產生 WebP 和優化的 PNG
./scripts/optimize-images.sh --format both
```

### 進階選項

```bash
# 調整品質 (0-100,預設 85)
./scripts/optimize-images.sh --quality 90

# 先執行 dry-run 看看會發生什麼
./scripts/optimize-images.sh --dry-run

# 在轉換前先備份
./scripts/optimize-images.sh --backup

# 直接覆蓋原始檔案 (危險!)
./scripts/optimize-images.sh --format png --in-place --backup
```

### 完整範例

```bash
# 推薦: 先測試看看
./scripts/optimize-images.sh --dry-run

# 轉換為 WebP,品質 85,建立備份
./scripts/optimize-images.sh --format webp --quality 85 --backup

# 優化 PNG 並同時產生 WebP
./scripts/optimize-images.sh --format both --quality 80
```

## 選項說明

| 選項 | 說明 | 預設值 |
|------|------|--------|
| `--quality <0-100>` | 壓縮品質 (數字越高品質越好但檔案越大) | 85 |
| `--format <format>` | 輸出格式: `webp`, `png`, 或 `both` | webp |
| `--backup` | 優化前先備份原始檔案 | 不備份 |
| `--dry-run` | 模擬執行,不實際修改檔案 | 關閉 |
| `--in-place` | 直接覆蓋原始檔案 (僅用於 PNG) | 關閉 |
| `--help` | 顯示幫助訊息 | - |

## 預期效果

根據初步分析:

- **原始資料**: 1,201 張 PNG,總大小 1.3GB
- **WebP 轉換**: 預期可減少 70-80% 檔案大小 (約 260-390MB)
- **PNG 優化**: 預期可減少 30-50% 檔案大小 (約 650-910MB)

## 輸出目錄

預設情況下,優化後的圖片會儲存到:

```
public/data-optimized/
├── level_2/
├── level_4/
├── level_10/
└── ...
```

保持與原始目錄相同的結構。

## 注意事項

1. **備份建議**: 第一次執行建議加上 `--backup` 選項
2. **測試先行**: 使用 `--dry-run` 先查看會發生什麼
3. **品質調整**:
   - 品質 80-85: 適合一般網頁使用,檔案小
   - 品質 90-95: 高品質,檔案較大
4. **格式選擇**:
   - `webp`: 檔案最小,現代瀏覽器支援
   - `png`: 相容性最好,檔案較大
   - `both`: 可依瀏覽器支援度選用

## 整合到專案

轉換完成後,你可能需要:

1. 更新程式碼中的圖片路徑
2. 實作 WebP fallback 機制
3. 設定適當的 cache headers

範例 (使用 HTML picture 標籤):

```html
<picture>
  <source srcset="/data-optimized/level_4/0143_sleep.webp" type="image/webp">
  <img src="/data/level_4/0143_sleep.png" alt="Sleep">
</picture>
```

## 故障排除

### cwebp not found

```bash
brew install webp
```

### pngquant not found

```bash
brew install pngquant
```

### 權限錯誤

```bash
chmod +x scripts/optimize-images.sh
```

### 腳本執行失敗

檢查是否在專案根目錄執行:

```bash
pwd  # 應該顯示 .../VBCards
```

## 效能建議

- 1,201 張圖片處理時間約 5-15 分鐘 (視 CPU 效能)
- 可考慮先用少量圖片測試
- 建議在非尖峰時段執行

## 清理

如果想移除優化後的檔案:

```bash
rm -rf public/data-optimized
```

如果想恢復備份:

```bash
# 備份目錄名稱範例: public/data_backup_20231017_123456
rm -rf public/data
mv public/data_backup_YYYYMMDD_HHMMSS public/data
```
