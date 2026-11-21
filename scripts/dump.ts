import { writeFileSync } from 'node:fs'

import atom from '../src/content/topics/atom'
import concepts from '../src/content/topics/concepts'

{
  writeFileSync('/tmp/content.json', JSON.stringify({ atom, concepts }))
}
