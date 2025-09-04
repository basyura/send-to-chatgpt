# ChatGPT SumUp

指定されたサイトの URL を ChatGPT で開いて要約を表示するための Chrome 拡張です｡

以下のような url を生成して開きます｡
- https://chatgpt.com/?q={Summarize Message}%0A{Tab's Url}

例:
- https://chatgpt.com/?q=Summarize%0Ahttps%3A%2F%2Fblog.jxck.io%2Fentries%2F2025-09-03%2Fnx-incidents.html


## 開発 / ビルド

- 依存のインストール: `npm install`
- 開発ウォッチ: `npm run dev` (出力は `dist/`)
- 本番ビルド: `npm run build`

ビルド後、Chrome → 拡張機能 → デベロッパーモード → 「パッケージ化されていない拡張機能を読み込む」で `dist/` を選択してください。

この拡張はツールバーボタン、またはページのコンテキストメニューから実行でき、現在のタブの URL と固定プロンプト `Summarize` を結合して ChatGPT を開きます。

