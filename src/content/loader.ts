import { AccessError, canAccess } from '../lib/access'
import { topicById } from './catalog'
import type { TopicContent } from './types'

type Loader = () => Promise<{ default: TopicContent }>

/**
 * Каждая тема — отдельный чанк. Сейчас контент лежит в бандле (статический деплой),
 * поэтому платные темы формально можно достать из JS. Для реальной продажи loadTopic
 * заменяется на запрос к серверу (Supabase/функция), который отдаёт контент только
 * купившим. Интерфейс loadTopic при этом не меняется.
 */
export const loaders: Record<string, Loader> = {
  concepts: () => import('./topics/concepts'),
  atom: () => import('./topics/atom'),
  periodic: () => import('./topics/periodic'),
  oxidation: () => import('./topics/oxidation'),
  bonds: () => import('./topics/bonds'),
  classes: () => import('./topics/classes'),
  metals: () => import('./topics/metals'),
}

export async function loadTopic(id: string): Promise<TopicContent> {
  const meta = topicById(id)
  const load = loaders[id]
  if (!meta || !load) throw new Error('Тема не найдена')
  if (!canAccess(meta)) throw new AccessError()
  return (await load()).default
}
