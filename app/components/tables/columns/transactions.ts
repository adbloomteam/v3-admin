import { h } from 'vue'
import { createColumnHelper } from '@tanstack/vue-table'
import type { Transaction } from '~/types'

const col = createColumnHelper<Transaction>()

export const transactionColumns = [
  col.accessor('user_id', {
    header: 'User',
    cell: (info) => {
      const val = info.getValue()
      if (!val) return '\u2014'
      return h(resolveComponent('NuxtLink'), {
        to: `/users/${val}`,
        class: 'text-(--ui-text) hover:text-(--ui-primary) font-medium text-xs font-mono',
      }, () => `${val.slice(0, 8)}...`)
    },
  }),
  col.accessor('transaction_type', {
    header: 'Type',
    cell: (info) => h('span', {
      class: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-(--ui-bg-elevated) text-(--ui-text-dimmed)',
    }, info.getValue()),
  }),
  col.accessor('description', {
    header: 'Description',
    meta: { cellClass: 'text-(--ui-text-dimmed) max-w-xs truncate' },
    cell: (info) => info.getValue() || '\u2014',
  }),
  col.accessor('amount', {
    header: 'Amount',
    meta: { headerClass: 'text-right', cellClass: 'text-right font-medium' },
    cell: (info) => {
      const val = info.getValue()
      const cls = val >= 0 ? 'text-emerald-600' : 'text-red-600'
      return h('span', { class: cls }, formatCurrency(val))
    },
  }),
  col.accessor('created_at', {
    header: 'Date',
    meta: { headerClass: 'text-right', cellClass: 'text-right text-(--ui-text-muted)' },
    cell: (info) => formatDate(info.getValue()),
  }),
]
