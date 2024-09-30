import { assertEquals } from 'jsr:@std/assert'
import { excel2json } from './mods.ts'

Deno.test('excel2json', async () => {
  const json = await excel2json('./data.xlsx')
  const data = JSON.parse(json || '')
  const expects = {
    users: {
      john: { key: 'john', name: 'john do', gender: 'male', activated: true },
      jane: { key: 'jane', name: 'jane do', gender: 'female', activated: true },
      bob: { key: 'bob', name: 'bob ross', gender: 'male', activated: false },
    },
    posts: {
      1: { key: 1, user: 'john', title: 'hello, world.', rating: -2 },
      2: { key: 2, user: 'john', title: `john's post 2.`, rating: 10 },
      3: {
        key: 3,
        user: 'jane',
        title: `"jane's post, about cook."`,
        rating: 7.52,
      },
      4: { key: 4, user: 'bob', title: null, rating: null },
    },
  }

  assertEquals(data, expects)
  console.log(data)
})
