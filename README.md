# RushMini 社畜を電車で運べ ![CI](https://github.com/yasshi2525/rushmini/workflows/CI/badge.svg) [![Maintainability](https://api.codeclimate.com/v1/badges/4c2f24fe6cc4bedd8093/maintainability)](https://codeclimate.com/github/yasshi2525/rushmini/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/4c2f24fe6cc4bedd8093/test_coverage)](https://codeclimate.com/github/yasshi2525/rushmini/test_coverage)

ニコニコゲームアツマール、ニコ生新市場用ゲーム [URL](https://game.nicovideo.jp/atsumaru/games/gm14288?key=bc2bab90a8a78)

# 利用方法

## 前提条件

- node.js  
  動作確認 v.14

- Akashic Engine, Sandbox  
  以下のコマンドを実行して Akashic Engine, Sandbox をインストールしてください

  ```
  npm install -g @akashic/akashic-cli @akashic/akashic-sandbox
  ```

## デプロイ方法

以下のコマンドを実行してできる `rushmini-latest.zip` をゲームとして登録してください

```
npm install
npm run build
akashic export html --output rushmini-latest.zip --atsumaru
```

## スタンドアロンアプリとしての実行方法

Port 3000 を利用する Web アプリケーションとして実行できます。`http://localhost:3000/game/` にアクセスするとゲームが実行されます

```
npm install
npm run build
npm start
```

## Docker コンテナとして実行

```
docker build .
<image id>
docker run -p 3000:3000 -d <image id>
```

# 開発者向け

## テスト実行

```
npm test
```

## Licence

MIT Licence

## Developer

yasshi2525 [Twitter](https://twitter.com/yasshi2525)
