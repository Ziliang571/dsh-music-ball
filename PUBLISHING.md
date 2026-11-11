# Publishing

This document is the release checklist for `dsh-music-ball`.

## Current state

`dsh-music-ball` 1.0.0 is published on GitHub:

- repository: https://github.com/Ziliang571/dsh-music-ball
- release: https://github.com/Ziliang571/dsh-music-ball/releases/tag/v1.0.0
- release asset: `dsh-music-ball-1.0.0.tgz`
- catalog Draft PR: https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/14415
- topic: `dsh-plugin`

npm has not been published because the maintainer npm session is not authenticated.
The catalog entry installs from the GitHub release tarball instead.

The catalog requires the plugin repository to be at least **1 day old**. The Draft PR
was opened on 2026-11-11 and should be marked **Ready for review** after the age gate
passes. When the PR is ready, no code changes are required.

### Publish the repository from GitHub Desktop

The repository is already pushed; this section is kept for a fresh checkout.

1. Open **GitHub Desktop → File → Add Local Repository**.
2. Select `D:\20319\Documents\dsh-plugins\dsh-music-ball`.
3. Click **Publish repository**.
4. Owner `Ziliang571`, name `dsh-music-ball`, visibility **Public**.
5. After publishing, add the **`dsh-plugin`** topic on GitHub.

Because of the missing terminal credentials, npm publishing and the catalog PR
cannot be executed from this machine without a maintainer login.

## 1. npm package

The npm name `dsh-music-ball` was checked and returned **404 / available** on 2026-11-11.

```sh
cd dsh-music-ball
npm login
npm publish --access public
```

The package already declares:

- `dsh.bundle.patch`
- `dsh.client.platform: web`
- a `./client` export
- `README.md`, `CHANGELOG.md`, `LICENSE`, locale resources, and a black/white SVG icon

## 2. GitHub repository

Create `Ziliang571/dsh-music-ball`, push this directory, and add the **`dsh-plugin`** topic.

The official catalog requires:

- a repository at least **1 day old**;
- **10 or more commits**;
- active maintenance;
- a real, working implementation;
- a `dsh.bundle` declaration (present);
- the `dsh-plugin` topic.

The repository URL in `package.json` is the intended target and should be kept only if that repository is created.

## 3. Release tarball (optional, recommended)

Build a prebuilt archive and attach it to the GitHub release:

```sh
npm pack
```

This creates `dsh-music-ball-1.0.0.tgz`. No build step is required; the client is plain JavaScript. Attach it to the `v1.0.0` release. If using a tarball, add the release URL to the catalog entry:

```yaml
tarball: https://github.com/Ziliang571/dsh-music-ball/releases/latest/download/dsh-music-ball-1.0.0.tgz
```

## 4. Marketplace catalog entry

The market is `awesome-dsh-plugin` (https://github.com/awesome-dsh-plugin/awesome-dsh-plugin), not the `dshmarket` app repository.

Add this file at `data/plugins/Ziliang571__dsh-music-ball.yml`:

```yaml
url: https://github.com/Ziliang571/dsh-music-ball
name: Ziliang571/dsh-music-ball
category: fun
description:
  en: 'Draggable music ball for the DSH Web UI with a local library, album covers, playlist, favorites, collections, cover zoom, auto-hide, and source-aware deletion.'
  zh: 可拖动的 DSH Web UI 音乐悬浮球，支持本地音乐库、专辑封面、播放列表、收藏夹、封面缩放、半隐身与源文件删除提示。
```

The same file is available at [`docs/marketplace/Ziliang571__dsh-music-ball.yml`](docs/marketplace/Ziliang571__dsh-music-ball.yml) for copy/paste. A ready-to-use PR title/body and checklist are in [`docs/marketplace/PR.md`](docs/marketplace/PR.md).

Then:

```sh
npm ci
node scripts/generate-readme.mjs
```

Commit the new YAML and regenerated READMEs, push a branch, and open a PR against `awesome-dsh-plugin`. The catalog site and the `dshmarket` plugin pick up merged entries automatically, typically within a day.

## 5. Post-release checks

```sh
npm view dsh-music-ball version
dsh plugin --profile desktop add dsh-music-ball
```

Verify the plugin row appears in **Settings → Plugins**, the icon/title resolve, and the ball is present in `shell.overlay`.

## Notes on source deletion

The package uses the browser File System Access API only for tracks imported through **Import folder**. Ordinary file selection has no writable path, so the source-delete option is disabled for those tracks. This is a browser constraint, not a packaging defect.
