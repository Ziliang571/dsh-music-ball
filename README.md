<p align="center">
  <img src="icon.svg" width="96" height="96" alt="dsh-music-ball icon">
</p>

# dsh-music-ball

A draggable music ball for the DeepSeek Harness Web UI. It stays out of the way as a black-and-white circular control, plays local audio, and opens into a compact control bar or a full library view.

[中文说明](#中文说明)

## Features

- **Draggable floating ball** — drag it anywhere; on release, or after a short idle period, it snaps to the nearest screen edge.
- **Optional half-hide** — the ball can tuck halfway into the nearest wall after 5, 10, or 30 seconds without interaction. Hover, click, or drag to reveal it. It can be limited to playback only, or turned off completely.
- **Rotating cover and progress ring** — the circular cover rotates while playing; a green ring around the ball shows playback progress.
- **Single click: quick controls** — song title and status, seekable progress bar, favorite, previous, play/pause, next, playback mode (sequence, repeat one, shuffle), vertical volume popover, and a playlist shortcut.
- **Double click: library view** — current track, playlist, favorites, music library, and custom collections, with search, play-all, and playlist reordering by drag or arrow buttons.
- **Local music library** — add audio files as copies, import a folder, or drop files into the library panel. Files are stored in IndexedDB and survive reloads.
- **Album covers** — embedded cover art is read from MP3/FLAC and, where the image is present as JPEG/PNG, from other container data. Covers can be zoomed globally or per track to trim wide white borders.
- **Custom ball icon** — the default is a black circular face with a white note. A user-supplied image can replace it.
- **Playlist vs library deletion** — removing a track from the playlist leaves the library copy alone. Deleting from the library removes the stored copy and references; it does not delete the source file unless the track came from an authorized folder import and the user explicitly chooses to delete it.
- **Source-aware deletion prompt** — the delete dialog offers "remove from library only" and, when available, "also delete source file". It includes a "do not show again" option. The preference can be re-enabled in settings.
- **First-run guide** — a one-time card explains dragging, clicking, double-clicking, and cover zoom; it can be replayed from settings.
- **Local-only state** — no network calls, analytics, or remote sync. Playlists, favorites, collections, covers, and audio blobs stay in the browser profile.

## Requirements

- DeepSeek Harness **0.2.x** Web UI (the plugin uses the `shell.overlay` client slot).
- A Chromium-based browser or the DSH Desktop renderer with IndexedDB enabled.
- Deleting a source file additionally requires the browser's File System Access API and a track imported through **Import folder**. This is not available in every browser; the option is disabled when it cannot work.

## Install

From npm, once published:

```sh
dsh plugin --profile desktop add dsh-music-ball
```

From a local checkout or release tarball:

```sh
dsh plugin --profile desktop add /absolute/path/to/dsh-music-ball
# or
dsh plugin --profile desktop add ./dsh-music-ball-1.0.0.tgz
```

Restart the Host if the plugin manager reports that a restart is required. A normal Web page refresh is enough for client-only updates.

## Usage

- **Drag** the ball to move it.
- **Single click** the ball for quick controls.
- **Double click** or **right-click** the ball for the full library view.
- In **Ball settings** (gear button in the library header):
  - change the floating icon;
  - adjust global and per-track cover zoom;
  - configure automatic half-hide and its delay;
  - toggle the library-delete confirmation;
  - replay the usage guide.

### Import modes

| Button | What it does | Source-file deletion |
| --- | --- | --- |
| **Add copy** | Reads selected files into the browser library. | Not available: the browser has no writable source path. |
| **Import folder** | Reads audio files from an authorized directory and remembers a directory handle. | Available when the user selected the folder and grants write permission at deletion time. |
| **Drop files** | Same as **Add copy**. | Not available. |

Deleting from the **playlist** only removes that playlist entry. Deleting from the **library** removes the stored copy, playlist references, favorites, and collection references. The source file remains unless the folder-authorized deletion path succeeds.

## Data and privacy

The plugin stores:

- audio blobs, covers, favorites, and per-track cover zoom in IndexedDB database `dsh-music-player`;
- playlist, collections, current track, and playback mode in the `meta` store;
- folder handles in the `sources` store when folder import is used;
- ball position, volume, mode, custom icon, onboarding state, and preference flags in `localStorage`.

No data leaves the browser. The plugin makes no network requests. Clearing site data or the relevant IndexedDB/localStorage entries removes the library and settings.

## Development

```sh
# from the repository root
node --check client.js
```

To load a local checkout:

```sh
dsh plugin --profile desktop add /absolute/path/to/dsh-music-ball
```

The package is intentionally build-free: `client.js` is plain JavaScript for DSH's client module loader, and `host.cjs` is the tiny CommonJS Host half required by the bundle.

## Known limitations

- Source-file deletion depends on the File System Access API and an authorized folder. Ordinary file selection cannot delete the original file.
- System media keys / `navigator.mediaSession` integration is not implemented.
- Album-art extraction supports common MP3 ID3 APIC and FLAC PICTURE data, plus a JPEG/PNG fallback scan; some containers or unusual tags may show the default note instead.
- The detail view is a single floating panel; it is not a separate route.
- Very large libraries are held in memory as metadata plus blobs; a future version could page the library.

## License

MIT. See [LICENSE](LICENSE).

---

## 中文说明

一个可拖动的 DeepSeek Harness Web UI 音乐悬浮球。默认是黑底白音符的圆形图标，播放时旋转圆形专辑封面，并在外圈显示绿色进度环。

### 主要功能

- 拖动悬浮球，松手后吸附到最近屏幕边缘；可设置 5/10/30 秒无操作后半隐身，也可仅在播放时半隐身。
- 单击显示控制条：歌名与状态、进度条、收藏、上一首、播放/暂停、下一首、顺序/单曲循环/随机、垂直音量托条、播放列表入口。
- 双击或右键打开详情：当前曲目、播放列表、我的收藏、音乐库、自定义收藏夹，支持搜索、播放全部和拖拽/按钮排序。
- 支持本地音频导入、文件夹导入、拖放；音频和封面保存在浏览器 IndexedDB 中。
- 支持专辑封面、全局/单曲封面缩放、自定义悬浮球图标。
- 播放列表删除不影响音乐库；音乐库删除只移除浏览器中的副本。只有通过「导入文件夹」授权添加的曲目，才可以选择同时删除源文件。
- 删除确认弹窗支持“以后不再显示”，可在悬浮球设置中重新开启。
- 首次使用会显示操作提示，可在设置中重新查看。

### 安装

```sh
dsh plugin --profile desktop add dsh-music-ball
```

或从本地目录 / tarball 安装：

```sh
dsh plugin --profile desktop add /绝对路径/dsh-music-ball
```

### 数据与隐私

插件不发起网络请求。音频、封面、收藏和播放列表保存在浏览器本地；清理站点数据会移除音乐库和设置。

### 限制

普通文件选择导入无法删除源文件，这是浏览器安全限制；只有「导入文件夹」并在删除时授予写权限，才可删除源文件。暂未接入系统媒体键。
