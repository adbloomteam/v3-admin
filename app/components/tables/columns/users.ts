import { h } from 'vue'
import { createColumnHelper } from '@tanstack/vue-table'
import type { AdminUserListItem } from '~/types'

const col = createColumnHelper<AdminUserListItem>()

export const userColumns = [
  col.accessor('email', {
    header: 'User',
    cell: (info) => {
      const row = info.row.original
      const name = [row.first_name, row.last_name].filter(Boolean).join(' ') || '\u2014'
      return h('div', [
        h(resolveComponent('NuxtLink'), {
          to: `/users/${row.id}`,
          class: 'font-medium text-(--ui-text) hover:text-(--ui-primary)',
        }, () => info.getValue()),
        h('p', { class: 'text-xs text-(--ui-text-muted) mt-0.5' }, name),
      ])
    },
  }),
  col.accessor('role', {
    header: 'Role',
    cell: (info) => {
      const role = info.getValue()
      const color = role === 'admin' || role === 'super_admin' ? 'warning' : 'neutral'
      return h(resolveComponent('UBadge'), { color, variant: 'subtle', size: 'sm' }, () => role)
    },
  }),
  col.accessor('available_credits', {
    header: 'Credits',
    meta: { headerClass: 'text-right', cellClass: 'text-right font-medium' },
    cell: (info) => formatCurrency(info.getValue() || 0),
  }),
  col.accessor('created_at', {
    header: 'Joined',
    meta: { headerClass: 'text-right', cellClass: 'text-right text-(--ui-text-muted)' },
    cell: (info) => formatDate(info.getValue()),
  }),
]
