# Usage
> [Installation - docs.deno.com](https://docs.deno.com/runtime/fundamentals/installation/)

```sh
# deno install
$ deno install -f -n excel2json --allow-read --allow-write https://deno.land/x/excel2json/main.ts

# to generate data.json
$ excel2json data.xlsx
```

# Development

```sh
# dev with test
$ deno task dev

# execute main cli
$ deno task main

# release
$ git push # => create new release & tag on github
```
