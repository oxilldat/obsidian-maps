# Release checklist

## Before publishing 0.1.0

- Run `npm ci`, `npm run lint`, and `npm run build`.
- Test marker clicks, empty-map clicks, quick commands, and Oxill Forms integration on desktop and mobile.
- Create a GitHub release tagged `oxill-maps-0.1.0` with `main.js`, `manifest.json`, and `styles.css` as separate assets. The prefixed tag avoids collisions with tags inherited from the upstream fork.
- Keep `manifest.json`, `package.json`, and `versions.json` on the same version.
- For an Obsidian Community directory submission, obtain publicly verifiable approval from the original Obsidian Maps author first, as required by the community plugin fork policy.

## Release notes

See [CHANGELOG.md](CHANGELOG.md).
