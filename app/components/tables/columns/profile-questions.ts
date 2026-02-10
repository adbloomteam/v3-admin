import { h } from 'vue'
import { createColumnHelper } from '@tanstack/vue-table'
import type { ProfileQuestion } from '~/types'

const col = createColumnHelper<ProfileQuestion>()

const questionTypeLabel: Record<string, string> = {
  text: 'Text',
  single_select: 'Select',
  multi_select: 'Multi Select',
  number: 'Number',
  date: 'Date',
}

export function getProfileQuestionColumns({
  onDelete,
}: {
  onDelete: (id: string) => void
}) {
  return [
    col.accessor('sort_order', {
      header: 'Order',
      meta: { cellClass: 'text-(--ui-text-muted)' },
      cell: (info) => info.getValue() ?? '\u2014',
    }),
    col.accessor('question_text', {
      header: 'Question',
      cell: (info) => {
        const row = info.row.original
        return h(resolveComponent('NuxtLink'), {
          to: `/profile-questions/${row.id}/edit`,
          class: 'font-medium text-(--ui-text) hover:text-(--ui-primary)',
        }, () => info.getValue())
      },
    }),
    col.accessor('question_key', {
      header: 'Key',
      meta: { cellClass: 'text-(--ui-text-muted) font-mono text-xs' },
      cell: (info) => info.getValue(),
    }),
    col.accessor('question_type', {
      header: 'Type',
      cell: (info) => h(resolveComponent('UBadge'), {
        color: 'neutral',
        variant: 'subtle',
        size: 'sm',
      }, () => questionTypeLabel[info.getValue()] || info.getValue()),
    }),
    col.accessor('is_required', {
      header: 'Required',
      cell: (info) => h(resolveComponent('UBadge'), {
        color: info.getValue() ? 'warning' : 'neutral',
        variant: 'subtle',
        size: 'sm',
      }, () => info.getValue() ? 'Required' : 'Optional'),
    }),
    col.display({
      id: 'actions',
      header: 'Actions',
      meta: { headerClass: 'text-right', cellClass: 'text-right' },
      cell: (info) => {
        const row = info.row.original
        return h('div', { class: 'flex items-center justify-end gap-1' }, [
          h(resolveComponent('NuxtLink'), { to: `/profile-questions/${row.id}/edit` },
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
