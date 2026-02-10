import { h } from 'vue'
import { createColumnHelper } from '@tanstack/vue-table'
import type { Mission } from '~/types'

const col = createColumnHelper<Mission>()

export function getMissionColumns({
  onUpdateStatus,
  onDelete,
}: {
  onUpdateStatus: (id: string, status: string) => void
  onDelete: (id: string) => void
}) {
  return [
    col.accessor('title', {
      header: 'Mission',
      cell: (info) => {
        const row = info.row.original
        return h('div', [
          h(resolveComponent('NuxtLink'), {
            to: `/missions/${row.id}/edit`,
            class: 'font-medium text-(--ui-text) hover:text-(--ui-primary)',
          }, () => row.title),
          h('p', { class: 'text-xs text-(--ui-text-muted) mt-0.5' }, row.brand_name || '\u2014'),
        ])
      },
    }),
    col.accessor('mission_type', {
      header: 'Type',
      cell: (info) => {
        const emoji: Record<string, string> = {
          affiliate: '\uD83D\uDD17', survey: '\uD83D\uDCCB', cpg: '\uD83D\uDCE6',
          digital_review: '\u2B50', ugc: '\uD83C\uDFAC', focus_group: '\uD83C\uDFAF',
        }
        return `${emoji[info.getValue()] || ''} ${info.getValue()}`
      },
    }),
    col.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const colorMap: Record<string, string> = {
          draft: 'neutral', active: 'success', paused: 'warning', completed: 'info', archived: 'neutral',
        }
        return h(resolveComponent('UBadge'), {
          color: colorMap[info.getValue()] || 'neutral',
          variant: 'subtle',
          size: 'sm',
        }, () => info.getValue())
      },
    }),
    col.accessor('reward_amount', {
      header: 'Reward',
      meta: { headerClass: 'text-right', cellClass: 'text-right font-medium' },
      cell: (info) => formatCurrency(info.getValue()),
    }),
    col.accessor('current_participants', {
      header: 'Participants',
      meta: { headerClass: 'text-right', cellClass: 'text-right text-(--ui-text-muted)' },
      cell: (info) => {
        const row = info.row.original
        return `${info.getValue()}${row.max_participants ? ` / ${row.max_participants}` : ''}`
      },
    }),
    col.display({
      id: 'actions',
      header: 'Actions',
      meta: { headerClass: 'text-right', cellClass: 'text-right' },
      cell: (info) => {
        const row = info.row.original
        const buttons: any[] = []
        if (row.status === 'draft' || row.status === 'paused') {
          buttons.push(h(resolveComponent('UButton'), {
            variant: 'ghost', size: 'xs', color: 'success',
            icon: 'i-lucide-play', title: row.status === 'draft' ? 'Activate' : 'Resume',
            onClick: () => onUpdateStatus(row.id, 'active'),
          }))
        }
        if (row.status === 'active') {
          buttons.push(h(resolveComponent('UButton'), {
            variant: 'ghost', size: 'xs', color: 'warning',
            icon: 'i-lucide-pause', title: 'Pause',
            onClick: () => onUpdateStatus(row.id, 'paused'),
          }))
        }
        buttons.push(h(resolveComponent('NuxtLink'), { to: `/missions/${row.id}/edit` },
          () => h(resolveComponent('UButton'), { variant: 'ghost', size: 'xs', icon: 'i-lucide-pencil', title: 'Edit' })))
        buttons.push(h(resolveComponent('UButton'), {
          variant: 'ghost', size: 'xs', color: 'error',
          icon: 'i-lucide-trash-2', title: 'Delete',
          onClick: () => onDelete(row.id),
        }))
        return h('div', { class: 'flex items-center justify-end gap-1' }, buttons)
      },
    }),
  ]
}
