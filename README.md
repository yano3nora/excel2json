# excel2json
> https://deno.land/x/excel2json/

![](https://repository-images.githubusercontent.com/865233800/53a795f4-ba07-4f6f-ad84-a1dffbff1532)

# Usage
> [Installation - docs.deno.com](https://docs.deno.com/runtime/fundamentals/installation/)

```sh
# deno install
$ deno install -r -f -n excel2json --allow-read --allow-write https://deno.land/x/excel2json/main.ts

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

# release
$ git push # => create new release & tag on github
```
