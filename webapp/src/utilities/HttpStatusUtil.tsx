import ReferenceTable, { Column } from '../components/ReferenceTable'
import { HTTP_STATUSES, HttpStatus } from '../data/httpStatus'

const COLUMNS: Column<HttpStatus>[] = [
  { key: 'code', label: 'code', mono: true, tight: true },
  { key: 'name', label: 'name', tight: true },
  { key: 'summary', label: 'meaning' },
]

const TONE: Record<string, string> = {
  'client error': 'text-amber-600 dark:text-amber-400',
  'server error': 'text-red-600 dark:text-red-400',
  success: 'text-emerald-600 dark:text-emerald-400',
}

function HttpStatusUtil() {
  return (
    <ReferenceTable
      rows={HTTP_STATUSES}
      columns={COLUMNS}
      copyKey="code"
      placeholder="Search by code, name or meaning"
      rowClass={(row) => TONE[row.category] ?? ''}
    />
  )
}

export default HttpStatusUtil
