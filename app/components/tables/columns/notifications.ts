import { h } from 'vue'
import { createColumnHelper } from '@tanstack/vue-table'
import type { NotificationSend } from '~/types'

const col = createColumnHelper<NotificationSend>()

export const notificationColumns = [
  col.accessor('subject', {
    header: 'Subject',
    meta: { cellClass: 'text-(--ui-text) font-medium' },
    cell: (info) => info.getValue() || '\u2014',
  }),
  col.accessor('segments', {
    header: 'Segment',
    meta: { cellClass: 'text-(--ui-text-muted)' },
    cell: (info) => {
      const seg = info.getValue()
      const row = info.row.original
      return seg?.name || row.segment_id?.slice(0, 8) || '\u2014'
    },
  }),
  col.accessor('recipients_count', {
    header: 'Results',
    cell: (info) => {
      const row = info.row.original
      const parts = [
        h('span', { class: 'text-xs text-(--ui-text-dimmed)' },
          `${row.success_count || 0}/${info.getValue() || 0} sent`),
      ]
      if (row.fail_count) {
        parts.push(h('span', { class: 'text-xs text-red-500 ml-1' }, `(${row.fail_count} failed)`))
      }
      return h('span', parts)
    },
  }),
  col.accessor('created_at', {
    header: 'Sent',
    meta: { headerClass: 'text-right', cellClass: 'text-right text-(--ui-text-muted)' },
    cell: (info) => formatDateTime(info.getValue()),
  }),
]
