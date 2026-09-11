# Changesets

This folder holds [changesets](https://github.com/changesets/changesets): one small file per
pull request describing what changed and how big the change is. `pnpm changeset` creates one,
`pnpm version-packages` turns the accumulated files into version bumps and CHANGELOG entries.

The version a changeset produces is also the version that must be written into
`meta.version` of every registry item that ships the changed code — that field is the only
version marker a consumer of the registry ever sees.
