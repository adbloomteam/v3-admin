import { h } from 'vue'
import { createColumnHelper } from '@tanstack/vue-table'
import type { Segment } from '~/types'

const col = createColumnHelper<Segment>()

export function getSegmentColumns({
  onDelete,
}: {
  onDelete: (id: string) => void
}) {
  return [
    col.accessor('name', {
      header: 'Name',
      cell: (info) => {
        const row = info.row.original
        return h('div', [
          h(resolveComponent('NuxtLink'), {
            to: `/segments/${row.id}/edit`,
            class: 'font-medium text-(--ui-text) hover:text-(--ui-primary)',
          }, () => info.getValue()),
          row.description
            ? h('p', { class: 'text-xs text-(--ui-text-muted) mt-0.5 truncate max-w-xs' }, row.description)
            : null,
        ])
      },
    }),
    col.accessor('segment_type', {
      header: 'Type',
      meta: { cellClass: 'text-(--ui-text-muted)' },
      cell: (info) => info.getValue() || '\u2014',
    }),
    col.accessor('is_active', {
      header: 'Status',
      cell: (info) => h(resolveComponent('UBadge'), {
        color: info.getValue() ? 'success' : 'neutral',
        variant: 'subtle',
        size: 'sm',
      }, () => info.getValue() ? 'Active' : 'Inactive'),
    }),
    col.accessor('created_at', {
      header: 'Created',
      meta: { headerClass: 'text-right', cellClass: 'text-right text-(--ui-text-muted)' },
      cell: (info) => formatDate(info.getValue()),
    }),
    col.display({
      id: 'actions',
      header: 'Actions',
      meta: { headerClass: 'text-right', cellClass: 'text-right' },
      cell: (info) => {
        const row = info.row.original
        return h('div', { class: 'flex items-center justify-end gap-1' }, [
          h(resolveComponent('NuxtLink'), { to: `/segments/${row.id}/edit` },
            () => h(resolveComponent('UButton'), { variant: 'ghost', size: 'xs', icon: 'i-lucide-pencil' })),
          h(resolveComponent('UButton'), {
            variant: 'ghost', size: 'xs', color: 'error',
            icon: 'i-lucide-trash-2',
            onClick: () => onDelete(row.id),
          }),
        ])
      },
    }),
  ]
}
