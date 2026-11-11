# GitHub web upload guide

The Edge login is not available to `git`, `gh`, or `npm` in this session. Use this guide if you want to publish without installing a CLI.

## 1. Create the repository

1. In Edge, open <https://github.com/new>.
2. Owner: `Ziliang571`.
3. Repository name: `dsh-music-ball`.
4. Visibility: Public.
5. Do **not** initialize with README, license, or .gitignore.
6. Create repository.

## 2. Upload the prepared files

Extract `dsh-music-ball-repo.zip` from `D:\20319\Documents\dist`.

On the empty repository page, choose **uploading an existing file**, drag the extracted
contents (not the parent folder), and commit with:

`Initial release v1.0.0`

Verify that `package.json`, `host.cjs`, `client.js`, `cordis.patch.yml`, `README.md`,
`LICENSE`, `CHANGELOG.md`, `icon.svg`, and `locale/` are present.

## 3. Add the `dsh-plugin` topic

Repository page → **About** gear → **Topics** → add `dsh-plugin` → Save.

## 4. Meet the catalog gates

The catalog requires:

- repository age at least **1 day**;
- at least **10 commits**.

A single upload is not enough. Use GitHub Desktop or `gh` to push the prepared
history, or make real follow-up commits over the next day (README fixes, issue
templates, tests, release notes). Do not add empty/no-op commits solely to inflate
the count; the catalog is curated.

## 5. Optional npm release

```sh
cd D:\20319\Documents\dsh-plugins\dsh-music-ball
npm login --registry=https://registry.npmjs.org/
npm publish --access public
```

The package name `dsh-music-ball` was available when checked. npm publishing is
recommended but the catalog can install from GitHub without it.

## 6. Catalog pull request

1. Fork <https://github.com/awesome-dsh-plugin/awesome-dsh-plugin>.
2. Add `data/plugins/Ziliang571__dsh-music-ball.yml` using the prepared file in
   `docs/marketplace/`.
3. Locally or in a Codespace run:

   ```sh
   npm ci
   node scripts/generate-readme.mjs
   ```

4. Commit the YAML and regenerated READMEs.
5. Open a PR using `docs/marketplace/PR.md`.
6. Wait for the repository age/commit gates to pass; resubmit if needed.

## Faster path

Install GitHub CLI, then authenticate through Edge:

```powershell
winget install --id GitHub.cli -e
gh auth login
```

Choose GitHub.com → HTTPS → Login with a web browser. After that, tell the agent
it is authenticated; the repository creation, push, release, and catalog PR can be
finished from the terminal without exposing browser cookies.
