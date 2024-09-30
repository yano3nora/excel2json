import { saveJson } from './mods.ts'
import { excel2json } from './mods.ts'
import { extname } from 'https://deno.land/std@0.130.0/path/mod.ts'

if (Deno.args.length === 0) {
  console.error(
    'Usage: deno run --allow-read --allow-write main.ts <file-path>',
  )
  Deno.exit(1)
}

const filePath = Deno.args[0]

excel2json(filePath).then((json) => {
  if (!json) {
    console.info('No data.')
    Deno.exit(0)
  }

  const pathToJson = Deno.args[1]
    ? String(Deno.args[1])
    : filePath.replace(extname(filePath), '') + '.json'

  saveJson(json, pathToJson)
})
