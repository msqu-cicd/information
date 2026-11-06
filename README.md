# information

JavaScript action that exposes git ref, branch, tag, semver and CI hostname
information as step outputs. The collectors in `src/` are also importable as a
library (`collect_all`, `collect_git`, `collect_ci`).

## Usage

```yaml
- id: info
  uses: CICD/information@main
  with:
    strip_tag_prefix: v

- run: echo "tag=${{ steps.info.outputs.git_tag }}"
```

## Inputs

| Input | Default | Description |
|---|---|---|
| `strip_tag_prefix` | `""` | Prefix stripped from the tag, e.g. `v` turns tag `v0.0.1` into `0.0.1`. |

## Outputs

Flags are the strings `"true"`/`"false"`; unset values are empty strings.

| Output | Description |
|---|---|
| `git_is_branch` | `"true"` when run for a regular branch (not tag, not PR). |
| `git_is_tag` | `"true"` when run for a tag. |
| `git_is_pull_request` | `"true"` when run for a pull request. |
| `git_is_default_branch` | `"true"` when the current branch is the default branch. |
| `git_default_branch` | Default branch name, e.g. `main`. |
| `git_current_branch` | Current branch name; on PRs the head branch. |
| `git_ref_branch` | Branch from the triggering ref, e.g. `main`, `7/merge`. |
| `git_base_ref_branch` | PR target branch, e.g. `main` (empty outside PRs). |
| `git_head_ref_branch` | PR source branch, e.g. `feature/test` (empty outside PRs). |
| `git_tag` | Tag that triggered the run, with `strip_tag_prefix` removed. |
| `ci_hostname` | CI server hostname without scheme, e.g. `git.msqu.de`. |
| `semver_valid` | `"true"` when the tag (or branch name) parses as semver. |
| `semver_major` / `semver_minor` / `semver_patch` | Parsed semver components. |
| `semver_pre` | Pre-release identifiers joined with `.`, e.g. `rc.1`. |
| `semver_build` | Build identifiers joined with `.`. |

## Development

```sh
npm install
npm run package  # rebuild dist/
```

`dist/index.js` is the committed bundle the action runs from. Rebuild it with
`npm run package` after changing `src/` or dependencies; the `check-dist`
workflow fails when it is out of date.
