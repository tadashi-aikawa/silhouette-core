<div align="center">
    <h1>Silhouette Core</h1>
    <p>
    <div><a href="https://github.com/tadashi-aikawa/silhouette">Silhouette</a>のコアロジックを切り離したライブラリ</div>
    </p>
    <a href="https://github.com/tadashi-aikawa/silhouette-core/releases/latest"><img src="https://img.shields.io/github/release/tadashi-aikawa/silhouette-core.svg" /></a>
    <a href="https://github.com/tadashi-aikawa/silhouette-core/actions"><img src="https://github.com/tadashi-aikawa/silhouette-core/workflows/CI/badge.svg" /></a>
    <img src="https://img.shields.io/github/downloads/tadashi-aikawa/silhouette-core/total" />
</div>

> [!WARNING]
> v1に達していますが実際は達していません。semantic-releaseの挙動が想定と異なり1.0.0となってしまい、そのままJSRに登録され削除しなかったためそのままにしています。(一度バージョンつきでpublishするとJSRリポジトリから削除できない仕様のため)
> v2がいわゆるv1という位置づけで開発を続けます。

## インストール

TODO

## 開発者向け

### 準備

以下でhooksの場所を変更する。

```bash
git config core.hooksPath hooks
```

### リリース

[Release Action](https://github.com/tadashi-aikawa/silhouette-core/actions/workflows/release.yaml) を実行。

