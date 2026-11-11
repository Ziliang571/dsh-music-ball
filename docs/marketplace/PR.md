# Catalog PR text

Use this when opening a pull request against
`https://github.com/awesome-dsh-plugin/awesome-dsh-plugin`.

## Title

`Add dsh-music-ball`

## Body

```markdown
Adds `dsh-music-ball`, a draggable music ball for the DSH Web UI.

- npm: `dsh-music-ball` (available at submission time)
- source: https://github.com/Ziliang571/dsh-music-ball
- category: `fun`
- `dsh.bundle` + `cordis.patch.yml` are present.
- Client-only UI plugin; no Host services, no network calls.
- Local audio is stored in IndexedDB; source-file deletion is limited to folder-authorized tracks via the File System Access API.

Catalog entry: `data/plugins/Ziliang571__dsh-music-ball.yml`.
Regenerated both READMEs with `node scripts/generate-readme.mjs`.
```

## Checklist

- [ ] Repository has the `dsh-plugin` topic.
- [ ] Repository is at least 1 day old.
- [ ] Repository has at least 10 commits.
- [ ] `dsh.bundle` is present in `package.json`.
- [ ] `data/plugins/Ziliang571__dsh-music-ball.yml` added.
- [ ] READMEs regenerated.
- [ ] npm package published (recommended).
- [ ] Optional release tarball attached.
- [ ] Optional screenshots added to `data/screenshots.json`.
