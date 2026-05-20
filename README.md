## 會議英文教練 v1.0.0

第一個公開版本。這是一個給個人使用的英文口說回顧工具，
透過 Gemini 分析你自己的會議錄音，讓你知道下次開會前值得練哪些地方。

---

### 主要功能

- **轉錄**：上傳會議音訊（最大 15MB），用 Gemini 生成逐字稿
- **校對**：可手動修正逐字稿後再送分析
- **學習導向分析**：不是文法批改報告，而是「下次開會前可以怎麼練」
  - 本次最值得改的 3 個習慣
  - 下次開會前先練的句子
  - 逐句改善建議（口語自然版 / 商務穩妥版）
- **批次處理**：一次加入多個音訊依序跑完
- **回顧紀錄**：輕量歷史紀錄 + 收藏練習功能，存在瀏覽器 localStorage

---

## 介面預覽

### 設定頁面
![設定頁面](https://github.com/user-attachments/assets/07f949d5-6baa-4b5f-9703-bce912ad66bb)

### 分析結果
![分析結果](https://github.com/user-attachments/assets/1a69bcaf-389c-43ce-b3c4-3e0a94c2dfee)

![分析結果（詳細建議）](https://github.com/user-attachments/assets/ca1855a8-02dc-417f-8221-5acbbceec90d)

### 使用需求

- Node.js 20+
- 自備 [Gemini API key](https://aistudio.google.com/apikey)（免費）

### 快速開始

```bash
git clone https://github.com/benhuangtw/meeting-english-coach.git
cd meeting-english-coach
npm install
npm start
打開 http://127.0.0.1:5500，到設定頁貼上 API key 即可使用。

注意事項
音訊檔案會透過 Gemini API 送到 Google 處理，使用前請確認符合你的資料政策。
詳見 PRIVACY.md。


