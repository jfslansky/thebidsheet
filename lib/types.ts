export interface Story {
  id: string
  headline: string
  originalHeadline: string
  adequateVoice: string
  source: string
  sourceUrl: string
  publishedAt: string
  ingestedAt: string
  isSinclair?: boolean
  sinclairNote?: string
  category?: string
  splash?: boolean
  score?: number         // global score — used for store eviction
  fashionScore?: number  // how good for the Fashion section
  rushScore?: number     // how good for Rush/Bid Day section
  hazingScore?: number   // how significant as an accountability story
  viralScore?: number    // shareability / trend factor
  clicks?: number
  signals?: string[]
  clickedAt?: number
  imageUrl?: string
}
