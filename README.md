# excel2json
> https://deno.land/x/excel2json/

![](https://repository-images.githubusercontent.com/865233800/53a795f4-ba07-4f6f-ad84-a1dffbff1532)

# Usage

```sh
# install the latest prebuilt binary with mise
$ mise use -g github:yano3nora/excel2json

# to generate data.json
$ excel2json data.xlsx

# when specify destination
$ excel2json data.xlsx dest.json

# pass --no-override, to abort if destination exists
$ excel2json data.xlsx dest.json --no-override

# pass --leftkey, to leave key props
$ excel2json data.xlsx dest.json --leftkey
```

# Development

```sh
# dev with test
$ deno task dev

# execute main cli
$ deno task main data.xlsx
```

# Publishment

Releases contain standalone binaries for Linux (x64/arm64), macOS (x64/arm64), and Windows (x64).
GoReleaser handles cross-compilation, archives, checksums, and the GitHub Release;
`scripts/release.ts` is a thin wrapper for validation and the explicit human-only publication gate.

```sh
# 1. Bump deno.json and validate tests plus every release artifact locally.
$ mise run release:prepare -- 0.0.3

# 2. Review the result, then commit and tag it yourself.
$ git diff
$ git add deno.json
$ git commit -m "Release v0.0.3"
$ git tag v0.0.3

# 3. Human-only: push the commit/tag and create the GitHub Release.
$ mise run release:publish -- 0.0.3 --i-understand-this-pushes-and-publishes
```

`release:publish` stops unless the tree is clean, `deno.json` matches the requested version, and the
matching tag points at `HEAD`. Publishing requires authenticated `gh`; no release command is run by CI.
