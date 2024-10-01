import { saveJson } from './mods.ts'
import { excel2json } from './mods.ts'
import { extname } from 'jsr:@std/path'

const paths = Deno.args.filter((s) => !s.startsWith('--'))
const args = Deno.args.filter((s) => s.startsWith('--'))
const src = paths.at(0)
const dest = paths.at(1)

if (
  !src ||
  !(await Deno.stat(src)).isFile
) {
  console.error('No path/to/file.xlsx was given.')
  Deno.exit(1)
}

excel2json(src, args).then(async (json) => {
  const destPath = dest || src.replace(extname(src), '.json')
  const destInfo = await Deno.stat(destPath)

  if (
    args.includes('--no-override') &&
    (
      destInfo.isFile ||
      destInfo.isDirectory
    )
  ) {
    console.error('Abort override by arg of --no-override.')
    Deno.exit(1)
  }

  await saveJson(json || '', destPath)

  console.info('Generated to: ' + (await Deno.realPath(destPath)))
  Deno.exit(0)
})
