import { h } from 'vue'
import { createColumnHelper } from '@tanstack/vue-table'
import type { PayoutListItem } from '~/types'

const col = createColumnHelper<PayoutListItem>()

export const payoutColumns = [
  col.accessor('profiles', {
    header: 'User',
    cell: (info) => {
      const row = info.row.original
      const profile = info.getValue()
      const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || '\u2014'
      return h('div', [
        h(resolveComponent('NuxtLink'), {
          to: `/users/${row.user_id}`,
          class: 'font-medium text-(--ui-text) hover:text-(--ui-primary)',
        }, () => profile?.email || row.user_id?.slice(0, 8)),
        h('p', { class: 'text-xs text-(--ui-text-muted) mt-0.5' }, name),
      ])
    },
  }),
  col.accessor('available_credits', {
    header: 'Available Credits',
    meta: { headerClass: 'text-right', cellClass: 'text-right font-medium text-emerald-600' },
    cell: (info) => formatCurrency(info.getValue()),
  }),
]
