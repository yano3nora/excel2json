// Thin release wrapper. GoReleaser owns compile/archive/checksum/GitHub Release creation;
// this script retains only the version bump, validation, tag consistency, and human publish gate.

type CommandName = 'prepare' | 'publish'

const PUBLISH_FLAG = '--i-understand-this-pushes-and-publishes'

function usage(): string {
  return `Usage:
  mise run release:prepare -- <version>
  mise run release:publish -- <version> ${PUBLISH_FLAG}
`
}

function parseArgs(): {
  command: CommandName
  version: string
  publishAllowed: boolean
} {
  const [rawCommand, rawVersion, ...rest] = Deno.args
  const command = rawCommand as CommandName | undefined

  if (command !== 'prepare' && command !== 'publish') {
    throw new Error(`Unknown command.\n\n${usage()}`)
  }
  if (rawVersion === undefined || !/^\d+\.\d+\.\d+$/.test(rawVersion)) {
    throw new Error(`Version must use x.y.z format.\n\n${usage()}`)
  }

  return {
    command,
    version: rawVersion,
    publishAllowed: rest.includes(PUBLISH_FLAG),
  }
}

interface RunOptions {
  readonly env?: Record<string, string>
  // Suppress successful output when it can contain a credential, but retain errors.
  readonly quiet?: boolean
  // Stream long-running validation/build output instead of buffering it.
  readonly stream?: boolean
}

async function run(
  command: string,
  args: readonly string[],
  options: RunOptions = {},
): Promise<string> {
  if (!options.quiet) console.log(`$ ${[command, ...args].join(' ')}`)

  const result = await new Deno.Command(command, {
    args: [...args],
    env: options.env,
    stdout: options.stream ? 'inherit' : 'piped',
    stderr: options.stream ? 'inherit' : 'piped',
  }).output()

  if (options.stream) {
    if (!result.success) {
      throw new Error(`Command failed: ${command} ${args.join(' ')}`)
    }
    return ''
  }

  const stdout = new TextDecoder().decode(result.stdout)
  const stderr = new TextDecoder().decode(result.stderr)
  if (!options.quiet && stdout.trim() !== '') console.log(stdout.trimEnd())
  if (stderr.trim() !== '' && (!options.quiet || !result.success)) {
    console.error(stderr.trimEnd())
  }
  if (!result.success) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`)
  }

  return stdout
}

async function bumpVersion(version: string): Promise<void> {
  const path = 'deno.json'
  const config = JSON.parse(await Deno.readTextFile(path)) as Record<
    string,
    unknown
  >
  config.version = version
  await Deno.writeTextFile(path, `${JSON.stringify(config, null, 2)}\n`)
}

async function assertProjectVersion(version: string): Promise<void> {
  const config = JSON.parse(await Deno.readTextFile('deno.json')) as {
    version?: string
  }
  if (config.version !== version) {
    throw new Error(
      `deno.json version mismatch: expected ${version}, got ${
        config.version ?? 'none'
      }.`,
    )
  }
}

async function assertCleanTree(): Promise<void> {
  if ((await run('git', ['status', '--porcelain'])).trim() !== '') {
    throw new Error(
      'Working tree must be clean. Commit the prepared release first.',
    )
  }
}

async function assertTagAtHead(tag: string): Promise<void> {
  let tagCommit: string
  try {
    tagCommit =
      (await run('git', ['rev-parse', '--verify', `${tag}^{commit}`], {
        quiet: true,
      }))
        .trim()
  } catch {
    throw new Error(
      `Tag ${tag} does not exist. Create it first: git tag ${tag}`,
    )
  }

  const head = (await run('git', ['rev-parse', 'HEAD'], { quiet: true })).trim()
  if (tagCommit !== head) throw new Error(`Tag ${tag} must point at HEAD.`)
}

async function prepare(version: string): Promise<void> {
  await bumpVersion(version)
  await run('deno', ['task', 'check'], { stream: true })
  await run('deno', ['task', 'test'], { stream: true })
  // Snapshot mode exercises every local release stage without requiring a tag or publishing.
  await run('goreleaser', ['release', '--snapshot', '--clean'], {
    stream: true,
  })

  console.log(
    `\nValidated v${version}. Review and commit deno.json, then create tag v${version}.`,
  )
}

async function publish(
  version: string,
  publishAllowed: boolean,
): Promise<void> {
  if (!publishAllowed) {
    throw new Error(`Refusing to publish without ${PUBLISH_FLAG}.`)
  }

  const tag = `v${version}`
  await assertProjectVersion(version)
  await assertCleanTree()
  await assertTagAtHead(tag)

  // GoReleaser publishes through the GitHub API but does not push the source commit/tag.
  await run('git', ['push', 'origin', 'HEAD'], { stream: true })
  await run('git', ['push', 'origin', tag], { stream: true })

  // Reuse the authenticated gh token so the project does not introduce another secret store.
  const token = Deno.env.get('GITHUB_TOKEN') ??
    (await run('gh', ['auth', 'token'], { quiet: true })).trim()
  await run('goreleaser', ['release', '--clean'], {
    env: { GITHUB_TOKEN: token },
    stream: true,
  })
}

if (import.meta.main) {
  try {
    const { command, version, publishAllowed } = parseArgs()
    if (command === 'prepare') await prepare(version)
    if (command === 'publish') await publish(version, publishAllowed)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    Deno.exit(1)
  }
}
