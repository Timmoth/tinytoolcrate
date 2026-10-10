import ReferenceTable, { Column } from '../components/ReferenceTable'
import { MIME_TYPES, MimeType } from '../data/mimeTypes'

const COLUMNS: Column<MimeType>[] = [
  { key: 'extension', label: 'ext', mono: true, tight: true },
  { key: 'mime', label: 'content-type', mono: true },
  { key: 'name', label: 'what it is', tight: true },
]

function MimeTypesUtil() {
  return (
    <ReferenceTable
      rows={MIME_TYPES}
      columns={COLUMNS}
      copyKey="mime"
      placeholder="Search by extension or content-type"
    />
  )
}

export default MimeTypesUtil
