import { describe, expect, test } from 'bun:test'
import { AppKey, PinnedObject, type Slab } from '../index.node'

function slab(offset = 0, length = 1): Slab {
  return {
    version: 1,
    encryptionKey: Buffer.alloc(32, 1),
    minShards: 1,
    sectors: [],
    offset,
    length,
  }
}

describe('PinnedObject compose', () => {
  test('withSlabs reuses the data key, seals, and changes the id', () => {
    const base = new PinnedObject()
    const composed = base.withSlabs([slab(0, 1), slab(0, 2)])

    expect(composed.size()).toBe(3n)
    expect(composed.slabs()).toHaveLength(2)
    expect(composed.id()).not.toBe(base.id())

    const sealed = composed.seal(new AppKey(Buffer.alloc(32, 2)))
    expect(sealed).toBeDefined()
  })

  test('replaceSlab replaces one slab and rejects an out-of-range index', () => {
    const base = new PinnedObject().withSlabs([slab(0, 1)])
    const replaced = base.replaceSlab(0, slab(0, 2))

    expect(replaced.size()).toBe(2n)
    expect(replaced.slabs()[0].length).toBe(2)
    expect(() => base.replaceSlab(1, slab())).toThrow('slab index out of range')
  })
})
