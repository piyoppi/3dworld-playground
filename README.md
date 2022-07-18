# 3dworld-playground

3D関連開発をいろいろお試しするプロジェクト

## 開発サーバの起動

依存ライブラリをインストールする。
現状はレンダリングを [three.js](https://threejs.org/) に頼っているため、関連ライブラリが必要。

```
npm i
```

コンテンツ配信用のローカルサーバを起動する

```
docker-compose up
```

TypeScriptをトランスパイルする

```
npm run watch
```

## アプリケーション

- http://localhost:8080/src/avatar-viewer/
