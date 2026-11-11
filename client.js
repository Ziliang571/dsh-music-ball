window.__ModuleLoader__.load({
  id: 'dsh-music-ball',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const DB_NAME = 'dsh-music-player';
    const DB_VERSION = 2;
    const BALL_SIZE = 64;
    const EDGE = 12;
    const MAX_FILE_SIZE = 200 * 1024 * 1024;
    const MAX_ICON_SIZE = 12 * 1024 * 1024;
    const AUDIO_EXTENSION = /\.(mp3|wav|ogg|oga|m4a|aac|flac|opus|webm|weba|wma|aiff?|mp4)$/i;
    const POSITION_KEY = 'dsh-music-player.ball';
    const VOLUME_KEY = 'dsh-music-player.volume';
    const MODE_KEY = 'dsh-music-player.mode';
    const LAST_KEY = 'dsh-music-player.last';
    const ICON_KEY = 'dsh-music-player.icon';
    const DELETE_CONFIRM_KEY = 'dsh-music-player.confirm-delete';
    const AUTO_HIDE_KEY = 'dsh-music-player.auto-hide';
    const AUTO_HIDE_DELAY_KEY = 'dsh-music-player.auto-hide-delay';
    const AUTO_HIDE_PLAYING_KEY = 'dsh-music-player.auto-hide-playing';
    const COVER_ZOOM_KEY = 'dsh-music-player.cover-zoom';
    const ONBOARDING_KEY = 'dsh-music-player.onboarding-seen';
    const RING_RADIUS = 29;
    const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

    const CSS = `
      .dsh-music-ball {
        --dsh-music-green: var(--dsw-alias-state-success-primary, #22c55e);
        position: fixed;
        z-index: 100;
        width: 64px;
        height: 64px;
        padding: 0;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: var(--dsw-alias-label-primary);
        cursor: grab;
        pointer-events: auto;
        touch-action: none;
        user-select: none;
        transition: left .26s cubic-bezier(.2, .8, .2, 1), top .26s cubic-bezier(.2, .8, .2, 1), transform .16s ease;
      }
      .dsh-music-ball.is-snapping {
        transition: left .26s cubic-bezier(.2, .8, .2, 1), top .26s cubic-bezier(.2, .8, .2, 1), transform .16s ease;
      }
      .dsh-music-ball.is-dragging {
        cursor: grabbing;
        transition: none;
        transform: scale(1.06);
      }
      .dsh-music-ball:hover { transform: scale(1.04); }
      .dsh-music-ball.is-dragging:hover { transform: scale(1.06); }
      .dsh-music-ball:focus-visible {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 4px;
      }
      .dsh-music-ring {
        position: absolute;
        inset: 0;
        z-index: 2;
        width: 64px;
        height: 64px;
        overflow: visible;
        pointer-events: none;
        transform: rotate(-90deg);
      }
      .dsh-music-ring-track {
        fill: none;
        stroke: var(--dsw-alias-border-l2);
        stroke-width: 2;
        opacity: .55;
      }
      .dsh-music-ring-progress {
        fill: none;
        stroke: var(--dsh-music-green);
        stroke-width: 2.8;
        stroke-linecap: round;
        transition: stroke-dashoffset .26s linear;
      }
      .dsh-music-ball.is-playing .dsh-music-ring-progress {
        filter: drop-shadow(0 0 3px rgba(34, 197, 94, .55));
      }
      .dsh-music-ball-disc {
        position: absolute;
        inset: 2px;
        z-index: 1;
        display: block;
        overflow: hidden;
        border-radius: 50%;
        background: #0b0b0c;
        color: #ffffff;
        box-shadow: 0 8px 24px rgba(0, 0, 0, .28), inset 0 0 0 1px rgba(255, 255, 255, .24);
        -webkit-clip-path: circle(50% at 50% 50%);
        clip-path: circle(50% at 50% 50%);
      }
      .dsh-music-ball.is-playing .dsh-music-ball-disc {
        box-shadow: 0 8px 26px rgba(0, 0, 0, .32), inset 0 0 0 1px rgba(255, 255, 255, .32);
      }
      .dsh-music-ball-spin {
        display: block;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        -webkit-clip-path: circle(50% at 50% 50%);
        clip-path: circle(50% at 50% 50%);
        animation: dsh-music-spin 9s linear infinite;
        animation-play-state: paused;
      }
      .dsh-music-ball-disc .dsh-music-cover {
        border-radius: 50%;
        -webkit-clip-path: circle(50% at 50% 50%);
        clip-path: circle(50% at 50% 50%);
      }
      .dsh-music-ball.is-playing .dsh-music-ball-spin {
        animation-play-state: running;
      }
      @keyframes dsh-music-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .dsh-music-cover {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: inherit;
        background: #0b0b0c;
        color: #ffffff;
      }
      .dsh-music-cover img {
        position: absolute;
        inset: 0;
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .dsh-music-ball-disc .dsh-music-cover img,
      .dsh-music-appearance-ball .dsh-music-cover img {
        transform: scale(var(--dsh-music-cover-scale, 1));
        transform-origin: center;
      }

      .dsh-music-mini,
      .dsh-music-detail {
        position: fixed;
        z-index: 101;
        pointer-events: auto;
        border: 1px solid var(--dsw-alias-border-l1);
        background: var(--dsw-alias-bg-overlay);
        color: var(--dsw-alias-label-primary);
        box-shadow: 0 18px 52px rgba(0, 0, 0, .3), 0 2px 8px rgba(0, 0, 0, .12);
        font-family: inherit;
        animation: dsh-music-pop .15s ease-out;
        transition: left .18s ease, top .18s ease;
      }
      @keyframes dsh-music-pop {
        from { opacity: 0; transform: translateY(6px) scale(.985); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .dsh-music-mini {
        display: flex;
        flex-direction: column;
        gap: 7px;
        padding: 10px 11px 9px;
        border-radius: 15px;
      }
      .dsh-music-mini-head {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }
      .dsh-music-mini-cover {
        flex: none;
        width: 30px;
        height: 30px;
        overflow: hidden;
        border-radius: 50%;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .16);
      }
      .dsh-music-mini-meta { min-width: 0; flex: 1; }
      .dsh-music-mini-kicker {
        color: var(--dsw-alias-label-secondary);
        font-size: 9px;
        font-weight: 650;
        letter-spacing: .07em;
        line-height: 1.2;
        text-transform: uppercase;
      }
      .dsh-music-mini-title {
        display: block;
        overflow: hidden;
        width: 100%;
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 14px;
        font-weight: 650;
        line-height: 1.3;
        letter-spacing: -.01em;
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
      }
      .dsh-music-mini-title:hover { color: var(--dsw-alias-brand-primary); }
      .dsh-music-mini-title:focus-visible {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 1px;
      }
      .dsh-music-mini-status {
        display: block;
        overflow: hidden;
        margin-top: 2px;
        color: var(--dsw-alias-label-secondary);
        font-size: 9px;
        line-height: 1.25;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dsh-music-mini-sub {
        overflow: hidden;
        color: var(--dsw-alias-label-secondary);
        font-size: 9px;
        line-height: 1.2;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dsh-music-mini-progress {
        display: flex;
        flex-direction: column;
        flex: none;
      }
      .dsh-music-mini-range { height: 3px; }
      .dsh-music-mini-times {
        display: flex;
        justify-content: space-between;
        margin-top: 2px;
        color: var(--dsw-alias-label-secondary);
        font-size: 8px;
        font-variant-numeric: tabular-nums;
      }
      .dsh-music-volume-anchor {
        position: relative;
        display: inline-flex;
      }
      .dsh-music-volume-pop {
        position: absolute;
        right: -5px;
        bottom: calc(100% + 7px);
        z-index: 4;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 104px;
        padding: 8px 0 14px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 10px;
        background: var(--dsw-alias-bg-overlay);
        box-shadow: 0 10px 26px rgba(0, 0, 0, .28);
      }
      .dsh-music-volume-pop.is-down {
        top: calc(100% + 7px);
        bottom: auto;
      }
      .dsh-music-volume-slider {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 82px;
        height: 3px;
        transform: translate(-50%, -50%) rotate(-90deg);
        transform-origin: center;
      }
      .dsh-music-volume-value {
        position: absolute;
        bottom: 4px;
        left: 50%;
        color: var(--dsw-alias-label-secondary);
        font-size: 8px;
        line-height: 1;
        transform: translateX(-50%);
      }
      .dsh-music-mini-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2px;
      }
      .dsh-music-mini-btn {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        padding: 0;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        cursor: pointer;
      }
      .dsh-music-mini-btn:hover {
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-primary);
      }
      .dsh-music-mini-btn:disabled {
        opacity: .32;
        cursor: default;
      }
      .dsh-music-mini-btn.is-active { color: var(--dsw-alias-brand-primary); }
      .dsh-music-mini-btn.is-favorite { color: #ef4444; }
      .dsh-music-mode-one {
        position: absolute;
        right: 5px;
        bottom: 3px;
        font-size: 7px;
        font-weight: 700;
        line-height: 1;
      }
      .dsh-music-mini-play {
        width: 36px;
        height: 36px;
        background: var(--dsw-alias-brand-primary);
        color: var(--dsw-alias-bg-base);
        box-shadow: 0 4px 12px rgba(79, 124, 255, .28);
      }
      .dsh-music-mini-play:hover {
        background: var(--dsw-alias-brand-primary);
        color: var(--dsw-alias-bg-base);
        filter: brightness(1.06);
      }
      .dsh-music-mini-divider {
        width: 1px;
        height: 20px;
        margin: 0 1px;
        background: var(--dsw-alias-border-l1);
      }
      .dsh-music-mini-error {
        overflow: hidden;
        color: var(--dsw-alias-state-error-primary);
        font-size: 9px;
        line-height: 1.25;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .dsh-music-detail {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 17px;
      }
      .dsh-music-detail-head {
        display: flex;
        align-items: center;
        gap: 7px;
        flex: none;
        padding: 10px 10px 8px 13px;
      }
      .dsh-music-detail-title {
        margin: 0;
        font-size: 13px;
        font-weight: 650;
        line-height: 1.2;
      }
      .dsh-music-detail-count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        height: 17px;
        padding: 0 5px;
        border-radius: 999px;
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-secondary);
        font-size: 10px;
        font-variant-numeric: tabular-nums;
      }
      .dsh-music-detail-head-actions {
        display: flex;
        align-items: center;
        gap: 2px;
        margin-left: auto;
      }
      .dsh-music-iconbtn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 27px;
        height: 27px;
        padding: 0;
        border: 0;
        border-radius: 7px;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        cursor: pointer;
      }
      .dsh-music-iconbtn:hover {
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-primary);
      }
      .dsh-music-iconbtn.is-active { color: var(--dsw-alias-brand-primary); }
      .dsh-music-iconbtn.is-favorite { color: #ef4444; }
      .dsh-music-iconbtn.is-danger:hover { color: var(--dsw-alias-state-error-primary); }
      .dsh-music-iconbtn:disabled { opacity: .32; cursor: default; }
      .dsh-music-iconbtn:focus-visible,
      .dsh-music-mini-btn:focus-visible,
      .dsh-music-tab:focus-visible,
      .dsh-music-rowmain:focus-visible,
      .dsh-music-rowbtn:focus-visible,
      .dsh-music-btn:focus-visible {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 1px;
      }

      .dsh-music-detail-now {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: none;
        padding: 7px 14px 7px;
      }
      .dsh-music-detail-cover {
        flex: none;
        width: 48px;
        height: 48px;
        overflow: hidden;
        border-radius: 13px;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .16), 0 5px 14px rgba(0, 0, 0, .18);
      }
      .dsh-music-detail-nowmeta { min-width: 0; flex: 1; }
      .dsh-music-detail-kicker {
        color: var(--dsw-alias-label-secondary);
        font-size: 9px;
        font-weight: 650;
        letter-spacing: .07em;
        text-transform: uppercase;
      }
      .dsh-music-detail-name {
        overflow: hidden;
        font-size: 14px;
        font-weight: 650;
        line-height: 1.3;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dsh-music-detail-sub {
        overflow: hidden;
        margin-top: 2px;
        color: var(--dsw-alias-label-secondary);
        font-size: 9px;
        line-height: 1.25;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dsh-music-detail-nowactions {
        display: flex;
        align-items: center;
        gap: 2px;
        flex: none;
      }
      .dsh-music-detail-play {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        padding: 0;
        border: 0;
        border-radius: 50%;
        background: var(--dsw-alias-brand-primary);
        color: var(--dsw-alias-bg-base);
        cursor: pointer;
      }
      .dsh-music-detail-play:hover { filter: brightness(1.06); }
      .dsh-music-detail-play:focus-visible {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 2px;
      }
      .dsh-music-detail-seek {
        flex: none;
        padding: 0 14px 9px;
      }
      .dsh-music-range {
        --dsh-music-pct: 0%;
        -webkit-appearance: none;
        appearance: none;
        display: block;
        width: 100%;
        height: 4px;
        margin: 0;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: linear-gradient(to right, var(--dsw-alias-brand-primary) 0 var(--dsh-music-pct), var(--dsw-alias-bg-layer-2) var(--dsh-music-pct) 100%);
        cursor: pointer;
      }
      .dsh-music-range:disabled { opacity: .55; cursor: default; }
      .dsh-music-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 11px;
        height: 11px;
        border: 2px solid var(--dsw-alias-bg-overlay);
        border-radius: 50%;
        background: var(--dsw-alias-brand-primary);
        box-shadow: 0 0 0 1px var(--dsw-alias-border-l2);
      }
      .dsh-music-range::-moz-range-thumb {
        width: 8px;
        height: 8px;
        border: 2px solid var(--dsw-alias-bg-overlay);
        border-radius: 50%;
        background: var(--dsw-alias-brand-primary);
      }
      .dsh-music-times {
        display: flex;
        justify-content: space-between;
        margin-top: 4px;
        color: var(--dsw-alias-label-secondary);
        font-size: 9px;
        font-variant-numeric: tabular-nums;
      }

      .dsh-music-error {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        flex: none;
        margin: 0 10px 7px;
        padding: 6px 8px 6px 10px;
        border: 1px solid var(--dsw-alias-state-error-primary);
        border-radius: 8px;
        color: var(--dsw-alias-state-error-primary);
        font-size: 10px;
        line-height: 1.35;
      }
      .dsh-music-error span { flex: 1; }
      .dsh-music-error button {
        flex: none;
        width: 16px;
        height: 16px;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
        font: inherit;
        line-height: 1;
      }

      .dsh-music-tabs {
        display: flex;
        align-items: center;
        gap: 1px;
        flex: none;
        overflow-x: auto;
        padding: 0 8px;
        border-bottom: 1px solid var(--dsw-alias-border-l1);
        scrollbar-width: none;
      }
      .dsh-music-tabs::-webkit-scrollbar { display: none; }
      .dsh-music-tab {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        flex: none;
        height: 34px;
        padding: 0 8px;
        border: 0;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        font: inherit;
        font-size: 10px;
        cursor: pointer;
        white-space: nowrap;
      }
      .dsh-music-tab:hover { color: var(--dsw-alias-label-primary); }
      .dsh-music-tab.is-active { color: var(--dsw-alias-label-primary); font-weight: 650; }
      .dsh-music-tab.is-active::after {
        position: absolute;
        right: 8px;
        bottom: -1px;
        left: 8px;
        height: 2px;
        border-radius: 2px;
        background: var(--dsw-alias-brand-primary);
        content: '';
      }
      .dsh-music-tabcount {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 15px;
        height: 14px;
        padding: 0 4px;
        border-radius: 999px;
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-secondary);
        font-size: 8px;
        font-weight: 500;
      }
      .dsh-music-content {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 6px 7px 10px;
        scrollbar-width: thin;
      }
      .dsh-music-search {
        display: flex;
        align-items: center;
        gap: 5px;
        flex: none;
        padding: 6px 10px 3px;
      }
      .dsh-music-searchicon {
        display: inline-flex;
        flex: none;
        margin-left: 2px;
        color: var(--dsw-alias-label-secondary);
      }
      .dsh-music-search input {
        flex: 1;
        min-width: 0;
        height: 28px;
        padding: 0 9px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 8px;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-primary);
        font: inherit;
        font-size: 10px;
      }
      .dsh-music-search input:focus {
        outline: 2px solid var(--dsw-alias-brand-primary);
        outline-offset: 0;
      }
      .dsh-music-sectionhead {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        padding: 3px 5px 7px;
        color: var(--dsw-alias-label-secondary);
        font-size: 9px;
      }
      .dsh-music-tip {
        position: fixed;
        z-index: 103;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px 13px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 14px;
        background: var(--dsw-alias-bg-overlay);
        color: var(--dsw-alias-label-primary);
        box-shadow: 0 18px 48px rgba(0, 0, 0, .3);
        font-family: inherit;
        font-size: 10px;
        line-height: 1.4;
        animation: dsh-music-pop .15s ease-out;
      }
      .dsh-music-tip-title {
        font-size: 12px;
        font-weight: 650;
      }
      .dsh-music-tip-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
        color: var(--dsw-alias-label-secondary);
      }
      .dsh-music-tip-row {
        display: flex;
        align-items: flex-start;
        gap: 6px;
      }
      .dsh-music-tip-row svg { flex: none; margin-top: 1px; color: var(--dsw-alias-brand-primary); }
      .dsh-music-tip-actions {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
      }
      .dsh-music-setting-section {
        padding: 0 0 10px;
        margin: 0 0 10px;
        border-bottom: 1px solid var(--dsw-alias-border-l1);
      }
      .dsh-music-setting-section:last-of-type {
        padding-bottom: 0;
        margin-bottom: 0;
        border-bottom: 0;
      }
      .dsh-music-setting-title {
        margin: 0 0 4px;
        color: var(--dsw-alias-label-primary);
        font-size: 10px;
        font-weight: 650;
      }
      .dsh-music-setting-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-top: 6px;
      }
      .dsh-music-setting-rowlabel { min-width: 0; flex: 1; }
      .dsh-music-setting-value {
        flex: none;
        color: var(--dsw-alias-label-secondary);
        font-size: 9px;
        font-variant-numeric: tabular-nums;
      }
      .dsh-music-select {
        height: 26px;
        padding: 0 6px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 7px;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-primary);
        font: inherit;
        font-size: 9px;
      }

      .dsh-music-row {
        display: flex;
        align-items: center;
        min-height: 36px;
        padding: 0 3px 0 5px;
        border-radius: 8px;
      }
      .dsh-music-row:hover { background: var(--dsw-alias-bg-layer-2); }
      .dsh-music-row.is-current { background: var(--dsw-alias-bg-layer-2); }
      .dsh-music-row[draggable="true"] { cursor: grab; }
      .dsh-music-row.is-dragging { opacity: .45; }
      .dsh-music-row.is-drop-target {
        box-shadow: inset 0 2px 0 var(--dsw-alias-brand-primary);
      }
      .dsh-music-rowmain {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
        min-height: 36px;
        padding: 0;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }
      .dsh-music-rowindex {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: none;
        width: 24px;
        color: var(--dsw-alias-label-secondary);
        font-size: 9px;
        font-variant-numeric: tabular-nums;
      }
      .dsh-music-rowtext { min-width: 0; flex: 1; padding-right: 6px; }
      .dsh-music-rowname {
        display: block;
        overflow: hidden;
        font-size: 11px;
        line-height: 1.3;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dsh-music-row.is-current .dsh-music-rowname {
        color: var(--dsw-alias-brand-primary);
        font-weight: 650;
      }
      .dsh-music-rowmeta {
        display: block;
        overflow: hidden;
        margin-top: 1px;
        color: var(--dsw-alias-label-secondary);
        font-size: 9px;
        line-height: 1.2;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dsh-music-source-badge {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        margin-left: 5px;
        padding: 0 4px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 999px;
        color: var(--dsw-alias-label-secondary);
        font-size: 8px;
        line-height: 13px;
        vertical-align: 1px;
      }
      .dsh-music-rowactions {
        display: flex;
        align-items: center;
        gap: 1px;
        flex: none;
      }
      .dsh-music-rowbtn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: var(--dsw-alias-label-secondary);
        cursor: pointer;
        opacity: .55;
      }
      .dsh-music-row:hover .dsh-music-rowbtn,
      .dsh-music-rowbtn:focus-visible { opacity: 1; }
      .dsh-music-rowbtn:hover {
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-primary);
      }
      .dsh-music-rowbtn:disabled {
        opacity: .25;
        cursor: default;
      }
      .dsh-music-rowbtn.is-favorite { color: #ef4444; opacity: 1; }
      .dsh-music-rowbtn.is-danger:hover { color: var(--dsw-alias-state-error-primary); }
      @media (hover: none) {
        .dsh-music-rowbtn { opacity: .8; }
      }
      .dsh-music-eq {
        display: inline-flex;
        align-items: flex-end;
        gap: 1px;
        width: 9px;
        height: 9px;
      }
      .dsh-music-eq i {
        width: 2px;
        height: 100%;
        border-radius: 1px;
        background: var(--dsw-alias-brand-primary);
        transform-origin: bottom;
        animation: dsh-music-bounce .85s ease-in-out infinite;
      }
      .dsh-music-eq i:nth-child(2) { animation-delay: .14s; }
      .dsh-music-eq i:nth-child(3) { animation-delay: .28s; }
      @keyframes dsh-music-bounce {
        0%, 100% { transform: scaleY(.35); }
        50% { transform: scaleY(1); }
      }

      .dsh-music-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 28px 16px;
        color: var(--dsw-alias-label-secondary);
        font-size: 10px;
        line-height: 1.45;
        text-align: center;
      }
      .dsh-music-empty-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        margin-bottom: 2px;
        border-radius: 50%;
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-secondary);
      }
      .dsh-music-empty-title { color: var(--dsw-alias-label-primary); font-size: 11px; font-weight: 600; }
      .dsh-music-empty-actions { display: flex; gap: 6px; margin-top: 3px; }

      .dsh-music-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        height: 27px;
        padding: 0 10px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 8px;
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-label-primary);
        font: inherit;
        font-size: 10px;
        cursor: pointer;
      }
      .dsh-music-btn:hover { border-color: var(--dsw-alias-border-l2); }
      .dsh-music-btn.primary {
        border-color: transparent;
        background: var(--dsw-alias-brand-primary);
        color: var(--dsw-alias-bg-base);
      }
      .dsh-music-btn.primary:hover { filter: brightness(1.06); }
      .dsh-music-btn.danger {
        border-color: transparent;
        background: var(--dsw-alias-state-error-primary);
        color: #fff;
      }
      .dsh-music-btn:disabled { opacity: .45; cursor: default; }

      .dsh-music-collection-list { display: flex; flex-direction: column; gap: 4px; }
      .dsh-music-collection {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 2px 3px;
        border-radius: 9px;
      }
      .dsh-music-collection:hover { background: var(--dsw-alias-bg-layer-2); }
      .dsh-music-collection-main {
        display: flex;
        align-items: center;
        gap: 9px;
        flex: 1;
        min-width: 0;
        padding: 7px 6px;
        border: 0;
        border-radius: 7px;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }
      .dsh-music-collection-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: none;
        width: 30px;
        height: 30px;
        border-radius: 9px;
        background: var(--dsw-alias-bg-layer-2);
        color: var(--dsw-alias-brand-primary);
      }
      .dsh-music-collection-text { min-width: 0; }
      .dsh-music-collection-name {
        overflow: hidden;
        font-size: 11px;
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dsh-music-collection-count {
        margin-top: 1px;
        color: var(--dsw-alias-label-secondary);
        font-size: 9px;
      }
      .dsh-music-collection-head {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 3px 5px 8px;
      }
      .dsh-music-collection-headtext { min-width: 0; flex: 1; }
      .dsh-music-collection-headname {
        overflow: hidden;
        font-size: 12px;
        font-weight: 650;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dsh-music-collection-headsub {
        margin-top: 1px;
        color: var(--dsw-alias-label-secondary);
        font-size: 9px;
      }
      .dsh-music-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex: none;
        padding: 6px 13px 8px;
        border-top: 1px solid var(--dsw-alias-border-l1);
        color: var(--dsw-alias-label-secondary);
        font-size: 9px;
      }
      .dsh-music-footer > span {
        overflow: hidden;
        flex: 1;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dsh-music-volume {
        display: flex;
        align-items: center;
        gap: 3px;
        flex: none;
        width: 104px;
      }
      .dsh-music-volume .dsh-music-iconbtn { width: 22px; height: 22px; }
      .dsh-music-volume .dsh-music-range { flex: 1; height: 3px; }
      .dsh-music-error-text {
        margin: 8px 0 0;
        color: var(--dsw-alias-state-error-primary);
        font-size: 9px;
        line-height: 1.35;
      }
      .dsh-music-modal-body p.dsh-music-error-text {
        color: var(--dsw-alias-state-error-primary);
      }

      .dsh-music-modal-backdrop {
        position: absolute;
        inset: 0;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 14px;
        background: rgba(0, 0, 0, .38);
      }
      .dsh-music-modal {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-height: 100%;
        overflow: hidden;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 12px;
        background: var(--dsw-alias-bg-overlay);
        box-shadow: 0 16px 40px rgba(0, 0, 0, .32);
        animation: dsh-music-pop .13s ease-out;
      }
      .dsh-music-modal-head {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: none;
        padding: 10px 10px 8px 13px;
        border-bottom: 1px solid var(--dsw-alias-border-l1);
      }
      .dsh-music-modal-title {
        margin: 0;
        flex: 1;
        font-size: 12px;
        font-weight: 650;
      }
      .dsh-music-modal-body {
        overflow-y: auto;
        padding: 11px 13px 13px;
        font-size: 10px;
        line-height: 1.45;
      }
      .dsh-music-modal-body p { margin: 0 0 9px; color: var(--dsw-alias-label-secondary); }
      .dsh-music-modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
        margin-top: 12px;
      }
      .dsh-music-option {
        display: flex;
        align-items: flex-start;
        gap: 7px;
        margin: 7px 0;
        padding: 8px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 8px;
        background: var(--dsw-alias-bg-layer-1);
        cursor: pointer;
      }
      .dsh-music-option.is-disabled { opacity: .55; cursor: default; }
      .dsh-music-option input { margin: 2px 0 0; accent-color: var(--dsw-alias-brand-primary); }
      .dsh-music-option-text { min-width: 0; flex: 1; }
      .dsh-music-option-title { color: var(--dsw-alias-label-primary); font-size: 10px; font-weight: 600; }
      .dsh-music-option-hint { margin-top: 2px; color: var(--dsw-alias-label-secondary); font-size: 9px; line-height: 1.35; }
      .dsh-music-check {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 9px;
        color: var(--dsw-alias-label-secondary);
        font-size: 9px;
        cursor: pointer;
      }
      .dsh-music-check input { accent-color: var(--dsw-alias-brand-primary); }
      .dsh-music-field {
        display: block;
        width: 100%;
        height: 31px;
        margin: 4px 0 0;
        padding: 0 9px;
        border: 1px solid var(--dsw-alias-border-l2);
        border-radius: 8px;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-primary);
        font: inherit;
        font-size: 11px;
      }
      .dsh-music-field:focus { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
      .dsh-music-appearance-preview {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
      }
      .dsh-music-appearance-ball {
        flex: none;
        width: 58px;
        height: 58px;
        overflow: hidden;
        border-radius: 50%;
        background: #0b0b0c;
        color: #ffffff;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .2);
      }
      .dsh-music-appearance-copy { min-width: 0; flex: 1; color: var(--dsw-alias-label-secondary); font-size: 9px; line-height: 1.4; }
      .dsh-music-appearance-copy strong { display: block; margin-bottom: 2px; color: var(--dsw-alias-label-primary); font-size: 10px; }
      .dsh-music-modal-list { display: flex; flex-direction: column; gap: 3px; margin: 7px 0 2px; }
      .dsh-music-modal-row {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 7px 8px;
        border: 1px solid var(--dsw-alias-border-l1);
        border-radius: 8px;
        background: var(--dsw-alias-bg-layer-1);
        color: var(--dsw-alias-label-primary);
        font: inherit;
        font-size: 10px;
        text-align: left;
        cursor: pointer;
      }
      .dsh-music-modal-row:hover { border-color: var(--dsw-alias-border-l2); }
      .dsh-music-modal-rowtext { min-width: 0; flex: 1; }
      .dsh-music-modal-rowhint { color: var(--dsw-alias-label-secondary); font-size: 9px; }

      @media (prefers-reduced-motion: reduce) {
        .dsh-music-mini, .dsh-music-detail, .dsh-music-modal { animation: none; }
        .dsh-music-ball-spin { animation-duration: 24s; }
        .dsh-music-eq i { animation: none; }
      }
    `;

    const LOCALE = {
      zh: {
        title: '音乐',
        ballLabel: '音乐悬浮球',
        ballPlaying: '正在播放',
        ballPaused: '已暂停',
        ballHint: '单击打开控制条，双击查看详情，拖动可移动',
        close: '关闭',
        addMusic: '添加音乐',
        addCopy: '添加副本',
        importFolder: '导入文件夹',
        importModesHint: '文件选择只添加副本；通过「导入文件夹」添加的曲目才可选择删除源文件。',
        sourceBadge: '可删源',
        customizeIcon: '悬浮球设置',
        loading: '正在载入音乐库…',
        noTrack: '还没有选择音乐',
        noTrackHint: '打开音乐库添加音乐',
        nowPlaying: '正在播放',
        paused: '已暂停',
        selected: '已选择',
        idle: '未播放',
        play: '播放',
        pause: '暂停',
        previous: '上一首',
        next: '下一首',
        playTrack: '播放这首音乐',
        seek: '播放进度',
        volume: '音量',
        mute: '静音',
        unmute: '取消静音',
        favorite: '收藏',
        unfavorite: '取消收藏',
        favoriteShort: '收藏',
        queue: '播放列表',
        modeSequence: '顺序播放',
        modeOne: '单曲循环',
        modeShuffle: '随机播放',
        modeSequenceShort: '顺序',
        modeOneShort: '单曲',
        modeShuffleShort: '随机',
        tabPlaylist: '播放列表',
        tabFavorites: '我的收藏',
        tabLibrary: '音乐库',
        tabCollections: '收藏夹',
        searchPlaceholder: '搜索当前列表',
        clearSearch: '清空搜索',
        noSearchResults: '没有匹配的音乐',
        moveUp: '上移',
        moveDown: '下移',
        playAll: '播放全部',
        emptyPlaylist: '播放列表为空',
        emptyPlaylistHint: '从音乐库点击「加入播放列表」，或直接播放一首音乐',
        emptyFavorites: '还没有收藏',
        emptyFavoritesHint: '在音乐库或播放列表点击心形按钮收藏音乐',
        emptyLibrary: '音乐库为空',
        emptyLibraryHint: '添加本地音频文件，或导入一个文件夹',
        emptyCollections: '还没有收藏夹',
        emptyCollectionsHint: '新建收藏夹，把不同心情或场景的音乐分类整理',
        goLibrary: '去音乐库',
        newCollection: '新建收藏夹',
        newCollectionTitle: '新建收藏夹',
        collectionName: '收藏夹名称',
        collectionNamePlaceholder: '例如：通勤、专注、夜晚',
        create: '创建',
        cancel: '取消',
        delete: '删除',
        deleting: '正在删除…',
        remove: '移除',
        removeFromPlaylist: '从播放列表移除',
        addToPlaylist: '加入播放列表',
        addToCollection: '加入收藏夹',
        deleteFromLibrary: '从音乐库删除',
        deleteCollection: '删除收藏夹',
        deleteCollectionQuestion: '确定要删除收藏夹「{name}」吗？音乐库中的曲目不会被删除。',
        collectionPickerTitle: '加入收藏夹',
        collectionPickerHint: '选择一个收藏夹，或新建一个',
        noCollections: '还没有收藏夹',
        collectionCount: '{count} 首',
        storageHint: '音乐副本保存在此浏览器',
        libraryHint: '从音乐库删除只影响这里的副本，不会自动删除源文件',
        playlistHint: '从播放列表移除不会删除音乐库中的曲目',
        deleteTitle: '从音乐库删除',
        deleteQuestion: '要删除「{name}」吗？',
        deleteBody: '删除后会从音乐库、播放列表和收藏夹中移除，此操作无法撤销。',
        deleteLibraryOnly: '仅从音乐库移除',
        deleteLibraryOnlyHint: '保留源文件，之后仍可重新导入。',
        deleteSourceFile: '同时删除源文件',
        deleteSourceHint: '仅对通过「导入文件夹」添加的曲目可用。文件会从磁盘中永久删除。',
        deleteSourceUnavailable: '这个曲目是通过文件选择添加的，浏览器无法获得可写路径，因此不能删除源文件。',
        deleteDontAsk: '以后不再显示此确认',
        deleteDontAskHint: '之后会默认仅从音乐库移除，不会删除源文件。',
        sourceDeleted: '已从音乐库和源文件夹中删除',
        appearanceTitle: '悬浮球设置',
        iconSection: '图标与封面',
        autoHideSection: '自动半隐身',
        deleteSection: '删除确认',
        helpSection: '使用提示',
        appearanceHint: '默认显示传统音符；有专辑封面时会自动显示封面。自定义图标会覆盖两者。',
        chooseImage: '选择图片',
        resetDefault: '恢复默认',
        defaultIcon: '默认音符',
        albumCover: '专辑封面',
        customIcon: '自定义图标',
        deleteConfirmSetting: '从音乐库删除曲目前显示确认',
        autoHideSetting: '无操作后自动半隐身',
        autoHideDelay: '半隐身等待时间',
        autoHideOnlyPlaying: '仅在播放时半隐身',
        autoHideOnlyPlayingHint: '暂停时保持完整显示。',
        autoHideHint: '悬浮球会缩进最近的屏幕边缘，只露出一半；悬停、点击或拖动即可恢复。',
        seconds: '{count} 秒',
        coverZoom: '全局封面缩放',
        coverZoomHint: '全局值；当前曲目可在下方单独覆盖。调大可裁掉较宽的白边。',
        currentCoverZoomSection: '当前曲目',
        currentCoverZoom: '当前曲目封面缩放',
        followGlobal: '跟随全局',
        replayGuide: '重新查看使用提示',
        onboardingTitle: '悬浮球使用提示',
        onboardingDrag: '拖动悬浮球，松手后会吸附到最近的屏幕边缘。',
        onboardingClick: '单击打开控制条，双击打开详情；右键也可以打开详情。',
        onboardingCover: '白边较多的专辑可在「悬浮球设置」里调大封面缩放。',
        onboardingOk: '知道了',
        onboardingSettings: '打开设置',
        folderHint: '选择文件夹后，里面的音频会加入音乐库；这些曲目支持在删除时尝试删除源文件。',
        folderUnsupported: '当前浏览器不支持文件夹授权，无法启用源文件删除。',
        folderNoAudio: '这个文件夹里没有可导入的音频文件。',
        folderReadFailed: '读取文件夹失败，请检查权限后重试。',
        errorUnsupported: '没有找到可播放的音频文件',
        errorTooLarge: '部分文件超过 200 MB，已跳过',
        errorDuplicate: '同名同大小的文件已经在音乐库中',
        errorPlayback: '无法播放这个文件，请换一首试试',
        errorBlocked: '浏览器阻止了自动播放，请再点一次播放',
        errorMissing: '找不到音频数据，请重新添加这个文件',
        errorStorage: '浏览器存储不可用，音乐仅在本次会话有效',
        errorIcon: '无法读取这张图片，请换一张试试',
        errorSourceFailed: '删除源文件失败，音乐库中的曲目未删除',
        errorSourceDenied: '没有获得文件夹写入权限，源文件未删除',
        errorSourceUnavailable: '找不到源文件夹授权，无法删除源文件',
        dismiss: '关闭提示',
        sourceHint: '此曲目来自文件夹授权，可在删除时选择删除源文件。',
        back: '返回',
        tracksCount: '{count} 首',
        dropHint: '拖入音频也可添加',
        loadError: '音乐库载入失败',
      },
      en: {
        title: 'Music',
        ballLabel: 'Music ball',
        ballPlaying: 'Now playing',
        ballPaused: 'Paused',
        ballHint: 'Click for controls, double-click for details, drag to move',
        close: 'Close',
        addMusic: 'Add music',
        addCopy: 'Add copy',
        importFolder: 'Import folder',
        importModesHint: 'File selection adds a copy only. Tracks added through Import folder can optionally delete their source file.',
        sourceBadge: 'Source',
        customizeIcon: 'Ball settings',
        loading: 'Loading your music…',
        noTrack: 'No track selected',
        noTrackHint: 'Open the library to add music',
        nowPlaying: 'Now playing',
        paused: 'Paused',
        selected: 'Selected',
        idle: 'Idle',
        play: 'Play',
        pause: 'Pause',
        previous: 'Previous',
        next: 'Next',
        playTrack: 'Play this track',
        seek: 'Playback position',
        volume: 'Volume',
        mute: 'Mute',
        unmute: 'Unmute',
        favorite: 'Favorite',
        unfavorite: 'Remove favorite',
        favoriteShort: 'Favorite',
        queue: 'Playlist',
        modeSequence: 'Play in order',
        modeOne: 'Repeat one',
        modeShuffle: 'Shuffle',
        modeSequenceShort: 'Order',
        modeOneShort: 'One',
        modeShuffleShort: 'Shuffle',
        tabPlaylist: 'Playlist',
        tabFavorites: 'Favorites',
        tabLibrary: 'Library',
        tabCollections: 'Collections',
        searchPlaceholder: 'Search this list',
        clearSearch: 'Clear search',
        noSearchResults: 'No matching tracks',
        moveUp: 'Move up',
        moveDown: 'Move down',
        playAll: 'Play all',
        emptyPlaylist: 'Your playlist is empty',
        emptyPlaylistHint: 'Add tracks from the library, or just play one',
        emptyFavorites: 'No favorites yet',
        emptyFavoritesHint: 'Tap the heart in the library or playlist to save a track',
        emptyLibrary: 'Your library is empty',
        emptyLibraryHint: 'Add local audio files, or import a folder',
        emptyCollections: 'No collections yet',
        emptyCollectionsHint: 'Create collections to group music by mood or moment',
        goLibrary: 'Open library',
        newCollection: 'New collection',
        newCollectionTitle: 'New collection',
        collectionName: 'Collection name',
        collectionNamePlaceholder: 'e.g. Commute, Focus, Night',
        create: 'Create',
        cancel: 'Cancel',
        delete: 'Delete',
        deleting: 'Deleting…',
        remove: 'Remove',
        removeFromPlaylist: 'Remove from playlist',
        addToPlaylist: 'Add to playlist',
        addToCollection: 'Add to collection',
        deleteFromLibrary: 'Delete from library',
        deleteCollection: 'Delete collection',
        deleteCollectionQuestion: 'Delete the collection "{name}"? Tracks in your library will stay.',
        collectionPickerTitle: 'Add to collection',
        collectionPickerHint: 'Choose a collection, or create a new one',
        noCollections: 'No collections yet',
        collectionCount: '{count} tracks',
        storageHint: 'Music copies are kept in this browser',
        libraryHint: 'Deleting from the library only removes this copy; it does not delete the source file automatically',
        playlistHint: 'Removing from the playlist does not delete anything from the library',
        deleteTitle: 'Delete from library',
        deleteQuestion: 'Delete "{name}"?',
        deleteBody: 'It will be removed from the library, playlist, and collections. This cannot be undone.',
        deleteLibraryOnly: 'Remove from library only',
        deleteLibraryOnlyHint: 'Keep the source file so you can import it again later.',
        deleteSourceFile: 'Also delete the source file',
        deleteSourceHint: 'Only available for tracks added through Import folder. The file is permanently deleted from disk.',
        deleteSourceUnavailable: 'This track was added through a file picker. The browser has no writable path, so the source file cannot be deleted.',
        deleteDontAsk: 'Do not show this confirmation again',
        deleteDontAskHint: 'Future deletes remove the library copy only and never delete source files.',
        sourceDeleted: 'Removed from the library and the source folder',
        appearanceTitle: 'Ball settings',
        iconSection: 'Icon and cover',
        autoHideSection: 'Auto-hide',
        deleteSection: 'Delete confirmation',
        helpSection: 'Help',
        appearanceHint: 'The default is a traditional music note; embedded album art is shown when available. A custom icon overrides both.',
        chooseImage: 'Choose image',
        resetDefault: 'Reset to default',
        defaultIcon: 'Default note',
        albumCover: 'Album cover',
        customIcon: 'Custom icon',
        deleteConfirmSetting: 'Confirm before deleting a track from the library',
        autoHideSetting: 'Auto-hide after inactivity',
        autoHideDelay: 'Auto-hide delay',
        autoHideOnlyPlaying: 'Only auto-hide while playing',
        autoHideOnlyPlayingHint: 'Keep the ball fully visible while paused.',
        autoHideHint: 'The ball tucks into the nearest screen edge, leaving half visible. Hover, click, or drag to reveal it.',
        seconds: '{count}s',
        coverZoom: 'Global cover zoom',
        coverZoomHint: 'Global value; the current track can override it below. Increase it to trim wide white borders.',
        currentCoverZoomSection: 'Current track',
        currentCoverZoom: 'Current track cover zoom',
        followGlobal: 'Follow global',
        replayGuide: 'Show the usage guide again',
        onboardingTitle: 'Music ball tips',
        onboardingDrag: 'Drag the ball; on release it snaps to the nearest screen edge.',
        onboardingClick: 'Click for controls, double-click for details. Right-click also opens details.',
        onboardingCover: 'Albums with wide white borders can use Cover zoom in Ball settings.',
        onboardingOk: 'Got it',
        onboardingSettings: 'Open settings',
        folderHint: 'Choose a folder to import its audio files. These tracks can optionally delete their source file when removed.',
        folderUnsupported: 'This browser does not support folder authorization, so source deletion is unavailable.',
        folderNoAudio: 'No importable audio files were found in this folder.',
        folderReadFailed: 'Could not read the folder. Check permission and try again.',
        errorUnsupported: 'No playable audio files were found',
        errorTooLarge: 'Some files exceed 200 MB and were skipped',
        errorDuplicate: 'Files with the same name and size are already in the library',
        errorPlayback: 'This file could not be played. Try another one.',
        errorBlocked: 'The browser blocked autoplay. Press play again.',
        errorMissing: 'The audio data is missing. Add this file again.',
        errorStorage: 'Browser storage is unavailable. This music lasts only for this session.',
        errorIcon: 'This image could not be read. Try another one.',
        errorSourceFailed: 'Could not delete the source file. The library track was kept.',
        errorSourceDenied: 'Folder write permission was not granted. The source file was kept.',
        errorSourceUnavailable: 'The source folder authorization is missing. The source file was kept.',
        dismiss: 'Dismiss',
        sourceHint: 'This track came from an authorized folder and can delete its source file when removed.',
        back: 'Back',
        tracksCount: '{count} tracks',
        dropHint: 'Drop audio files here to add',
        loadError: 'Could not load the music library',
      },
    };

    function Icon({ name, size = 16, strokeWidth = 1.8, filled = false }) {
      const common = {
        viewBox: '0 0 24 24',
        width: size,
        height: size,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        focusable: false,
      };
      if (name === 'play') {
        return h('svg', { ...common, fill: 'currentColor', stroke: 'none' }, h('path', { d: 'M8 5.2v13.6L19 12z' }));
      }
      if (name === 'pause') {
        return h('svg', { ...common, fill: 'currentColor', stroke: 'none' },
          h('rect', { x: 7, y: 5, width: 3.6, height: 14, rx: 1 }),
          h('rect', { x: 13.4, y: 5, width: 3.6, height: 14, rx: 1 }));
      }
      if (name === 'previous') {
        return h('svg', { ...common, fill: 'currentColor', stroke: 'none' },
          h('path', { d: 'M19 5.4v13.2L9.3 12z' }),
          h('rect', { x: 4.5, y: 5, width: 2.4, height: 14, rx: 1 }));
      }
      if (name === 'next') {
        return h('svg', { ...common, fill: 'currentColor', stroke: 'none' },
          h('path', { d: 'M5 5.4v13.2L14.7 12z' }),
          h('rect', { x: 17.1, y: 5, width: 2.4, height: 14, rx: 1 }));
      }
      if (name === 'heart') {
        return h('svg', { ...common, fill: filled ? 'currentColor' : 'none' },
          h('path', { d: 'M12 20.4C8.4 17.9 4 14.6 4 10.3 4 7.4 6.1 5.3 8.7 5.3c1.4 0 2.6.6 3.3 1.7.7-1.1 1.9-1.7 3.3-1.7 2.6 0 4.7 2.1 4.7 5 0 4.3-4.4 7.6-8 10.1z' }));
      }
      if (name === 'plus') return h('svg', common, h('path', { d: 'M12 5v14M5 12h14' }));
      if (name === 'close') return h('svg', common, h('path', { d: 'M6 6l12 12M18 6L6 18' }));
      if (name === 'trash') {
        return h('svg', common, h('path', { d: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5' }));
      }
      if (name === 'folder') {
        return h('svg', common, h('path', { d: 'M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z' }));
      }
      if (name === 'folderPlus') {
        return h('svg', common,
          h('path', { d: 'M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z' }),
          h('path', { d: 'M12 11v6M9 14h6' }));
      }
      if (name === 'image') {
        return h('svg', common,
          h('rect', { x: 3, y: 4, width: 18, height: 16, rx: 2 }),
          h('circle', { cx: 8.5, cy: 9.5, r: 1.5 }),
          h('path', { d: 'M21 15l-5-5L5 20' }));
      }
      if (name === 'settings') {
        return h('svg', common,
          h('path', { d: 'M4 6h10M18 6h2M4 12h2M10 12h10M4 18h10M18 18h2' }),
          h('circle', { cx: 16, cy: 6, r: 2 }),
          h('circle', { cx: 8, cy: 12, r: 2 }),
          h('circle', { cx: 16, cy: 18, r: 2 }));
      }
      if (name === 'back') return h('svg', common, h('path', { d: 'M15 18l-6-6 6-6' }));
      if (name === 'up') return h('svg', common, h('path', { d: 'M6 15l6-6 6 6' }));
      if (name === 'down') return h('svg', common, h('path', { d: 'M6 9l6 6 6-6' }));
      if (name === 'search') {
        return h('svg', common,
          h('circle', { cx: 11, cy: 11, r: 6 }),
          h('path', { d: 'M16 16l4 4' }));
      }
      if (name === 'list') {
        return h('svg', common, h('path', { d: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' }));
      }
      if (name === 'repeat') {
        return h('svg', common,
          h('path', { d: 'M17 2l4 4-4 4' }),
          h('path', { d: 'M3 11V9a4 4 0 014-4h14' }),
          h('path', { d: 'M7 22l-4-4 4-4' }),
          h('path', { d: 'M21 13v2a4 4 0 01-4 4H3' }));
      }
      if (name === 'shuffle') {
        return h('svg', common,
          h('path', { d: 'M16 3h5v5' }),
          h('path', { d: 'M4 20L21 3' }),
          h('path', { d: 'M21 16v5h-5' }),
          h('path', { d: 'M15 15l6 6' }),
          h('path', { d: 'M4 4l5 5' }));
      }
      if (name === 'volume') {
        return h('svg', common,
          h('path', { d: 'M4 9v6h4l5 4V5L8 9H4z' }),
          h('path', { d: 'M17 8.5a5 5 0 010 7M19.5 6a8.5 8.5 0 010 12' }));
      }
      if (name === 'mute') {
        return h('svg', common,
          h('path', { d: 'M4 9v6h4l5 4V5L8 9H4z' }),
          h('path', { d: 'M17 9l4 6M21 9l-4 6' }));
      }
      return h('svg', common,
        h('path', { d: 'M9 18V5l11-2v13' }),
        h('circle', { cx: 6, cy: 18, r: 3 }),
        h('circle', { cx: 17, cy: 16, r: 3 }));
    }

    function readStoredString(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    }

    function writeStored(key, value) {
      try {
        window.localStorage.setItem(key, String(value));
      } catch {
        // A disabled storage area only drops the preference.
      }
    }

    function readNumber(key, fallback) {
      const raw = readStoredString(key);
      if (raw === null) return fallback;
      const value = Number(raw);
      return Number.isFinite(value) ? value : fallback;
    }

    function readMode() {
      const value = readStoredString(MODE_KEY);
      if (value === 'one' || value === 'shuffle' || value === 'sequence') return value;
      if (value === 'all' || value === 'none') return 'sequence';
      return 'sequence';
    }

    function readCustomIcon() {
      const value = readStoredString(ICON_KEY);
      return value && value.startsWith('data:image/') ? value : null;
    }

    function readDeleteConfirm() {
      return readStoredString(DELETE_CONFIRM_KEY) !== '0';
    }

    function readAutoHide() {
      return readStoredString(AUTO_HIDE_KEY) !== '0';
    }

    function readAutoHideDelay() {
      const value = Number(readStoredString(AUTO_HIDE_DELAY_KEY));
      return value === 10 || value === 30 ? value : 5;
    }

    function readAutoHideOnlyPlaying() {
      return readStoredString(AUTO_HIDE_PLAYING_KEY) === '1';
    }

    function readCoverZoom() {
      const value = Number(readStoredString(COVER_ZOOM_KEY));
      return Number.isFinite(value) ? clamp(value, 1, 2) : 1;
    }

    function readOnboardingSeen() {
      return readStoredString(ONBOARDING_KEY) === '1';
    }

    function readBallPosition() {
      try {
        const value = JSON.parse(readStoredString(POSITION_KEY) || 'null');
        if (value && Number.isFinite(value.x) && Number.isFinite(value.y)) return { x: value.x, y: value.y };
      } catch {
        // Fall through to the default.
      }
      return null;
    }

    function saveBallPosition(position) {
      writeStored(POSITION_KEY, JSON.stringify(position));
    }

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), Math.max(min, max));
    }

    function viewportInset() {
      try {
        return document.documentElement.matches('[data-windows-titlebar]') ? 54 : EDGE;
      } catch {
        return EDGE;
      }
    }

    function clampBall(position) {
      const maxX = Math.max(EDGE, window.innerWidth - BALL_SIZE - EDGE);
      const top = viewportInset();
      const maxY = Math.max(top, window.innerHeight - BALL_SIZE - EDGE);
      return {
        x: clamp(Number(position.x) || EDGE, EDGE, maxX),
        y: clamp(Number(position.y) || top, top, maxY),
      };
    }

    function defaultBallPosition() {
      return clampBall({ x: EDGE + 4, y: window.innerHeight - BALL_SIZE - 96 });
    }

    function nearestWall(position) {
      const p = clampBall(position);
      const top = viewportInset();
      const left = Math.abs(p.x - EDGE);
      const right = Math.abs(window.innerWidth - BALL_SIZE - EDGE - p.x);
      const up = Math.abs(p.y - top);
      const down = Math.abs(window.innerHeight - BALL_SIZE - EDGE - p.y);
      const nearest = Math.min(left, right, up, down);
      return clampBall({
        x: nearest === left ? EDGE : nearest === right ? window.innerWidth - BALL_SIZE - EDGE : p.x,
        y: nearest === up ? top : nearest === down ? window.innerHeight - BALL_SIZE - EDGE : p.y,
      });
    }

    function wallSide(position, viewport) {
      const top = viewportInset();
      const distances = {
        left: Math.abs(position.x - EDGE),
        right: Math.abs(viewport.w - BALL_SIZE - EDGE - position.x),
        top: Math.abs(position.y - top),
        bottom: Math.abs(viewport.h - BALL_SIZE - EDGE - position.y),
      };
      return Object.keys(distances).reduce((best, side) => distances[side] < distances[best] ? side : best, 'left');
    }

    function halfHiddenPosition(full, side, viewport) {
      const half = BALL_SIZE / 2;
      if (side === 'right') return { x: viewport.w - half, y: full.y };
      if (side === 'top') return { x: full.x, y: viewportInset() - half };
      if (side === 'bottom') return { x: full.x, y: viewport.h - half };
      return { x: -half, y: full.y };
    }

    function computePlacement(position, kind, viewport) {
      const gap = 14;
      const width = Math.max(240, Math.min(kind === 'detail' ? 416 : kind === 'tip' ? 300 : 304, viewport.w - 24));
      const height = kind === 'detail' ? Math.max(280, Math.min(640, viewport.h - 24)) : kind === 'tip' ? 176 : 140;
      const centerX = position.x + BALL_SIZE / 2;
      const centerY = position.y + BALL_SIZE / 2;
      const spaceRight = viewport.w - (position.x + BALL_SIZE) - gap;
      const spaceLeft = position.x - gap;
      let left;
      let top;
      if (spaceRight >= width || spaceLeft >= width) {
        left = spaceRight >= width ? position.x + BALL_SIZE + gap : position.x - width - gap;
        top = centerY - height / 2;
      } else {
        const spaceBelow = viewport.h - (position.y + BALL_SIZE) - gap;
        top = spaceBelow >= height ? position.y + BALL_SIZE + gap : position.y - height - gap;
        left = centerX - width / 2;
      }
      return {
        left: clamp(left, EDGE, viewport.w - width - EDGE),
        top: clamp(top, EDGE, viewport.h - height - EDGE),
        width,
        height,
      };
    }

    function formatTime(value) {
      if (!Number.isFinite(value) || value < 0) return '0:00';
      const total = Math.floor(value);
      const hours = Math.floor(total / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const seconds = String(total % 60).padStart(2, '0');
      return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`;
    }

    function formatBytes(value) {
      if (!Number.isFinite(value) || value <= 0) return '';
      const mb = value / (1024 * 1024);
      return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(value / 1024))} KB`;
    }

    function trackType(track) {
      return (track.ext || (track.type && track.type.split('/')[1]) || 'Audio').toUpperCase();
    }

    function trackMetaText(track) {
      const parts = [trackType(track), formatBytes(track.size), track.duration ? formatTime(track.duration) : '--:--'];
      return parts.filter(Boolean).join(' · ');
    }

    function errorText(t, code) {
      switch (code) {
        case 'unsupported': return t('errorUnsupported');
        case 'tooLarge': return t('errorTooLarge');
        case 'duplicate': return t('errorDuplicate');
        case 'blocked': return t('errorBlocked');
        case 'missing': return t('errorMissing');
        case 'storage': return t('errorStorage');
        case 'icon': return t('errorIcon');
        case 'sourceFailed': return t('errorSourceFailed');
        case 'sourceDenied': return t('errorSourceDenied');
        case 'sourceUnavailable': return t('errorSourceUnavailable');
        case 'folderUnsupported': return t('folderUnsupported');
        case 'folderNoAudio': return t('folderNoAudio');
        case 'folderRead': return t('folderReadFailed');
        default: return t('errorPlayback');
      }
    }

    function makeId() {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
      return `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    }

    function blobToDataUrl(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('Could not read the image'));
        reader.readAsDataURL(blob);
      });
    }

    function resizeDataUrl(dataUrl, size, mime, quality, square = false) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          try {
            if (square) {
              const side = Math.min(image.width, image.height);
              const output = Math.max(1, Math.min(size, side));
              const canvas = document.createElement('canvas');
              canvas.width = output;
              canvas.height = output;
              const context = canvas.getContext('2d');
              if (!context) {
                resolve(dataUrl);
                return;
              }
              const sourceX = Math.max(0, (image.width - side) / 2);
              const sourceY = Math.max(0, (image.height - side) / 2);
              context.drawImage(image, sourceX, sourceY, side, side, 0, 0, output, output);
              resolve(canvas.toDataURL(mime, quality));
              return;
            }
            const ratio = Math.min(1, size / Math.max(image.width, image.height));
            const width = Math.max(1, Math.round(image.width * ratio));
            const height = Math.max(1, Math.round(image.height * ratio));
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext('2d');
            if (!context) {
              resolve(dataUrl);
              return;
            }
            context.drawImage(image, 0, 0, width, height);
            resolve(canvas.toDataURL(mime, quality));
          } catch (error) {
            reject(error);
          }
        };
        image.onerror = () => reject(new Error('Could not decode the image'));
        image.src = dataUrl;
      });
    }

    function readU32(bytes, offset) {
      if (offset + 4 > bytes.length) return 0;
      return (((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0);
    }

    function readSyncSafe(bytes, offset) {
      if (offset + 4 > bytes.length) return 0;
      return ((bytes[offset] & 0x7f) << 21) | ((bytes[offset + 1] & 0x7f) << 14) | ((bytes[offset + 2] & 0x7f) << 7) | (bytes[offset + 3] & 0x7f);
    }

    function ascii(bytes, start, end) {
      let text = '';
      for (let index = start; index < end && index < bytes.length; index += 1) text += String.fromCharCode(bytes[index]);
      return text;
    }

    function findImage(bytes, start = 0, end = bytes.length) {
      const limit = Math.min(end, bytes.length);
      for (let index = Math.max(0, start); index < limit - 3; index += 1) {
        if (bytes[index] === 0xff && bytes[index + 1] === 0xd8 && bytes[index + 2] === 0xff) {
          return { bytes: bytes.subarray(index, limit), mime: 'image/jpeg' };
        }
        if (bytes[index] === 0x89 && bytes[index + 1] === 0x50 && bytes[index + 2] === 0x4e && bytes[index + 3] === 0x47) {
          return { bytes: bytes.subarray(index, limit), mime: 'image/png' };
        }
        if (
          index + 12 <= limit
          && bytes[index] === 0x52 && bytes[index + 1] === 0x49 && bytes[index + 2] === 0x46 && bytes[index + 3] === 0x46
          && bytes[index + 8] === 0x57 && bytes[index + 9] === 0x45 && bytes[index + 10] === 0x42 && bytes[index + 11] === 0x50
        ) {
          return { bytes: bytes.subarray(index, limit), mime: 'image/webp' };
        }
      }
      return null;
    }

    function findId3Cover(bytes) {
      if (bytes.length < 10 || ascii(bytes, 0, 3) !== 'ID3') return null;
      const version = bytes[3];
      if (version !== 3 && version !== 4) return null;
      const tagSize = readSyncSafe(bytes, 6);
      if (tagSize <= 0) return null;
      let offset = 10;
      if (bytes[5] & 0x40) {
        offset += version === 4 ? readSyncSafe(bytes, 10) : 4 + readU32(bytes, 10);
      }
      const end = Math.min(bytes.length, 10 + tagSize);
      while (offset + 10 <= end) {
        const id = ascii(bytes, offset, offset + 4);
        if (!/^[A-Z0-9]{4}$/.test(id)) break;
        const frameSize = version === 4 ? readSyncSafe(bytes, offset + 4) : readU32(bytes, offset + 4);
        if (frameSize <= 0 || offset + 10 + frameSize > end) break;
        if (id === 'APIC' || id === 'PIC') {
          const found = findImage(bytes, offset + 10, offset + 10 + frameSize);
          if (found) return found;
        }
        offset += 10 + frameSize;
      }
      return null;
    }

    function findFlacCover(bytes) {
      if (bytes.length < 8 || ascii(bytes, 0, 4) !== 'fLaC') return null;
      let offset = 4;
      while (offset + 4 <= bytes.length) {
        const header = bytes[offset];
        const type = header & 0x7f;
        const last = (header & 0x80) !== 0;
        const length = (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3];
        const dataStart = offset + 4;
        if (dataStart + length > bytes.length) break;
        if (type === 6) {
          let cursor = dataStart + 4;
          if (cursor + 4 > bytes.length) break;
          const mimeLength = readU32(bytes, cursor);
          cursor += 4;
          if (cursor + mimeLength + 4 > bytes.length) break;
          cursor += mimeLength;
          const descriptionLength = readU32(bytes, cursor);
          cursor += 4 + descriptionLength + 16;
          if (cursor + 4 > bytes.length) break;
          const imageLength = readU32(bytes, cursor);
          cursor += 4;
          if (cursor + imageLength <= bytes.length && imageLength > 0) {
            const found = findImage(bytes, cursor, cursor + imageLength);
            if (found) return found;
          }
        }
        offset = dataStart + length;
        if (last) break;
      }
      return null;
    }

    async function extractCover(blob) {
      try {
        const head = blob.slice(0, Math.min(blob.size, 4 * 1024 * 1024));
        const bytes = new Uint8Array(await head.arrayBuffer());
        const found = findId3Cover(bytes) || findFlacCover(bytes) || findImage(bytes, 0, bytes.length);
        if (!found) return null;
        const dataUrl = await blobToDataUrl(new Blob([found.bytes], { type: found.mime }));
        try {
          return await resizeDataUrl(dataUrl, 320, 'image/jpeg', 0.82, true);
        } catch {
          return dataUrl;
        }
      } catch {
        return null;
      }
    }

    function openDatabase() {
      return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
          reject(new Error('IndexedDB is unavailable'));
          return;
        }
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('tracks')) db.createObjectStore('tracks', { keyPath: 'id' });
          if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
          if (!db.objectStoreNames.contains('sources')) db.createObjectStore('sources', { keyPath: 'id' });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('Could not open the music library'));
        request.onblocked = () => reject(new Error('Another page is holding the music library open'));
      });
    }

    function createController() {
      let state = {
        library: [],
        playlist: [],
        collections: [],
        sourceIds: [],
        currentId: null,
        playing: false,
        time: 0,
        duration: 0,
        mode: readMode(),
        volume: clamp(readNumber(VOLUME_KEY, 0.8), 0, 1),
        muted: false,
        customIcon: readCustomIcon(),
        deleteConfirm: readDeleteConfirm(),
        autoHide: readAutoHide(),
        autoHideDelay: readAutoHideDelay(),
        autoHideOnlyPlaying: readAutoHideOnlyPlaying(),
        coverZoom: readCoverZoom(),
        onboardingSeen: readOnboardingSeen(),
        loading: true,
        error: null,
        storageWarning: false,
        panel: 'none',
        detailTab: 'playlist',
        activeCollectionId: null,
      };

      const listeners = new Set();
      const blobs = new Map();
      const urls = new Map();
      const sources = new Map();
      const coverRequests = new Set();
      const shuffleBack = [];
      const pendingZoomPersist = new Set();
      let zoomPersistTimer = null;
      let dbPromise = null;
      let disposed = false;

      const audio = new Audio();
      audio.preload = 'metadata';
      audio.volume = state.volume;
      audio.loop = state.mode === 'one';

      function database() {
        if (!dbPromise) dbPromise = openDatabase();
        return dbPromise;
      }

      function update(patch) {
        if (disposed) return;
        state = { ...state, ...patch };
        for (const listener of [...listeners]) listener();
      }

      function subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      }

      function getSnapshot() {
        return state;
      }

      function getTrack(id) {
        return state.library.find((track) => track.id === id) || null;
      }

      function updateTrack(id, patch) {
        let updated = null;
        const library = state.library.map((track) => {
          if (track.id !== id) return track;
          updated = { ...track, ...patch };
          return updated;
        });
        update({ library });
        return updated;
      }

      function dbGetAll(store) {
        return database().then((db) => new Promise((resolve, reject) => {
          const transaction = db.transaction(store, 'readonly');
          const request = transaction.objectStore(store).getAll();
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error || new Error(`Could not read ${store}`));
          transaction.onerror = () => reject(transaction.error || new Error(`Could not read ${store}`));
        }));
      }

      function dbGet(store, key) {
        return database().then((db) => new Promise((resolve, reject) => {
          const transaction = db.transaction(store, 'readonly');
          const request = transaction.objectStore(store).get(key);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error || new Error(`Could not read ${store}`));
        }));
      }

      function dbPut(store, value) {
        return database().then((db) => new Promise((resolve, reject) => {
          const transaction = db.transaction(store, 'readwrite');
          transaction.objectStore(store).put(value);
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error || new Error(`Could not write ${store}`));
          transaction.onabort = () => reject(transaction.error || new Error(`Could not write ${store}`));
        }));
      }

      function dbDelete(store, key) {
        return database().then((db) => new Promise((resolve, reject) => {
          const transaction = db.transaction(store, 'readwrite');
          transaction.objectStore(store).delete(key);
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error || new Error(`Could not delete ${store}`));
          transaction.onabort = () => reject(transaction.error || new Error(`Could not delete ${store}`));
        }));
      }

      function persistMeta() {
        const meta = {
          key: 'state',
          playlist: state.playlist,
          collections: state.collections,
          currentId: state.currentId,
          mode: state.mode,
        };
        dbPut('meta', meta).catch(() => {
          if (!disposed) update({ storageWarning: true });
        });
      }

      function persistTrack(track) {
        const blob = blobs.get(track.id);
        if (!blob) return Promise.resolve();
        return dbPut('tracks', { ...track, blob });
      }

      function persistSource(id) {
        const source = sources.get(id);
        if (!source) return Promise.resolve();
        return dbPut('sources', { id, dirHandle: source.dirHandle, fileName: source.fileName });
      }

      function getUrl(id) {
        let url = urls.get(id);
        if (url) return url;
        const blob = blobs.get(id);
        if (!blob) return '';
        url = URL.createObjectURL(blob);
        urls.set(id, url);
        return url;
      }

      function preserveNotice(code) {
        return code === 'tooLarge' || code === 'duplicate' ? code : null;
      }

      function play() {
        if (disposed) return;
        if (!state.currentId) {
          const first = state.playlist.map(getTrack).find(Boolean) || state.library[0];
          if (!first) {
            update({ panel: 'detail', detailTab: 'library' });
            return;
          }
          select(first.id, true);
          return;
        }
        if (!audio.getAttribute('src')) {
          select(state.currentId, true);
          return;
        }
        if (audio.ended) {
          try { audio.currentTime = 0; } catch { /* ignore */ }
        }
        try {
          const result = audio.play();
          if (result && typeof result.catch === 'function') {
            result.catch((error) => {
              if (disposed || (error && error.name === 'AbortError')) return;
              update({ error: error && error.name === 'NotAllowedError' ? 'blocked' : 'playback' });
            });
          }
        } catch (error) {
          update({ error: error && error.name === 'NotAllowedError' ? 'blocked' : 'playback' });
        }
      }

      function select(id, autoplay) {
        if (disposed) return;
        const track = getTrack(id);
        if (!track) return;
        if (!state.playlist.includes(id)) {
          const playlist = [...state.playlist, id];
          update({ playlist });
          persistMeta();
        }
        const blob = blobs.get(id);
        if (!blob) {
          update({ error: 'missing' });
          return;
        }
        if (state.currentId === id && audio.getAttribute('src')) {
          if (autoplay) {
            if (audio.ended) {
              try { audio.currentTime = 0; } catch { /* ignore */ }
            }
            play();
          }
          return;
        }
        audio.pause();
        audio.src = getUrl(id);
        audio.load();
        update({
          currentId: id,
          time: 0,
          duration: Number.isFinite(track.duration) ? track.duration : 0,
          playing: false,
          error: preserveNotice(state.error),
        });
        writeStored(LAST_KEY, id);
        persistMeta();
        ensureCover(id);
        if (autoplay) play();
      }

      function toggle() {
        if (!state.currentId) {
          play();
          return;
        }
        if (!audio.getAttribute('src')) {
          select(state.currentId, true);
          return;
        }
        if (audio.paused) play();
        else audio.pause();
      }

      function replay() {
        try { audio.currentTime = 0; } catch { /* ignore */ }
        play();
      }

      function stopAtEnd() {
        audio.pause();
        update({ playing: false, time: Number.isFinite(audio.duration) ? audio.duration : state.time });
      }

      function next(auto) {
        if (disposed) return;
        const queue = state.playlist.filter((id) => getTrack(id));
        if (queue.length === 0) {
          stopAtEnd();
          return;
        }
        if (state.mode === 'one' && auto) {
          replay();
          return;
        }
        if (state.mode === 'shuffle') {
          if (queue.length === 1) {
            replay();
            return;
          }
          const candidates = queue.filter((id) => id !== state.currentId);
          const nextId = candidates[Math.floor(Math.random() * candidates.length)] || queue[0];
          if (state.currentId) shuffleBack.push(state.currentId);
          select(nextId, true);
          return;
        }
        const index = queue.indexOf(state.currentId);
        if (index < 0) {
          select(queue[0], true);
          return;
        }
        if (index + 1 < queue.length) select(queue[index + 1], true);
        else stopAtEnd();
      }

      function previous() {
        if (disposed) return;
        if (audio.currentTime > 3) {
          seek(0);
          return;
        }
        const queue = state.playlist.filter((id) => getTrack(id));
        if (queue.length === 0) return;
        if (state.mode === 'shuffle' && shuffleBack.length > 0) {
          const last = shuffleBack.pop();
          if (last && getTrack(last)) {
            select(last, true);
            return;
          }
        }
        const index = queue.indexOf(state.currentId);
        if (index > 0) select(queue[index - 1], true);
        else seek(0);
      }

      function seek(value) {
        if (!Number.isFinite(value)) return;
        try {
          audio.currentTime = value;
          update({ time: value });
        } catch {
          // The media element is not ready yet.
        }
      }

      function setVolume(value) {
        const volume = clamp(Number(value) || 0, 0, 1);
        audio.volume = volume;
        audio.muted = false;
        writeStored(VOLUME_KEY, volume);
        update({ volume, muted: false });
      }

      function toggleMute() {
        audio.muted = !audio.muted;
        update({ muted: audio.muted });
      }

      function setMode(mode) {
        if (mode !== 'sequence' && mode !== 'one' && mode !== 'shuffle') return;
        audio.loop = mode === 'one';
        writeStored(MODE_KEY, mode);
        update({ mode });
        persistMeta();
      }

      function cycleMode() {
        const order = ['sequence', 'one', 'shuffle'];
        setMode(order[(order.indexOf(state.mode) + 1) % order.length]);
      }

      function toggleFavorite(id) {
        const track = getTrack(id);
        if (!track) return;
        const updated = { ...track, favorite: !track.favorite };
        updateTrack(id, { favorite: updated.favorite });
        persistTrack(updated).catch(() => {
          if (!disposed) update({ storageWarning: true });
        });
      }

      function addToPlaylist(id) {
        if (!getTrack(id)) return;
        if (state.playlist.includes(id)) {
          if (!state.currentId) select(id, false);
          return;
        }
        update({ playlist: [...state.playlist, id] });
        persistMeta();
        if (!state.currentId) select(id, false);
      }

      function playTrack(id) {
        if (!getTrack(id)) return;
        if (!state.playlist.includes(id)) {
          update({ playlist: [...state.playlist, id] });
          persistMeta();
        }
        select(id, true);
      }

      function removeFromPlaylist(id) {
        const index = state.playlist.indexOf(id);
        if (index < 0) return;
        const wasCurrent = state.currentId === id;
        const wasPlaying = wasCurrent && !audio.paused;
        const remaining = state.playlist.filter((item) => item !== id);
        const fallbackCandidate = remaining[Math.min(index, remaining.length - 1)] || null;
        const fallback = fallbackCandidate && getTrack(fallbackCandidate) ? fallbackCandidate : null;
        if (wasCurrent) {
          audio.pause();
          audio.removeAttribute('src');
          audio.load();
        }
        update({
          playlist: remaining,
          ...(wasCurrent ? {
            currentId: fallback,
            time: 0,
            duration: fallback ? (getTrack(fallback)?.duration || 0) : 0,
            playing: false,
          } : {}),
        });
        persistMeta();
        if (wasCurrent && fallback) select(fallback, wasPlaying);
      }

      function moveInPlaylist(id, delta) {
        const index = state.playlist.indexOf(id);
        if (index < 0) return;
        const target = index + delta;
        if (target < 0 || target >= state.playlist.length) return;
        const playlist = [...state.playlist];
        [playlist[index], playlist[target]] = [playlist[target], playlist[index]];
        update({ playlist });
        persistMeta();
      }

      function reorderPlaylist(sourceId, targetId) {
        if (!sourceId || sourceId === targetId) return;
        const from = state.playlist.indexOf(sourceId);
        const to = state.playlist.indexOf(targetId);
        if (from < 0 || to < 0) return;
        const playlist = [...state.playlist];
        const [moved] = playlist.splice(from, 1);
        const insertAt = from < to ? to - 1 : to;
        playlist.splice(insertAt, 0, moved);
        update({ playlist });
        persistMeta();
      }

      function playAll(ids) {
        const tracks = (ids || []).map(getTrack).filter(Boolean);
        if (tracks.length === 0) return;
        const selected = tracks.map((track) => track.id);
        const playlist = [...new Set([...selected, ...state.playlist])];
        update({ playlist });
        persistMeta();
        select(tracks[0].id, true);
      }

      function createCollection(name) {
        const trimmed = String(name || '').trim();
        if (!trimmed) return null;
        const collection = { id: makeId(), name: trimmed, trackIds: [] };
        update({ collections: [...state.collections, collection] });
        persistMeta();
        return collection.id;
      }

      function deleteCollection(id) {
        update({
          collections: state.collections.filter((collection) => collection.id !== id),
          activeCollectionId: state.activeCollectionId === id ? null : state.activeCollectionId,
        });
        persistMeta();
      }

      function addToCollection(collectionId, trackId) {
        if (!getTrack(trackId)) return;
        update({
          collections: state.collections.map((collection) => {
            if (collection.id !== collectionId || collection.trackIds.includes(trackId)) return collection;
            return { ...collection, trackIds: [...collection.trackIds, trackId] };
          }),
        });
        persistMeta();
      }

      function removeFromCollection(collectionId, trackId) {
        update({
          collections: state.collections.map((collection) => {
            if (collection.id !== collectionId) return collection;
            return { ...collection, trackIds: collection.trackIds.filter((id) => id !== trackId) };
          }),
        });
        persistMeta();
      }

      function openCollection(id) {
        update({ panel: 'detail', detailTab: 'collections', activeCollectionId: id });
      }

      function setActiveCollection(id) {
        update({ activeCollectionId: id, detailTab: 'collections' });
      }

      function openDetail(tab) {
        const detailTab = tab === 'favorites' || tab === 'library' || tab === 'collections' ? tab : 'playlist';
        update({
          panel: 'detail',
          detailTab,
          activeCollectionId: detailTab === 'collections' ? state.activeCollectionId : null,
        });
      }

      function openMini() {
        update({ panel: 'mini' });
      }

      function toggleMini() {
        update({ panel: state.panel === 'mini' ? 'none' : 'mini' });
      }

      function closePanels() {
        update({ panel: 'none' });
      }

      function setDetailTab(tab) {
        update({
          detailTab: tab,
          activeCollectionId: tab === 'collections' ? null : state.activeCollectionId,
        });
      }

      function setDeleteConfirm(value) {
        writeStored(DELETE_CONFIRM_KEY, value ? '1' : '0');
        update({ deleteConfirm: Boolean(value) });
      }

      function setAutoHide(value) {
        writeStored(AUTO_HIDE_KEY, value ? '1' : '0');
        update({ autoHide: Boolean(value) });
      }

      function setAutoHideDelay(value) {
        const delay = value === 10 || value === 30 ? value : 5;
        writeStored(AUTO_HIDE_DELAY_KEY, delay);
        update({ autoHideDelay: delay });
      }

      function setAutoHideOnlyPlaying(value) {
        writeStored(AUTO_HIDE_PLAYING_KEY, value ? '1' : '0');
        update({ autoHideOnlyPlaying: Boolean(value) });
      }

      function setCoverZoom(value) {
        const zoom = clamp(Number(value) || 1, 1, 2);
        writeStored(COVER_ZOOM_KEY, zoom);
        update({ coverZoom: zoom });
      }

      function scheduleZoomPersist(id) {
        pendingZoomPersist.add(id);
        if (zoomPersistTimer) window.clearTimeout(zoomPersistTimer);
        zoomPersistTimer = window.setTimeout(() => {
          zoomPersistTimer = null;
          for (const trackId of pendingZoomPersist) {
            const track = getTrack(trackId);
            if (track) {
              persistTrack(track).catch(() => {
                if (!disposed) update({ storageWarning: true });
              });
            }
          }
          pendingZoomPersist.clear();
        }, 400);
      }

      function setTrackCoverZoom(id, value) {
        const track = getTrack(id);
        if (!track) return;
        const zoom = clamp(Number(value) || 1, 1, 2);
        updateTrack(id, { coverZoom: zoom });
        scheduleZoomPersist(id);
      }

      function clearTrackCoverZoom(id) {
        const track = getTrack(id);
        if (!track) return;
        updateTrack(id, { coverZoom: 0 });
        scheduleZoomPersist(id);
      }

      function dismissOnboarding() {
        writeStored(ONBOARDING_KEY, '1');
        update({ onboardingSeen: true });
      }

      function showOnboarding() {
        update({ onboardingSeen: false });
      }

      function clearError() {
        update({ error: null, storageWarning: false });
      }

      async function setCustomIcon(file) {
        if (!file || !String(file.type || '').startsWith('image/')) {
          update({ error: 'icon' });
          return false;
        }
        if (file.size > MAX_ICON_SIZE) {
          update({ error: 'icon' });
          return false;
        }
        try {
          const raw = await blobToDataUrl(file);
          let data = raw;
          try {
            data = await resizeDataUrl(raw, 256, file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.9);
          } catch {
            data = raw;
          }
          writeStored(ICON_KEY, data);
          update({ customIcon: data, error: null });
          return true;
        } catch {
          update({ error: 'icon' });
          return false;
        }
      }

      function clearCustomIcon() {
        try { window.localStorage.removeItem(ICON_KEY); } catch { /* ignore */ }
        update({ customIcon: null });
      }

      function ensureCover(id) {
        const track = getTrack(id);
        if (!track || track.cover || coverRequests.has(id)) return;
        const blob = blobs.get(id);
        if (!blob) return;
        coverRequests.add(id);
        extractCover(blob).then((cover) => {
          if (disposed || !cover) return;
          const current = getTrack(id);
          if (!current || current.cover) return;
          updateTrack(id, { cover });
          persistTrack({ ...current, cover }).catch(() => {});
        }).catch(() => {}).finally(() => coverRequests.delete(id));
      }

      async function importEntries(entries) {
        if (disposed) return;
        const candidates = entries.filter((entry) => entry && entry.file && (
          String(entry.file.type || '').startsWith('audio/') || AUDIO_EXTENSION.test(entry.file.name || '')
        ));
        if (candidates.length === 0) {
          update({ error: 'unsupported' });
          return;
        }
        const existing = new Set(state.library.map((track) => `${track.name.toLowerCase()}|${track.size}`));
        const accepted = [];
        let tooLarge = 0;
        let duplicates = 0;
        for (const entry of candidates) {
          if (entry.file.size > MAX_FILE_SIZE) {
            tooLarge += 1;
            continue;
          }
          const name = (entry.file.name || 'Untitled audio').replace(/\.[^.]+$/, '') || 'Untitled audio';
          const key = `${name.toLowerCase()}|${entry.file.size}`;
          if (existing.has(key)) {
            duplicates += 1;
            continue;
          }
          existing.add(key);
          accepted.push({ ...entry, name });
        }
        if (accepted.length === 0) {
          update({ error: tooLarge > 0 ? 'tooLarge' : duplicates > 0 ? 'duplicate' : 'unsupported' });
          return;
        }

        const now = Date.now();
        const added = [];
        for (let index = 0; index < accepted.length; index += 1) {
          const entry = accepted[index];
          const file = entry.file;
          const id = makeId();
          const extension = file.name && file.name.includes('.') ? file.name.split('.').pop().toUpperCase() : '';
          const track = {
            id,
            name: entry.name,
            type: file.type || '',
            ext: extension,
            size: file.size,
            addedAt: now + index,
            duration: 0,
            favorite: false,
            cover: '',
            coverZoom: 0,
          };
          blobs.set(id, file);
          getUrl(id);
          if (entry.source) {
            sources.set(id, entry.source);
            persistSource(id).catch(() => {
              if (!disposed) update({ storageWarning: true });
            });
          }
          added.push(track);
        }

        const library = [...state.library, ...added];
        const playlist = [...state.playlist, ...added.map((track) => track.id)];
        const sourceIds = [...state.sourceIds, ...added.filter((track) => sources.has(track.id)).map((track) => track.id)];
        update({ library, playlist, sourceIds });
        if (!state.currentId) select(added[0].id, true);
        if (tooLarge > 0) update({ error: 'tooLarge' });
        else if (duplicates > 0) update({ error: 'duplicate' });

        Promise.all(added.map((track) => persistTrack(track))).catch(() => {
          if (!disposed) update({ storageWarning: true });
        });
        persistMeta();
        added.forEach((track) => ensureCover(track.id));
      }

      function importFiles(files) {
        return importEntries(Array.from(files || []).map((file) => ({ file })));
      }

      async function importDirectory() {
        if (typeof window.showDirectoryPicker !== 'function') {
          update({ error: 'folderUnsupported' });
          return;
        }
        try {
          const directory = await window.showDirectoryPicker({ mode: 'read' });
          const entries = [];
          for await (const [name, handle] of directory.entries()) {
            if (handle.kind !== 'file' || !AUDIO_EXTENSION.test(name)) continue;
            try {
              const file = await handle.getFile();
              entries.push({ file, source: { dirHandle: directory, fileName: name } });
            } catch {
              // Skip unreadable entries.
            }
          }
          if (entries.length === 0) {
            update({ error: 'folderNoAudio' });
            return;
          }
          await importEntries(entries);
        } catch (error) {
          if (error && error.name === 'AbortError') return;
          update({ error: 'folderRead' });
        }
      }

      async function deleteSourceFile(id) {
        const source = sources.get(id);
        if (!source || !source.dirHandle) return { ok: false, reason: 'unavailable' };
        try {
          let permission = 'granted';
          if (typeof source.dirHandle.queryPermission === 'function') {
            permission = await source.dirHandle.queryPermission({ mode: 'readwrite' });
          }
          if (permission !== 'granted' && typeof source.dirHandle.requestPermission === 'function') {
            permission = await source.dirHandle.requestPermission({ mode: 'readwrite' });
          }
          if (permission !== 'granted') return { ok: false, reason: 'denied' };
          await source.dirHandle.removeEntry(source.fileName);
          return { ok: true };
        } catch {
          return { ok: false, reason: 'failed' };
        }
      }

      async function deleteLibraryTrack(id, options = {}) {
        const track = getTrack(id);
        if (!track) return false;
        if (options.deleteSource) {
          const result = await deleteSourceFile(id);
          if (!result.ok) {
            update({ error: result.reason === 'denied' ? 'sourceDenied' : result.reason === 'unavailable' ? 'sourceUnavailable' : 'sourceFailed' });
            return false;
          }
        }

        const wasCurrent = state.currentId === id;
        const wasPlaying = wasCurrent && !audio.paused;
        const queueIndex = state.playlist.indexOf(id);
        const remainingPlaylist = state.playlist.filter((item) => item !== id);
        const fallbackCandidate = remainingPlaylist[Math.min(Math.max(queueIndex, 0), remainingPlaylist.length - 1)] || null;
        const fallback = fallbackCandidate && getTrack(fallbackCandidate) ? fallbackCandidate : null;
        const fallbackTrack = fallback ? getTrack(fallback) : null;

        if (wasCurrent) {
          audio.pause();
          audio.removeAttribute('src');
          audio.load();
        }
        const url = urls.get(id);
        if (url) URL.revokeObjectURL(url);
        urls.delete(id);
        blobs.delete(id);
        sources.delete(id);

        update({
          library: state.library.filter((item) => item.id !== id),
          playlist: remainingPlaylist,
          collections: state.collections.map((collection) => ({
            ...collection,
            trackIds: collection.trackIds.filter((trackId) => trackId !== id),
          })),
          sourceIds: state.sourceIds.filter((trackId) => trackId !== id),
          ...(wasCurrent ? {
            currentId: fallback,
            time: 0,
            duration: fallbackTrack ? fallbackTrack.duration : 0,
            playing: false,
          } : {}),
        });
        if (wasCurrent && fallback) select(fallback, wasPlaying);
        persistMeta();
        dbDelete('tracks', id).catch(() => {
          if (!disposed) update({ storageWarning: true });
        });
        dbDelete('sources', id).catch(() => {});
        if (options.dontAsk) setDeleteConfirm(false);
        update({ error: null });
        return true;
      }

      function updateDuration() {
        const duration = audio.duration;
        if (!Number.isFinite(duration) || duration <= 0 || !state.currentId) return;
        const track = getTrack(state.currentId);
        if (!track) return;
        if (Math.abs((track.duration || 0) - duration) < 0.5 && state.duration > 0) return;
        const library = state.library.map((item) => item.id === track.id ? { ...item, duration } : item);
        update({ library, duration });
        persistTrack({ ...track, duration }).catch(() => {});
      }

      const onTimeUpdate = () => {
        if (!disposed) update({ time: audio.currentTime || 0 });
      };
      const onLoadedMetadata = () => updateDuration();
      const onDurationChange = () => updateDuration();
      const onPlay = () => update({ playing: true, error: preserveNotice(state.error) });
      const onPause = () => update({ playing: false });
      const onEnded = () => {
        if (state.mode === 'one') {
          replay();
          return;
        }
        next(true);
      };
      const onError = () => {
        if (!disposed && state.currentId && audio.getAttribute('src')) {
          update({ playing: false, error: 'playback' });
        }
      };

      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('durationchange', onDurationChange);
      audio.addEventListener('play', onPlay);
      audio.addEventListener('pause', onPause);
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('error', onError);

      async function hydrate() {
        try {
          const [records, sourceRecords, meta] = await Promise.all([
            dbGetAll('tracks'),
            dbGetAll('sources').catch(() => []),
            dbGet('meta', 'state').catch(() => null),
          ]);
          if (disposed) return;
          const tracks = [];
          for (const record of records) {
            if (!record || !record.id || !(record.blob instanceof Blob)) continue;
            blobs.set(record.id, record.blob);
            tracks.push({
              id: record.id,
              name: record.name || 'Untitled audio',
              type: record.type || '',
              ext: record.ext || '',
              size: record.size || record.blob.size || 0,
              addedAt: record.addedAt || 0,
              duration: record.duration || 0,
              favorite: Boolean(record.favorite),
              cover: typeof record.cover === 'string' ? record.cover : '',
              coverZoom: Number.isFinite(Number(record.coverZoom)) && Number(record.coverZoom) > 0
                ? clamp(Number(record.coverZoom), 1, 2)
                : 0,
            });
          }
          tracks.sort((a, b) => a.addedAt - b.addedAt);
          const trackIds = new Set(tracks.map((track) => track.id));
          const validSources = new Map();
          for (const record of sourceRecords) {
            if (record && trackIds.has(record.id) && record.dirHandle) {
              validSources.set(record.id, { dirHandle: record.dirHandle, fileName: record.fileName });
            }
          }
          sources.clear();
          for (const [id, source] of validSources) sources.set(id, source);

          const hadState = meta && Array.isArray(meta.playlist);
          const playlist = hadState
            ? [...new Set(meta.playlist.filter((id) => trackIds.has(id)))]
            : tracks.map((track) => track.id);
          const collections = meta && Array.isArray(meta.collections)
            ? meta.collections
              .filter((collection) => collection && collection.id && typeof collection.name === 'string')
              .map((collection) => ({
                id: collection.id,
                name: collection.name,
                trackIds: Array.isArray(collection.trackIds)
                  ? [...new Set(collection.trackIds.filter((id) => trackIds.has(id)))]
                  : [],
              }))
            : [];
          const savedLast = readStoredString(LAST_KEY);
          const currentId = meta && meta.currentId && trackIds.has(meta.currentId)
            ? meta.currentId
            : savedLast && trackIds.has(savedLast)
              ? savedLast
              : playlist[0] || tracks[0]?.id || null;
          const mode = meta && (meta.mode === 'sequence' || meta.mode === 'one' || meta.mode === 'shuffle')
            ? meta.mode
            : state.mode;
          audio.loop = mode === 'one';
          update({
            library: tracks,
            playlist,
            collections,
            sourceIds: [...sources.keys()],
            currentId,
            mode,
            loading: false,
          });
          if (currentId) select(currentId, false);
          if (!hadState) persistMeta();
        } catch {
          if (!disposed) update({ loading: false, storageWarning: true });
        }
      }

      function dispose() {
        if (disposed) return;
        disposed = true;
        listeners.clear();
        if (zoomPersistTimer) window.clearTimeout(zoomPersistTimer);
        pendingZoomPersist.clear();
        audio.pause();
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.removeEventListener('durationchange', onDurationChange);
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('error', onError);
        audio.removeAttribute('src');
        audio.load();
        for (const url of urls.values()) URL.revokeObjectURL(url);
        urls.clear();
        blobs.clear();
        sources.clear();
        if (dbPromise) dbPromise.then((db) => db.close()).catch(() => {});
      }

      return {
        subscribe,
        getSnapshot,
        hydrate,
        dispose,
        play,
        toggle,
        select,
        playTrack,
        next: () => next(false),
        previous,
        seek,
        setVolume,
        toggleMute,
        cycleMode,
        setMode,
        toggleFavorite,
        addToPlaylist,
        removeFromPlaylist,
        moveInPlaylist,
        reorderPlaylist,
        playAll,
        createCollection,
        deleteCollection,
        addToCollection,
        removeFromCollection,
        openCollection,
        setActiveCollection,
        openDetail,
        openMini,
        toggleMini,
        closePanels,
        setDetailTab,
        setDeleteConfirm,
        setAutoHide,
        setAutoHideDelay,
        setAutoHideOnlyPlaying,
        setCoverZoom,
        setTrackCoverZoom,
        clearTrackCoverZoom,
        dismissOnboarding,
        showOnboarding,
        clearError,
        setCustomIcon,
        clearCustomIcon,
        importFiles,
        importDirectory,
        deleteLibraryTrack,
        clearFromPlaylist: removeFromPlaylist,
      };
    }

    function useLocaleRevision(ctx) {
      const [, bump] = React.useReducer((value) => value + 1, 0);
      React.useEffect(() => ctx.locale.subscribe(bump), [ctx]);
    }

    function createComponents(ctx, controller, t) {
      function usePlayer() {
        return React.useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
      }

      function modeLabel(mode, short) {
        if (mode === 'one') return t(short ? 'modeOneShort' : 'modeOne');
        if (mode === 'shuffle') return t(short ? 'modeShuffleShort' : 'modeShuffle');
        return t(short ? 'modeSequenceShort' : 'modeSequence');
      }

      function ModeIcon({ mode, size = 16 }) {
        if (mode === 'shuffle') return h(Icon, { name: 'shuffle', size });
        return h(React.Fragment, null,
          h(Icon, { name: 'repeat', size }),
          mode === 'one' ? h('span', { className: 'dsh-music-mode-one' }, '1') : null,
        );
      }

      function Cover({ face, iconSize = 24 }) {
        return h('span', { className: 'dsh-music-cover' },
          h(Icon, { name: 'note', size: iconSize }),
          face ? h('img', {
            key: face.length > 96 ? `${face.length}:${face.slice(-48)}` : face,
            src: face,
            alt: '',
            draggable: false,
            style: { display: 'block' },
            onError: (event) => { event.currentTarget.style.display = 'none'; },
          }) : null,
        );
      }

      function MiniEq() {
        return h('span', { className: 'dsh-music-eq', 'aria-hidden': true }, h('i'), h('i'), h('i'));
      }

      function IconButton({ label, onClick, active, danger, disabled, className, children }) {
        return h('button', {
          type: 'button',
          className: `dsh-music-iconbtn${active ? ' is-active' : ''}${danger ? ' is-danger' : ''}${className ? ` ${className}` : ''}`,
          title: label,
          'aria-label': label,
          disabled,
          onClick,
        }, children);
      }

      function RowButton({ label, onClick, active, danger, disabled, children }) {
        return h('button', {
          type: 'button',
          className: `dsh-music-rowbtn${active ? ' is-favorite' : ''}${danger ? ' is-danger' : ''}`,
          title: label,
          'aria-label': label,
          disabled,
          onClick,
        }, children);
      }

      function TrackRow({ track, index, current, playing, onPlay, hasSource, draggable, dragging, dropTarget, onDragStart, onDragOver, onDrop, onDragEnd, children }) {
        return h('div', {
          className: `dsh-music-row${current ? ' is-current' : ''}${dragging ? ' is-dragging' : ''}${dropTarget ? ' is-drop-target' : ''}`,
          draggable: draggable ? true : undefined,
          onDragStart,
          onDragOver,
          onDrop,
          onDragEnd,
        },
          h('button', {
            type: 'button',
            className: 'dsh-music-rowmain',
            title: t('playTrack'),
            onClick: onPlay,
          },
            h('span', { className: 'dsh-music-rowindex' },
              current && playing ? h(MiniEq) : String(index + 1).padStart(2, '0')),
            h('span', { className: 'dsh-music-rowtext' },
              h('span', { className: 'dsh-music-rowname' }, track.name),
              h('span', { className: 'dsh-music-rowmeta' },
                trackMetaText(track),
                hasSource ? h('span', { className: 'dsh-music-source-badge', title: t('sourceHint') },
                  h(Icon, { name: 'folder', size: 9 }),
                  t('sourceBadge'),
                ) : null,
              ),
            ),
          ),
          h('div', { className: 'dsh-music-rowactions' }, children),
        );
      }

      function EmptyState({ icon, title, hint, actions }) {
        return h('div', { className: 'dsh-music-empty' },
          h('span', { className: 'dsh-music-empty-icon' }, h(Icon, { name: icon, size: 19 })),
          h('span', { className: 'dsh-music-empty-title' }, title),
          h('span', null, hint),
          actions ? h('div', { className: 'dsh-music-empty-actions' }, actions) : null,
        );
      }

      function Modal({ title, onClose, children }) {
        React.useEffect(() => {
          const onKeyDown = (event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              event.stopPropagation();
              onClose();
            }
          };
          document.addEventListener('keydown', onKeyDown, true);
          return () => document.removeEventListener('keydown', onKeyDown, true);
        }, [onClose]);
        return h('div', {
          className: 'dsh-music-modal-backdrop',
          onPointerDown: (event) => { if (event.target === event.currentTarget) onClose(); },
        },
          h('div', {
            className: 'dsh-music-modal',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': title,
            onPointerDown: (event) => event.stopPropagation(),
          },
            h('div', { className: 'dsh-music-modal-head' },
              h('h3', { className: 'dsh-music-modal-title' }, title),
              h(IconButton, { label: t('close'), onClick: onClose }, h(Icon, { name: 'close', size: 14 })),
            ),
            h('div', { className: 'dsh-music-modal-body' }, children),
          ),
        );
      }

      function DeleteTrackDialog({ track, onClose }) {
        const snapshot = usePlayer();
        const [deleteSource, setDeleteSource] = React.useState(false);
        const [dontAsk, setDontAsk] = React.useState(false);
        const [busy, setBusy] = React.useState(false);
        const sourceAvailable = snapshot.sourceIds.includes(track.id);
        const confirm = async () => {
          setBusy(true);
          const ok = await controller.deleteLibraryTrack(track.id, { deleteSource, dontAsk });
          setBusy(false);
          if (ok) onClose();
        };
        return h(Modal, { title: t('deleteTitle'), onClose },
          h('p', null, t('deleteQuestion').replace('{name}', track.name)),
          h('p', null, t('deleteBody')),
          h('label', { className: 'dsh-music-option' },
            h('input', { type: 'radio', name: 'dsh-music-delete-mode', checked: !deleteSource, onChange: () => setDeleteSource(false) }),
            h('span', { className: 'dsh-music-option-text' },
              h('span', { className: 'dsh-music-option-title' }, t('deleteLibraryOnly')),
              h('span', { className: 'dsh-music-option-hint' }, t('deleteLibraryOnlyHint')),
            ),
          ),
          h('label', { className: `dsh-music-option${sourceAvailable ? '' : ' is-disabled'}` },
            h('input', {
              type: 'radio',
              name: 'dsh-music-delete-mode',
              checked: deleteSource,
              disabled: !sourceAvailable,
              onChange: () => setDeleteSource(true),
            }),
            h('span', { className: 'dsh-music-option-text' },
              h('span', { className: 'dsh-music-option-title' }, t('deleteSourceFile')),
              h('span', { className: 'dsh-music-option-hint' }, sourceAvailable ? t('deleteSourceHint') : t('deleteSourceUnavailable')),
            ),
          ),
          h('label', { className: 'dsh-music-check' },
            h('input', { type: 'checkbox', checked: dontAsk, onChange: (event) => setDontAsk(event.target.checked) }),
            h('span', null, t('deleteDontAsk')),
          ),
          h('p', { className: 'dsh-music-check' }, t('deleteDontAskHint')),
          snapshot.error ? h('p', { className: 'dsh-music-error-text' }, errorText(t, snapshot.error)) : null,
          h('div', { className: 'dsh-music-modal-actions' },
            h('button', { type: 'button', className: 'dsh-music-btn', onClick: onClose, disabled: busy }, t('cancel')),
            h('button', { type: 'button', className: 'dsh-music-btn danger', onClick: confirm, disabled: busy }, busy ? t('deleting') : t('delete')),
          ),
        );
      }

      function DeleteCollectionDialog({ collection, onClose }) {
        return h(Modal, { title: t('deleteCollection'), onClose },
          h('p', null, t('deleteCollectionQuestion').replace('{name}', collection.name)),
          h('div', { className: 'dsh-music-modal-actions' },
            h('button', { type: 'button', className: 'dsh-music-btn', onClick: onClose }, t('cancel')),
            h('button', {
              type: 'button',
              className: 'dsh-music-btn danger',
              onClick: () => { controller.deleteCollection(collection.id); onClose(); },
            }, t('delete')),
          ),
        );
      }

      function CreateCollectionDialog({ trackId, onClose }) {
        const [name, setName] = React.useState('');
        const submit = () => {
          const id = controller.createCollection(name);
          if (!id) return;
          if (trackId) controller.addToCollection(id, trackId);
          onClose();
        };
        return h(Modal, { title: t('newCollectionTitle'), onClose },
          h('p', null, t('collectionName')),
          h('input', {
            className: 'dsh-music-field',
            value: name,
            autoFocus: true,
            placeholder: t('collectionNamePlaceholder'),
            onChange: (event) => setName(event.target.value),
            onKeyDown: (event) => {
              if (event.key === 'Enter' && !(event.nativeEvent && event.nativeEvent.isComposing)) submit();
            },
          }),
          h('div', { className: 'dsh-music-modal-actions' },
            h('button', { type: 'button', className: 'dsh-music-btn', onClick: onClose }, t('cancel')),
            h('button', { type: 'button', className: 'dsh-music-btn primary', onClick: submit, disabled: !name.trim() }, t('create')),
          ),
        );
      }

      function CollectionPickerDialog({ track, onNew, onClose }) {
        const snapshot = usePlayer();
        return h(Modal, { title: t('collectionPickerTitle'), onClose },
          h('p', null, track.name),
          snapshot.collections.length === 0
            ? h('p', null, t('noCollections'))
            : h('div', { className: 'dsh-music-modal-list' },
              snapshot.collections.map((collection) => h('button', {
                key: collection.id,
                type: 'button',
                className: 'dsh-music-modal-row',
                onClick: () => { controller.addToCollection(collection.id, track.id); onClose(); },
              },
                h(Icon, { name: 'folder', size: 15 }),
                h('span', { className: 'dsh-music-modal-rowtext' }, collection.name),
                h('span', { className: 'dsh-music-modal-rowhint' }, t('collectionCount').replace('{count}', String(collection.trackIds.length))),
              )),
            ),
          h('div', { className: 'dsh-music-modal-actions' },
            h('button', { type: 'button', className: 'dsh-music-btn', onClick: onNew }, t('newCollection')),
          ),
        );
      }

      function SettingsSection({ title, children }) {
        return h('div', { className: 'dsh-music-setting-section' },
          h('div', { className: 'dsh-music-setting-title' }, title),
          children,
        );
      }

      function AppearanceDialog({ onChooseIcon, onClose }) {
        const snapshot = usePlayer();
        const globalZoom = Math.round(snapshot.coverZoom * 100) / 100;
        const currentTrack = snapshot.library.find((track) => track.id === snapshot.currentId);
        const trackOverride = currentTrack && currentTrack.coverZoom > 0 ? currentTrack.coverZoom : 0;
        const effectiveZoom = trackOverride || globalZoom;
        const previewFace = snapshot.customIcon || (currentTrack && currentTrack.cover) || '';
        return h(Modal, { title: t('appearanceTitle'), onClose },
          h(SettingsSection, { title: t('iconSection') },
            h('div', { className: 'dsh-music-appearance-preview' },
              h('span', {
                className: 'dsh-music-appearance-ball',
                style: { '--dsh-music-cover-scale': String(effectiveZoom) },
              }, h(Cover, { face: previewFace, iconSize: 24 })),
              h('span', { className: 'dsh-music-appearance-copy' },
                h('strong', null, snapshot.customIcon ? t('customIcon') : currentTrack && currentTrack.cover ? t('albumCover') : t('defaultIcon')),
                t('appearanceHint'),
              ),
            ),
            h('div', { className: 'dsh-music-modal-actions' },
              snapshot.customIcon ? h('button', {
                type: 'button',
                className: 'dsh-music-btn',
                onClick: () => controller.clearCustomIcon(),
              }, t('resetDefault')) : null,
              h('button', { type: 'button', className: 'dsh-music-btn primary', onClick: onChooseIcon }, t('chooseImage')),
            ),
            h('div', { className: 'dsh-music-setting-row' },
              h('span', { className: 'dsh-music-setting-rowlabel' },
                h('div', null, t('coverZoom')),
                h('div', { className: 'dsh-music-option-hint' }, t('coverZoomHint')),
              ),
              h('span', { className: 'dsh-music-setting-value' }, `${globalZoom.toFixed(2)}×`),
            ),
            h('input', {
              className: 'dsh-music-range',
              type: 'range',
              min: 1,
              max: 2,
              step: 0.05,
              value: snapshot.coverZoom,
              style: { '--dsh-music-pct': `${((snapshot.coverZoom - 1) / 1) * 100}%`, marginTop: '7px' },
              onChange: (event) => controller.setCoverZoom(Number(event.target.value)),
              'aria-label': t('coverZoom'),
            }),
          ),
          currentTrack ? h(SettingsSection, { title: t('currentCoverZoomSection') },
            h('div', { className: 'dsh-music-setting-row' },
              h('span', { className: 'dsh-music-setting-rowlabel' },
                h('div', null, t('currentCoverZoom')),
                h('div', { className: 'dsh-music-option-hint' }, trackOverride ? t('coverZoomHint') : t('followGlobal')),
              ),
              h('span', { className: 'dsh-music-setting-value' },
                `${effectiveZoom.toFixed(2)}×${trackOverride ? '' : ` · ${t('followGlobal')}`}`,
              ),
            ),
            h('input', {
              className: 'dsh-music-range',
              type: 'range',
              min: 1,
              max: 2,
              step: 0.05,
              value: effectiveZoom,
              style: { '--dsh-music-pct': `${((effectiveZoom - 1) / 1) * 100}%`, marginTop: '7px' },
              onChange: (event) => controller.setTrackCoverZoom(currentTrack.id, Number(event.target.value)),
              'aria-label': t('currentCoverZoom'),
            }),
            trackOverride ? h('div', { className: 'dsh-music-modal-actions' },
              h('button', {
                type: 'button',
                className: 'dsh-music-btn',
                onClick: () => controller.clearTrackCoverZoom(currentTrack.id),
              }, t('followGlobal')),
            ) : null,
          ) : null,
          h(SettingsSection, { title: t('autoHideSection') },
            h('label', { className: 'dsh-music-check' },
              h('input', {
                type: 'checkbox',
                checked: snapshot.autoHide,
                onChange: (event) => controller.setAutoHide(event.target.checked),
              }),
              h('span', null, t('autoHideSetting')),
            ),
            h('div', { className: 'dsh-music-setting-row' },
              h('span', { className: 'dsh-music-setting-rowlabel' }, t('autoHideDelay')),
              h('select', {
                className: 'dsh-music-select',
                value: snapshot.autoHideDelay,
                disabled: !snapshot.autoHide,
                onChange: (event) => controller.setAutoHideDelay(Number(event.target.value)),
              },
                [5, 10, 30].map((seconds) => h('option', { key: seconds, value: seconds },
                  t('seconds').replace('{count}', String(seconds)),
                )),
              ),
            ),
            h('label', { className: 'dsh-music-check' },
              h('input', {
                type: 'checkbox',
                checked: snapshot.autoHideOnlyPlaying,
                disabled: !snapshot.autoHide,
                onChange: (event) => controller.setAutoHideOnlyPlaying(event.target.checked),
              }),
              h('span', null, t('autoHideOnlyPlaying')),
            ),
            h('p', { className: 'dsh-music-option-hint', style: { marginTop: '4px' } }, t('autoHideHint')),
          ),
          h(SettingsSection, { title: t('deleteSection') },
            h('label', { className: 'dsh-music-check' },
              h('input', {
                type: 'checkbox',
                checked: snapshot.deleteConfirm,
                onChange: (event) => controller.setDeleteConfirm(event.target.checked),
              }),
              h('span', null, t('deleteConfirmSetting')),
            ),
          ),
          h(SettingsSection, { title: t('helpSection') },
            h('p', { className: 'dsh-music-option-hint' }, t('onboardingCover')),
            h('div', { className: 'dsh-music-modal-actions' },
              h('button', {
                type: 'button',
                className: 'dsh-music-btn',
                onClick: () => { controller.showOnboarding(); controller.closePanels(); },
              }, t('replayGuide')),
            ),
          ),
          snapshot.error ? h('p', { className: 'dsh-music-error-text' }, errorText(t, snapshot.error)) : null,
        );
      }

      function VolumeControl({ snapshot, below }) {
        const [open, setOpen] = React.useState(false);
        const rootRef = React.useRef(null);
        const volume = snapshot.muted ? 0 : Math.round(snapshot.volume * 100);

        React.useEffect(() => {
          if (!open) return undefined;
          const onPointerDown = (event) => {
            if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
          };
          document.addEventListener('pointerdown', onPointerDown, true);
          return () => document.removeEventListener('pointerdown', onPointerDown, true);
        }, [open]);

        return h('div', { className: 'dsh-music-volume-anchor', ref: rootRef },
          h('button', {
            type: 'button',
            className: 'dsh-music-mini-btn',
            title: t('volume'),
            'aria-label': t('volume'),
            'aria-expanded': open,
            onClick: () => setOpen((value) => !value),
          }, h(Icon, { name: snapshot.muted || snapshot.volume === 0 ? 'mute' : 'volume', size: 15 })),
          open ? h('div', { className: `dsh-music-volume-pop${below ? ' is-down' : ''}` },
            h('input', {
              className: 'dsh-music-range dsh-music-volume-slider',
              type: 'range',
              min: 0,
              max: 100,
              step: 1,
              value: volume,
              style: { '--dsh-music-pct': `${volume}%` },
              onChange: (event) => controller.setVolume(Number(event.target.value) / 100),
              'aria-label': t('volume'),
            }),
            h('span', { className: 'dsh-music-volume-value' }, `${volume}`),
          ) : null,
        );
      }

      function OnboardingTip({ placement, onClose }) {
        return h('div', {
          className: 'dsh-music-tip',
          style: { left: placement.left, top: placement.top, width: placement.width },
          role: 'dialog',
          'aria-label': t('onboardingTitle'),
        },
          h('div', { className: 'dsh-music-tip-title' }, t('onboardingTitle')),
          h('div', { className: 'dsh-music-tip-list' },
            h('div', { className: 'dsh-music-tip-row' }, h(Icon, { name: 'note', size: 13 }), h('span', null, t('onboardingDrag'))),
            h('div', { className: 'dsh-music-tip-row' }, h(Icon, { name: 'play', size: 13 }), h('span', null, t('onboardingClick'))),
            h('div', { className: 'dsh-music-tip-row' }, h(Icon, { name: 'image', size: 13 }), h('span', null, t('onboardingCover'))),
          ),
          h('div', { className: 'dsh-music-tip-actions' },
            h('button', { type: 'button', className: 'dsh-music-btn primary', onClick: onClose }, t('onboardingOk')),
          ),
        );
      }

      function MiniBar({ snapshot, current, placement }) {
        const face = snapshot.customIcon || (current && current.cover) || '';
        const hasTrack = Boolean(current);
        const progress = snapshot.duration > 0 ? Math.min(100, Math.max(0, (snapshot.time / snapshot.duration) * 100)) : 0;
        const volumeBelow = placement.top < window.innerHeight / 2;
        return h('div', {
          className: 'dsh-music-mini',
          style: { left: placement.left, top: placement.top, width: placement.width },
          role: 'dialog',
          'aria-label': t('title'),
        },
          h('div', { className: 'dsh-music-mini-head' },
            h('span', { className: 'dsh-music-mini-cover' }, h(Cover, { face, iconSize: 16 })),
            h('span', { className: 'dsh-music-mini-meta' },
              h('button', {
                type: 'button',
                className: 'dsh-music-mini-title',
                title: hasTrack ? current.name : t('noTrack'),
                onClick: () => controller.openDetail(snapshot.playlist.length > 0 ? 'playlist' : 'library'),
              }, hasTrack ? current.name : t('noTrack')),
              h('span', { className: 'dsh-music-mini-status' },
                snapshot.loading
                  ? t('loading')
                  : hasTrack
                    ? `${snapshot.playing ? t('nowPlaying') : t('paused')} · ${modeLabel(snapshot.mode)}`
                    : t('noTrackHint'),
              ),
            ),
          ),
          h('div', { className: 'dsh-music-mini-progress' },
            h('input', {
              className: 'dsh-music-range dsh-music-mini-range',
              type: 'range',
              min: 0,
              max: snapshot.duration || 1,
              step: 0.1,
              value: Math.min(snapshot.time, snapshot.duration || 1),
              disabled: !snapshot.duration,
              style: { '--dsh-music-pct': `${progress}%` },
              onChange: (event) => controller.seek(Number(event.target.value)),
              'aria-label': t('seek'),
            }),
            h('div', { className: 'dsh-music-mini-times' },
              h('span', null, formatTime(snapshot.time)),
              h('span', null, formatTime(snapshot.duration)),
            ),
          ),
          h('div', { className: 'dsh-music-mini-row' },
            h('button', {
              type: 'button',
              className: `dsh-music-mini-btn${current && current.favorite ? ' is-favorite' : ''}`,
              title: current && current.favorite ? t('unfavorite') : t('favorite'),
              'aria-label': current && current.favorite ? t('unfavorite') : t('favorite'),
              disabled: !hasTrack,
              onClick: () => current && controller.toggleFavorite(current.id),
            }, h(Icon, { name: 'heart', size: 16, filled: Boolean(current && current.favorite) })),
            h('button', {
              type: 'button',
              className: 'dsh-music-mini-btn',
              title: t('previous'),
              'aria-label': t('previous'),
              disabled: snapshot.playlist.length === 0,
              onClick: controller.previous,
            }, h(Icon, { name: 'previous', size: 15 })),
            h('button', {
              type: 'button',
              className: 'dsh-music-mini-btn dsh-music-mini-play',
              title: snapshot.playing ? t('pause') : t('play'),
              'aria-label': snapshot.playing ? t('pause') : t('play'),
              onClick: () => current ? controller.toggle() : controller.play(),
            }, h(Icon, { name: snapshot.playing ? 'pause' : 'play', size: 18 })),
            h('button', {
              type: 'button',
              className: 'dsh-music-mini-btn',
              title: t('next'),
              'aria-label': t('next'),
              disabled: snapshot.playlist.length === 0,
              onClick: () => controller.next(),
            }, h(Icon, { name: 'next', size: 15 })),
            h('button', {
              type: 'button',
              className: 'dsh-music-mini-btn',
              title: modeLabel(snapshot.mode),
              'aria-label': modeLabel(snapshot.mode),
              onClick: controller.cycleMode,
            }, h(ModeIcon, { mode: snapshot.mode, size: 15 })),
            h(VolumeControl, { snapshot, below: volumeBelow }),
            h('span', { className: 'dsh-music-mini-divider', 'aria-hidden': true }),
            h('button', {
              type: 'button',
              className: 'dsh-music-mini-btn',
              title: t('queue'),
              'aria-label': t('queue'),
              onClick: () => controller.openDetail('playlist'),
            }, h(Icon, { name: 'list', size: 16 })),
          ),
          snapshot.error || snapshot.storageWarning ? h('div', { className: 'dsh-music-mini-error' }, errorText(t, snapshot.error || 'storage')) : null,
        );
      }

      function DetailPanel({ snapshot, current, placement }) {
        const [modal, setModal] = React.useState(null);
        const [query, setQuery] = React.useState('');
        const [dragId, setDragId] = React.useState(null);
        const [dropId, setDropId] = React.useState(null);
        const fileRef = React.useRef(null);
        const iconRef = React.useRef(null);
        const byId = React.useMemo(() => new Map(snapshot.library.map((track) => [track.id, track])), [snapshot.library]);
        const favorites = React.useMemo(() => snapshot.library.filter((track) => track.favorite), [snapshot.library]);
        const playlistTracks = React.useMemo(
          () => snapshot.playlist.map((id) => byId.get(id)).filter(Boolean),
          [snapshot.playlist, byId],
        );
        const activeCollection = snapshot.activeCollectionId
          ? snapshot.collections.find((collection) => collection.id === snapshot.activeCollectionId)
          : null;
        const collectionTracks = activeCollection
          ? activeCollection.trackIds.map((id) => byId.get(id)).filter(Boolean)
          : [];
        const normalizedQuery = query.trim().toLowerCase();
        const matchesQuery = (track) => !normalizedQuery || track.name.toLowerCase().includes(normalizedQuery);
        const filteredPlaylist = playlistTracks.filter(matchesQuery);
        const filteredFavorites = favorites.filter(matchesQuery);
        const filteredLibrary = snapshot.library.filter(matchesQuery);
        const filteredCollection = collectionTracks.filter(matchesQuery);
        const detailFace = (current && current.cover) || snapshot.customIcon || '';
        const progress = snapshot.duration > 0 ? Math.min(100, Math.max(0, (snapshot.time / snapshot.duration) * 100)) : 0;
        const volume = snapshot.muted ? 0 : Math.round(snapshot.volume * 100);
        const sourceSupported = typeof window.showDirectoryPicker === 'function';
        const footerHint = snapshot.detailTab === 'library'
          ? t('libraryHint')
          : snapshot.detailTab === 'playlist'
            ? t('playlistHint')
            : t('storageHint');

        const openAdd = () => {
          if (fileRef.current) {
            fileRef.current.value = '';
            fileRef.current.click();
          }
        };
        const openIcon = () => {
          if (iconRef.current) {
            iconRef.current.value = '';
            iconRef.current.click();
          }
        };
        const requestDelete = (track) => {
          if (!snapshot.deleteConfirm) {
            controller.deleteLibraryTrack(track.id, {});
            return;
          }
          setModal({ type: 'delete', trackId: track.id });
        };
        const requestCollectionDelete = (collection) => setModal({ type: 'deleteCollection', collectionId: collection.id });
        const openCollectionPicker = (track) => setModal({ type: 'pickCollection', trackId: track.id });
        const deleteTrack = modal && modal.type === 'delete' ? byId.get(modal.trackId) : null;
        const deleteCollectionTarget = modal && modal.type === 'deleteCollection'
          ? snapshot.collections.find((collection) => collection.id === modal.collectionId)
          : null;
        const pickCollectionTrack = modal && modal.type === 'pickCollection' ? byId.get(modal.trackId) : null;

        const tabs = [
          { id: 'playlist', label: t('tabPlaylist'), count: playlistTracks.length },
          { id: 'favorites', label: t('tabFavorites'), count: favorites.length },
          { id: 'library', label: t('tabLibrary'), count: snapshot.library.length },
          { id: 'collections', label: t('tabCollections'), count: snapshot.collections.length },
        ];

        const heart = (track) => h(RowButton, {
          label: track.favorite ? t('unfavorite') : t('favorite'),
          active: track.favorite,
          onClick: () => controller.toggleFavorite(track.id),
        }, h(Icon, { name: 'heart', size: 13, filled: track.favorite }));

        const playlistView = playlistTracks.length === 0
          ? h(EmptyState, {
            icon: 'list',
            title: t('emptyPlaylist'),
            hint: t('emptyPlaylistHint'),
            actions: h('button', { type: 'button', className: 'dsh-music-btn', onClick: () => controller.setDetailTab('library') }, t('goLibrary')),
          })
          : filteredPlaylist.length === 0
            ? h(EmptyState, { icon: 'list', title: t('noSearchResults'), hint: t('searchPlaceholder') })
            : filteredPlaylist.map((track, index) => h(TrackRow, {
              key: track.id,
              track,
              index,
              current: track.id === snapshot.currentId,
              playing: snapshot.playing,
              hasSource: snapshot.sourceIds.includes(track.id),
              draggable: !normalizedQuery,
              dragging: dragId === track.id,
              dropTarget: Boolean(dragId && dropId === track.id && dragId !== track.id),
              onDragStart: (event) => {
                setDragId(track.id);
                if (event.dataTransfer) {
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', track.id);
                }
              },
              onDragOver: (event) => {
                if (!dragId || dragId === track.id) return;
                event.preventDefault();
                if (dropId !== track.id) setDropId(track.id);
              },
              onDrop: (event) => {
                if (!dragId) return;
                event.preventDefault();
                event.stopPropagation();
                if (dragId !== track.id) controller.reorderPlaylist(dragId, track.id);
                setDragId(null);
                setDropId(null);
              },
              onDragEnd: () => { setDragId(null); setDropId(null); },
              onPlay: () => controller.playTrack(track.id),
            },
              heart(track),
              h(RowButton, {
                label: t('moveUp'),
                disabled: playlistTracks.findIndex((item) => item.id === track.id) <= 0,
                onClick: () => controller.moveInPlaylist(track.id, -1),
              }, h(Icon, { name: 'up', size: 12 })),
              h(RowButton, {
                label: t('moveDown'),
                disabled: playlistTracks.findIndex((item) => item.id === track.id) === playlistTracks.length - 1,
                onClick: () => controller.moveInPlaylist(track.id, 1),
              }, h(Icon, { name: 'down', size: 12 })),
              h(RowButton, {
                label: t('removeFromPlaylist'),
                onClick: () => controller.removeFromPlaylist(track.id),
              }, h(Icon, { name: 'close', size: 12 })),
            ));

        const favoritesView = favorites.length === 0
          ? h(EmptyState, {
            icon: 'heart',
            title: t('emptyFavorites'),
            hint: t('emptyFavoritesHint'),
            actions: h('button', { type: 'button', className: 'dsh-music-btn', onClick: () => controller.setDetailTab('library') }, t('goLibrary')),
          })
          : filteredFavorites.length === 0
            ? h(EmptyState, { icon: 'heart', title: t('noSearchResults'), hint: t('searchPlaceholder') })
            : h(React.Fragment, null,
              h('div', { className: 'dsh-music-sectionhead' },
                h('span', null, t('collectionCount').replace('{count}', String(filteredFavorites.length))),
                h('button', {
                  type: 'button',
                  className: 'dsh-music-btn',
                  onClick: () => controller.playAll(filteredFavorites.map((track) => track.id)),
                }, t('playAll')),
              ),
              filteredFavorites.map((track, index) => h(TrackRow, {
                key: track.id,
                track,
                index,
                current: track.id === snapshot.currentId,
                playing: snapshot.playing,
                hasSource: snapshot.sourceIds.includes(track.id),
                onPlay: () => controller.playTrack(track.id),
              },
                heart(track),
                h(RowButton, {
                  label: t('addToPlaylist'),
                  onClick: () => controller.addToPlaylist(track.id),
                }, h(Icon, { name: 'plus', size: 12 })),
              )),
            );

        const libraryView = snapshot.library.length === 0
          ? h(EmptyState, {
            icon: 'note',
            title: t('emptyLibrary'),
            hint: t('importModesHint'),
            actions: h(React.Fragment, null,
              h('button', { type: 'button', className: 'dsh-music-btn primary', onClick: openAdd }, t('addCopy')),
              sourceSupported ? h('button', { type: 'button', className: 'dsh-music-btn', onClick: () => controller.importDirectory() }, t('importFolder')) : null,
            ),
          })
          : filteredLibrary.length === 0
            ? h(EmptyState, { icon: 'note', title: t('noSearchResults'), hint: t('searchPlaceholder') })
            : h(React.Fragment, null,
              h('div', { className: 'dsh-music-sectionhead' },
                h('span', null, t('collectionCount').replace('{count}', String(filteredLibrary.length))),
                h('button', {
                  type: 'button',
                  className: 'dsh-music-btn',
                  onClick: () => controller.playAll(filteredLibrary.map((track) => track.id)),
                }, t('playAll')),
              ),
              filteredLibrary.map((track, index) => h(TrackRow, {
                key: track.id,
                track,
                index,
                current: track.id === snapshot.currentId,
                playing: snapshot.playing,
                hasSource: snapshot.sourceIds.includes(track.id),
                onPlay: () => controller.playTrack(track.id),
              },
                heart(track),
                snapshot.playlist.includes(track.id) ? null : h(RowButton, {
                  label: t('addToPlaylist'),
                  onClick: () => controller.addToPlaylist(track.id),
                }, h(Icon, { name: 'plus', size: 12 })),
                h(RowButton, {
                  label: t('addToCollection'),
                  onClick: () => openCollectionPicker(track),
                }, h(Icon, { name: 'folderPlus', size: 13 })),
                h(RowButton, {
                  label: t('deleteFromLibrary'),
                  danger: true,
                  onClick: () => requestDelete(track),
                }, h(Icon, { name: 'trash', size: 12 })),
              )),
            );

        const collectionsView = activeCollection
          ? h(React.Fragment, null,
            h('div', { className: 'dsh-music-collection-head' },
              h(IconButton, { label: t('back'), onClick: () => { setQuery(''); controller.setActiveCollection(null); } }, h(Icon, { name: 'back', size: 15 })),
              h('span', { className: 'dsh-music-collection-headtext' },
                h('span', { className: 'dsh-music-collection-headname' }, activeCollection.name),
                h('span', { className: 'dsh-music-collection-headsub' }, t('collectionCount').replace('{count}', String(collectionTracks.length))),
              ),
              collectionTracks.length > 0 ? h('button', {
                type: 'button',
                className: 'dsh-music-btn',
                onClick: () => controller.playAll(collectionTracks.map((track) => track.id)),
              }, t('playAll')) : null,
              h(IconButton, { label: t('deleteCollection'), danger: true, onClick: () => requestCollectionDelete(activeCollection) }, h(Icon, { name: 'trash', size: 13 })),
            ),
            collectionTracks.length === 0
              ? h(EmptyState, {
                icon: 'folderPlus',
                title: t('emptyCollections'),
                hint: t('emptyCollectionsHint'),
                actions: h('button', { type: 'button', className: 'dsh-music-btn', onClick: () => controller.setDetailTab('library') }, t('goLibrary')),
              })
              : filteredCollection.length === 0
                ? h(EmptyState, { icon: 'folder', title: t('noSearchResults'), hint: t('searchPlaceholder') })
                : filteredCollection.map((track, index) => h(TrackRow, {
                  key: track.id,
                  track,
                  index,
                  current: track.id === snapshot.currentId,
                  playing: snapshot.playing,
                  hasSource: snapshot.sourceIds.includes(track.id),
                  onPlay: () => controller.playTrack(track.id),
                },
                  heart(track),
                  h(RowButton, {
                    label: t('addToPlaylist'),
                    onClick: () => controller.addToPlaylist(track.id),
                  }, h(Icon, { name: 'plus', size: 12 })),
                  h(RowButton, {
                    label: t('remove'),
                    onClick: () => controller.removeFromCollection(activeCollection.id, track.id),
                  }, h(Icon, { name: 'close', size: 12 })),
                )),
          )
          : snapshot.collections.length === 0
            ? h(EmptyState, {
              icon: 'folder',
              title: t('emptyCollections'),
              hint: t('emptyCollectionsHint'),
              actions: h('button', { type: 'button', className: 'dsh-music-btn primary', onClick: () => setModal({ type: 'newCollection' }) }, t('newCollection')),
            })
            : h(React.Fragment, null,
              h('div', { className: 'dsh-music-collection-head' },
                h('span', { className: 'dsh-music-collection-headtext' },
                  h('span', { className: 'dsh-music-collection-headname' }, t('tabCollections')),
                  h('span', { className: 'dsh-music-collection-headsub' }, t('collectionCount').replace('{count}', String(snapshot.collections.length))),
                ),
                h('button', { type: 'button', className: 'dsh-music-btn primary', onClick: () => setModal({ type: 'newCollection' }) }, t('newCollection')),
              ),
              h('div', { className: 'dsh-music-collection-list' },
                snapshot.collections.map((collection) => h('div', { key: collection.id, className: 'dsh-music-collection' },
                  h('button', {
                    type: 'button',
                    className: 'dsh-music-collection-main',
                    onClick: () => { setQuery(''); controller.openCollection(collection.id); },
                  },
                    h('span', { className: 'dsh-music-collection-icon' }, h(Icon, { name: 'folder', size: 16 })),
                    h('span', { className: 'dsh-music-collection-text' },
                      h('span', { className: 'dsh-music-collection-name' }, collection.name),
                      h('span', { className: 'dsh-music-collection-count' }, t('collectionCount').replace('{count}', String(collection.trackIds.length))),
                    ),
                  ),
                  h(IconButton, { label: t('deleteCollection'), danger: true, onClick: () => requestCollectionDelete(collection) }, h(Icon, { name: 'trash', size: 13 })),
                )),
              ),
            );

        let content;
        if (snapshot.detailTab === 'favorites') content = favoritesView;
        else if (snapshot.detailTab === 'library') content = libraryView;
        else if (snapshot.detailTab === 'collections') content = collectionsView;
        else content = playlistView;

        return h('section', {
          className: 'dsh-music-detail',
          style: { left: placement.left, top: placement.top, width: placement.width, height: placement.height },
          role: 'dialog',
          'aria-label': t('title'),
          onDragOver: (event) => event.preventDefault(),
          onDrop: (event) => {
            event.preventDefault();
            if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
              controller.importFiles(event.dataTransfer.files);
            }
          },
        },
          h('header', { className: 'dsh-music-detail-head' },
            h('span', { style: { display: 'inline-flex', color: 'var(--dsw-alias-brand-primary)' } }, h(Icon, { name: 'note', size: 15 })),
            h('h2', { className: 'dsh-music-detail-title' }, t('title')),
            h('span', { className: 'dsh-music-detail-count' }, String(snapshot.library.length)),
            h('div', { className: 'dsh-music-detail-head-actions' },
              h(IconButton, { label: t('addCopy'), onClick: openAdd }, h(Icon, { name: 'plus', size: 15 })),
              sourceSupported ? h(IconButton, { label: t('importFolder'), onClick: () => controller.importDirectory() }, h(Icon, { name: 'folderPlus', size: 15 })) : null,
              h(IconButton, { label: t('customizeIcon'), onClick: () => setModal({ type: 'appearance' }) }, h(Icon, { name: 'settings', size: 15 })),
              h(IconButton, { label: t('close'), onClick: controller.closePanels }, h(Icon, { name: 'close', size: 15 })),
            ),
          ),
          snapshot.error || snapshot.storageWarning ? h('div', { className: 'dsh-music-error', role: 'alert' },
            h('span', null, errorText(t, snapshot.error || 'storage')),
            h('button', { type: 'button', onClick: controller.clearError, 'aria-label': t('dismiss') }, '×'),
          ) : null,
          h('div', { className: 'dsh-music-detail-now' },
            h('span', { className: 'dsh-music-detail-cover' }, h(Cover, { face: detailFace, iconSize: 21 })),
            h('span', { className: 'dsh-music-detail-nowmeta' },
              h('span', { className: 'dsh-music-detail-name' }, current ? current.name : t('noTrack')),
              h('span', { className: 'dsh-music-detail-sub' },
                current
                  ? `${snapshot.playing ? t('nowPlaying') : t('paused')} · ${modeLabel(snapshot.mode)} · ${trackMetaText(current)}`
                  : t('noTrackHint'),
              ),
            ),
            h('span', { className: 'dsh-music-detail-nowactions' },
              current ? h(IconButton, {
                label: current.favorite ? t('unfavorite') : t('favorite'),
                active: current.favorite,
                onClick: () => controller.toggleFavorite(current.id),
              }, h(Icon, { name: 'heart', size: 15, filled: current.favorite })) : null,
              h(IconButton, { label: t('previous'), onClick: controller.previous }, h(Icon, { name: 'previous', size: 14 })),
              h('button', {
                type: 'button',
                className: 'dsh-music-detail-play',
                title: snapshot.playing ? t('pause') : t('play'),
                'aria-label': snapshot.playing ? t('pause') : t('play'),
                onClick: () => current ? controller.toggle() : controller.play(),
              }, h(Icon, { name: snapshot.playing ? 'pause' : 'play', size: 17 })),
              h(IconButton, { label: t('next'), onClick: () => controller.next() }, h(Icon, { name: 'next', size: 14 })),
            ),
          ),
          h('div', { className: 'dsh-music-detail-seek' },
            h('input', {
              className: 'dsh-music-range',
              type: 'range',
              min: 0,
              max: snapshot.duration || 1,
              step: 0.1,
              value: Math.min(snapshot.time, snapshot.duration || 1),
              disabled: !snapshot.duration,
              style: { '--dsh-music-pct': `${progress}%` },
              onChange: (event) => controller.seek(Number(event.target.value)),
              'aria-label': t('seek'),
            }),
            h('div', { className: 'dsh-music-times' },
              h('span', null, formatTime(snapshot.time)),
              h('span', null, formatTime(snapshot.duration)),
            ),
          ),
          h('div', { className: 'dsh-music-tabs', role: 'tablist' },
            tabs.map((tab) => h('button', {
              key: tab.id,
              type: 'button',
              role: 'tab',
              'aria-selected': snapshot.detailTab === tab.id,
              className: `dsh-music-tab${snapshot.detailTab === tab.id ? ' is-active' : ''}`,
              onClick: () => { setQuery(''); controller.setDetailTab(tab.id); },
            }, tab.label, h('span', { className: 'dsh-music-tabcount' }, String(tab.count)))),
          ),
          snapshot.detailTab === 'collections' && !activeCollection
            ? null
            : h('div', { className: 'dsh-music-search' },
              h('span', { className: 'dsh-music-searchicon' }, h(Icon, { name: 'search', size: 13 })),
              h('input', {
                value: query,
                placeholder: t('searchPlaceholder'),
                'aria-label': t('searchPlaceholder'),
                onChange: (event) => setQuery(event.target.value),
                onKeyDown: (event) => {
                  if (event.key === 'Escape' && query) {
                    event.stopPropagation();
                    setQuery('');
                  }
                },
              }),
              query ? h(IconButton, { label: t('clearSearch'), onClick: () => setQuery('') }, h(Icon, { name: 'close', size: 12 })) : null,
            ),
          h('div', { className: 'dsh-music-content' }, content),
          h('footer', { className: 'dsh-music-footer' },
            h('span', null, footerHint),
            h('div', { className: 'dsh-music-volume' },
              h(IconButton, {
                label: snapshot.muted || snapshot.volume === 0 ? t('unmute') : t('mute'),
                onClick: controller.toggleMute,
              }, h(Icon, { name: snapshot.muted || snapshot.volume === 0 ? 'mute' : 'volume', size: 14 })),
              h('input', {
                className: 'dsh-music-range',
                type: 'range',
                min: 0,
                max: 100,
                step: 1,
                value: volume,
                style: { '--dsh-music-pct': `${volume}%` },
                onChange: (event) => controller.setVolume(Number(event.target.value) / 100),
                'aria-label': t('volume'),
              }),
            ),
          ),
          h('input', {
            ref: fileRef,
            type: 'file',
            accept: 'audio/*,.mp3,.wav,.ogg,.oga,.m4a,.aac,.flac,.opus,.webm,.weba,.wma,.aiff,.aif',
            multiple: true,
            style: { display: 'none' },
            onChange: (event) => {
              controller.importFiles(event.target.files);
              event.target.value = '';
            },
          }),
          h('input', {
            ref: iconRef,
            type: 'file',
            accept: 'image/*',
            style: { display: 'none' },
            onChange: async (event) => {
              const file = event.target.files && event.target.files[0];
              event.target.value = '';
              if (!file) return;
              const ok = await controller.setCustomIcon(file);
              if (ok) setModal(null);
            },
          }),
          modal && modal.type === 'delete' && deleteTrack
            ? h(DeleteTrackDialog, { key: deleteTrack.id, track: deleteTrack, onClose: () => setModal(null) })
            : null,
          modal && modal.type === 'deleteCollection' && deleteCollectionTarget
            ? h(DeleteCollectionDialog, { key: deleteCollectionTarget.id, collection: deleteCollectionTarget, onClose: () => setModal(null) })
            : null,
          modal && modal.type === 'newCollection'
            ? h(CreateCollectionDialog, { key: modal.trackId || 'new', trackId: modal.trackId, onClose: () => setModal(null) })
            : null,
          modal && modal.type === 'pickCollection' && pickCollectionTrack
            ? h(CollectionPickerDialog, {
              key: pickCollectionTrack.id,
              track: pickCollectionTrack,
              onNew: () => setModal({ type: 'newCollection', trackId: pickCollectionTrack.id }),
              onClose: () => setModal(null),
            })
            : null,
          modal && modal.type === 'appearance'
            ? h(AppearanceDialog, { onChooseIcon: openIcon, onClose: () => setModal(null) })
            : null,
          h('style', null, CSS),
        );
      }

      function Overlay() {
        const snapshot = usePlayer();
        useLocaleRevision(ctx);
        const [viewport, setViewport] = React.useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
        const [position, setPosition] = React.useState(() => readBallPosition() || defaultBallPosition());
        const [dragging, setDragging] = React.useState(false);
        const [snapping, setSnapping] = React.useState(false);
        const [hidden, setHidden] = React.useState(false);
        const [hovered, setHovered] = React.useState(false);
        const [focused, setFocused] = React.useState(false);
        const positionRef = React.useRef(position);
        const restPositionRef = React.useRef(null);
        const dragRef = React.useRef(null);
        const suppressClickRef = React.useRef(false);
        const clickTimerRef = React.useRef(null);
        const snapTimerRef = React.useRef(null);

        const commitPosition = (next, save) => {
          positionRef.current = next;
          setPosition(next);
          if (save) saveBallPosition(next);
        };

        const pulseSnap = () => {
          setSnapping(true);
          if (snapTimerRef.current) window.clearTimeout(snapTimerRef.current);
          snapTimerRef.current = window.setTimeout(() => setSnapping(false), 280);
        };

        const snapNow = () => {
          const snapped = nearestWall(positionRef.current);
          saveBallPosition(snapped);
          if (snapped.x === positionRef.current.x && snapped.y === positionRef.current.y) return;
          pulseSnap();
          commitPosition(snapped, true);
        };

        const revealNow = () => {
          if (!hidden) return;
          const full = restPositionRef.current || nearestWall(positionRef.current);
          setHidden(false);
          pulseSnap();
          commitPosition(full, true);
        };

        const hideNow = () => {
          if (!snapshot.autoHide || !snapshot.onboardingSeen || hidden || dragging || hovered || focused || snapshot.panel !== 'none') return;
          if (snapshot.autoHideOnlyPlaying && !snapshot.playing) return;
          if (document.querySelector('.dsh-music-ball:hover')) return;
          const full = nearestWall(positionRef.current);
          restPositionRef.current = full;
          saveBallPosition(full);
          const side = wallSide(full, viewport);
          const target = halfHiddenPosition(full, side, viewport);
          setHidden(true);
          pulseSnap();
          commitPosition(target, false);
        };

        React.useEffect(() => {
          const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
          window.addEventListener('resize', onResize);
          return () => window.removeEventListener('resize', onResize);
        }, []);

        React.useEffect(() => {
          if (hidden) {
            const full = nearestWall(restPositionRef.current || positionRef.current);
            restPositionRef.current = full;
            saveBallPosition(full);
            commitPosition(halfHiddenPosition(full, wallSide(full, viewport), viewport), false);
          } else {
            const clamped = nearestWall(positionRef.current);
            commitPosition(clamped, true);
          }
        }, [viewport.w, viewport.h]);

        React.useEffect(() => {
          if (snapshot.panel !== 'none' && !snapshot.onboardingSeen) controller.dismissOnboarding();
        }, [snapshot.panel, snapshot.onboardingSeen]);

        React.useEffect(() => {
          if (snapshot.panel !== 'none' || hovered || focused || !snapshot.autoHide || (snapshot.autoHideOnlyPlaying && !snapshot.playing)) revealNow();
        }, [snapshot.panel, hovered, focused, snapshot.autoHide, snapshot.autoHideOnlyPlaying, snapshot.playing]);

        React.useEffect(() => {
          if (dragging || hidden || hovered || focused || snapshot.panel !== 'none') return undefined;
          const timer = window.setTimeout(() => snapNow(), 1200);
          return () => window.clearTimeout(timer);
        }, [dragging, hidden, hovered, focused, snapshot.panel, position.x, position.y, viewport.w, viewport.h]);

        React.useEffect(() => {
          if (!snapshot.autoHide || !snapshot.onboardingSeen || dragging || hidden || hovered || focused || snapshot.panel !== 'none') return undefined;
          if (snapshot.autoHideOnlyPlaying && !snapshot.playing) return undefined;
          const timer = window.setTimeout(() => hideNow(), snapshot.autoHideDelay * 1000);
          return () => window.clearTimeout(timer);
        }, [snapshot.autoHide, snapshot.onboardingSeen, snapshot.autoHideDelay, snapshot.autoHideOnlyPlaying, snapshot.playing, dragging, hidden, hovered, focused, snapshot.panel, viewport.w, viewport.h]);

        React.useEffect(() => () => {
          if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
          if (snapTimerRef.current) window.clearTimeout(snapTimerRef.current);
        }, []);

        React.useEffect(() => {
          if (snapshot.panel === 'none') return undefined;
          const onPointerDown = (event) => {
            const target = event.target;
            if (target && target.closest && target.closest('.dsh-music-ball, .dsh-music-mini, .dsh-music-detail')) return;
            controller.closePanels();
          };
          const onKeyDown = (event) => {
            if (event.key !== 'Escape') return;
            if (document.querySelector('.dsh-music-modal-backdrop')) return;
            controller.closePanels();
          };
          document.addEventListener('pointerdown', onPointerDown, true);
          document.addEventListener('keydown', onKeyDown);
          return () => {
            document.removeEventListener('pointerdown', onPointerDown, true);
            document.removeEventListener('keydown', onKeyDown);
          };
        }, [snapshot.panel]);

        const current = snapshot.library.find((track) => track.id === snapshot.currentId) || null;
        const face = snapshot.customIcon || (current && current.cover) || '';
        const effectiveCoverZoom = current && current.coverZoom > 0 ? current.coverZoom : snapshot.coverZoom;
        const progress = snapshot.duration > 0 ? Math.min(1, Math.max(0, snapshot.time / snapshot.duration)) : 0;
        const label = current
          ? `${snapshot.playing ? t('ballPlaying') : t('ballPaused')}: ${current.name}`
          : t('ballLabel');
        const title = `${label}\n${t('ballHint')}`;
        const placementPosition = hidden && restPositionRef.current ? restPositionRef.current : position;
        const placement = snapshot.panel === 'detail'
          ? computePlacement(placementPosition, 'detail', viewport)
          : computePlacement(placementPosition, 'mini', viewport);
        const tipPlacement = computePlacement(placementPosition, 'tip', viewport);

        const onPointerDown = (event) => {
          if (event.button !== 0) return;
          const wasHidden = hidden;
          if (wasHidden) revealNow();
          const origin = wasHidden ? (restPositionRef.current || positionRef.current) : positionRef.current;
          dragRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            origin,
            moved: false,
            pointerId: event.pointerId,
          };
          try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* ignore */ }
        };
        const onPointerMove = (event) => {
          const drag = dragRef.current;
          if (!drag) return;
          const dx = event.clientX - drag.startX;
          const dy = event.clientY - drag.startY;
          if (!drag.moved && Math.hypot(dx, dy) > 4) {
            drag.moved = true;
            setDragging(true);
            setSnapping(false);
            controller.closePanels();
          }
          if (drag.moved) {
            commitPosition(clampBall({ x: drag.origin.x + dx, y: drag.origin.y + dy }), false);
          }
        };
        const finishDrag = (event) => {
          const drag = dragRef.current;
          if (!drag) return;
          dragRef.current = null;
          try {
            if (event.currentTarget.hasPointerCapture && event.currentTarget.hasPointerCapture(drag.pointerId)) {
              event.currentTarget.releasePointerCapture(drag.pointerId);
            }
          } catch { /* ignore */ }
          setDragging(false);
          if (drag.moved) {
            suppressClickRef.current = true;
            window.setTimeout(() => { suppressClickRef.current = false; }, 320);
            snapNow();
          }
        };
        const onClick = (event) => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            return;
          }
          if (event.detail >= 2) {
            if (clickTimerRef.current) {
              window.clearTimeout(clickTimerRef.current);
              clickTimerRef.current = null;
            }
            controller.openDetail(snapshot.playlist.length > 0 ? 'playlist' : 'library');
            return;
          }
          if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
          clickTimerRef.current = window.setTimeout(() => {
            clickTimerRef.current = null;
            controller.toggleMini();
          }, 230);
        };
        const onKeyDown = (event) => {
          if (event.key === 'Enter' && event.shiftKey) {
            event.preventDefault();
            controller.openDetail(snapshot.playlist.length > 0 ? 'playlist' : 'library');
          }
        };

        return h(React.Fragment, null,
          h('style', null, CSS),
          h('button', {
            type: 'button',
            className: `dsh-music-ball${snapshot.playing ? ' is-playing' : ''}${dragging ? ' is-dragging' : ''}${snapping ? ' is-snapping' : ''}${hidden ? ' is-hidden' : ''}`,
            style: {
              left: position.x,
              top: position.y,
              '--dsh-music-cover-scale': String(effectiveCoverZoom),
            },
            title,
            'aria-label': title,
            'aria-haspopup': 'dialog',
            'aria-expanded': snapshot.panel !== 'none',
            onPointerDown,
            onPointerMove,
            onPointerUp: finishDrag,
            onPointerCancel: finishDrag,
            onPointerEnter: () => { setHovered(true); if (hidden) revealNow(); },
            onPointerLeave: () => setHovered(false),
            onFocus: (event) => {
              const keyboardFocus = event.target && event.target.matches && event.target.matches(':focus-visible');
              setFocused(Boolean(keyboardFocus));
              if (hidden) revealNow();
            },
            onBlur: () => setFocused(false),
            onClick,
            onDoubleClick: (event) => event.preventDefault(),
            onKeyDown,
            onContextMenu: (event) => {
              event.preventDefault();
              controller.openDetail(snapshot.playlist.length > 0 ? 'playlist' : 'library');
            },
          },
            h('svg', { className: 'dsh-music-ring', viewBox: '0 0 64 64', 'aria-hidden': true },
              h('circle', { className: 'dsh-music-ring-track', cx: 32, cy: 32, r: RING_RADIUS }),
              h('circle', {
                className: 'dsh-music-ring-progress',
                cx: 32,
                cy: 32,
                r: RING_RADIUS,
                style: {
                  strokeDasharray: `${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`,
                  strokeDashoffset: `${RING_CIRCUMFERENCE * (1 - progress)}`,
                },
              }),
            ),
            h('span', { className: 'dsh-music-ball-disc' },
              h('span', { className: 'dsh-music-ball-spin' },
                h(Cover, { face, iconSize: 28 }),
              ),
            ),
          ),
          snapshot.panel === 'mini'
            ? h(MiniBar, { snapshot, current, placement })
            : null,
          snapshot.panel === 'detail'
            ? h(DetailPanel, { snapshot, current, placement })
            : null,
          snapshot.panel === 'none' && !snapshot.onboardingSeen
            ? h(OnboardingTip, { placement: tipPlacement, onClose: controller.dismissOnboarding })
            : null,
        );
      }

      return { Overlay };
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        const controller = createController();
        ctx.effect(() => () => controller.dispose(), 'music-player: controller');
        ctx.effect(() => ctx.locale.register('music-player', LOCALE), 'music-player: locale');
        const t = ctx.locale.bind('music-player');
        const { Overlay } = createComponents(ctx, controller, t);

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'dsh-music-ball',
          order: 20,
        }, Overlay));

        controller.hydrate();
      },
    };
  },
});
