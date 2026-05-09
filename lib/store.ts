import { Redis } from '@upstash/redis'
import type { Story } from './types'

const useRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

let redis: Redis | null = null
if (useRedis) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

const g = global as typeof global & { stories?: Map<string, Story> }
if (!g.stories) g.stories = new Map<string, Story>()
const memStore = g.stories

const KEY = 'bid:stories'

export const stories = {
  async get(id: string): Promise<Story | undefined> {
    if (redis) {
      const val = await redis.hget(KEY, id)
      if (!val) return undefined
      return (typeof val === 'string' ? JSON.parse(val) : val) as Story
    }
    return memStore.get(id)
  },

  async set(id: string, story: Story): Promise<void> {
    if (redis) {
      await redis.hset(KEY, { [id]: JSON.stringify(story) })
    } else {
      memStore.set(id, story)
    }
  },

  async delete(id: string): Promise<void> {
    if (redis) {
      await redis.hdel(KEY, id)
    } else {
      memStore.delete(id)
    }
  },

  async clear(): Promise<void> {
    if (redis) {
      await redis.del(KEY)
    } else {
      memStore.clear()
    }
  },

  async values(): Promise<Story[]> {
    if (redis) {
      const all = await redis.hgetall(KEY)
      if (!all) return []
      return Object.values(all).map(v =>
        typeof v === 'string' ? JSON.parse(v) : v
      ) as Story[]
    }
    return Array.from(memStore.values())
  },

  async size(): Promise<number> {
    if (redis) return await redis.hlen(KEY)
    return memStore.size
  },
}
