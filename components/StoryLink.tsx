'use client'
import Link from 'next/link'
import { RushVoice } from './RushVoice'
import type { Story } from '@/lib/types'

function track(id: string) {
  try { fetch(`/api/click?id=${id}`, { keepalive: true }) } catch {}
}

export function StoryLink({ story, variant, placeholderVariant }: {
  story: Story
  variant?: 'horizontal'
  placeholderVariant?: 'rush' | 'fashion'
}) {
  if (variant === 'horizontal') {
    const placeholderClass = `story-card-h-placeholder${placeholderVariant === 'rush' ? ' story-card-h-placeholder-rush' : ''}`
    return (
      <Link href={`/story/${story.id}`} className="story-card-h" onClick={() => track(story.id)}>
        {story.imageUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img className="story-card-h-img" src={story.imageUrl} alt="" />
          : <div className={placeholderClass} />
        }
        <div className="story-card-h-body">
          <div className="story-headline" style={{ fontSize: '0.92rem' }}>{story.headline}</div>
          {story.adequateVoice && (
            <div className="adequate-voice" style={{ marginTop: '0.3rem', fontSize: '0.82rem' }}>
              <RushVoice text={story.adequateVoice} />
            </div>
          )}
          <div className="source-tag">{story.source}</div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/story/${story.id}`} className="story-link" onClick={() => track(story.id)}>
      {story.imageUrl && (
        <div className="story-polaroid">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={story.imageUrl} alt="" />
        </div>
      )}
      <div className="story-headline">{story.headline}</div>
      {story.adequateVoice && (
        <div className="adequate-voice" style={{ marginTop: '0.35rem' }}>
          <RushVoice text={story.adequateVoice} />
        </div>
      )}
      <div className="source-tag">{story.source}</div>
    </Link>
  )
}
