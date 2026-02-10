<script setup lang="ts">
import type { WithdrawalListItem, WithdrawalStatus } from '~/types'

definePageMeta({ layout: 'admin' })

const page = ref(1)
const perPage = 20
const statusFilter = ref('')

const queryParams = computed(() => ({
  page: page.value,
  perPage,
  status: statusFilter.value || undefined,
}))

const { data, isPending, isError, error } = useWithdrawalsQuery(queryParams)
const updateMutation = useUpdateWithdrawal()

const withdrawals = computed(() => data.value?.data || [])
const total = computed(() => data.value?.total || 0)
const totalPages = computed(() => Math.ceil(total.value / perPage))

watch(statusFilter, () => { page.value = 1 })

// -- Action modal --
const actionModal = ref(false)
const actionTarget = ref<WithdrawalListItem | null>(null)
const actionType = ref<'approved' | 'rejected' | 'completed'>('approved')
const adminNote = ref('')
const actionLoading = ref(false)

function openAction(w: WithdrawalListItem, type: 'approved' | 'rejected' | 'completed') {
  actionTarget.value = w
  actionType.value = type
  adminNote.value = ''
  actionModal.value = true
}

function confirmAction() {
  if (!actionTarget.value) return
  actionLoading.value = true
  updateMutation.mutate(
    { id: actionTarget.value.id, data: { status: actionType.value, admin_note: adminNote.value || undefined } },
    {
      onSuccess: () => {
        const toast = useToast()
        toast.add({ title: `Withdrawal ${actionType.value}`, color: actionType.value === 'rejected' ? 'error' : 'success' })
        actionModal.value = false
        actionLoading.value = false
      },
      onError: (e: any) => {
        const toast = useToast()
        toast.add({ title: e?.data?.error || e?.message || 'Action failed', color: 'error' })
        actionLoading.value = false
      },
    }
  )
}

// -- CSV export --
const exporting = ref(false)
async function exportCsv() {
  exporting.value = true
  try {
    const config = useRuntimeConfig()
    const token = useCookie('admin_auth_token').value
    const params = new URLSearchParams()
    if (statusFilter.value) params.set('status', statusFilter.value)
    const res = await fetch(`${config.public.apiBaseUrl}/api/v1/admin/withdrawals/export/csv?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `withdrawals-${statusFilter.value || 'all'}-export.csv`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    const toast = useToast()
    toast.add({ title: 'Failed to export CSV', color: 'error' })
  } finally {
    exporting.value = false
  }
}

// -- Helpers --
const STATUS_COLORS: Record<string, string> = {
  pending: 'amber',
  approved: 'blue',
  rejected: 'red',
  completed: 'green',
}

function paymentLabel(w: WithdrawalListItem): string {
  if (w.payment_method === 'paypal') return `PayPal (${w.payment_details?.paypal_email || '—'})`
  return `Gift Card — ${w.payment_details?.gift_card_type || '—'}`
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Withdrawals</h1>
      <UButton variant="outline" size="sm" icon="i-lucide-download" :loading="exporting" @click="exportCsv">
        Export CSV
      </UButton>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 mb-4">
      <USelect
        v-model="statusFilter"
        :items="[
          { label: 'All Statuses', value: '' },
          { label: 'Pending', value: 'pending' },
          { label: 'Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'Completed', value: 'completed' },
        ]"
        class="w-full sm:w-48"
        size="sm"
      />
    </div>

    <!-- Error -->
    <div v-if="isError" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg px-4 py-3 mb-4">
      {{ error?.message || 'Failed to load withdrawals' }}
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <TablesTableSkeleton v-if="isPending" :cols="5" :rows="5" />

      <div v-else-if="!withdrawals.length" class="px-5 py-16 text-center">
        <UIcon name="i-lucide-inbox" class="size-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
        <p class="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">No withdrawal requests</p>
        <p class="text-xs text-zinc-400 dark:text-zinc-500">Withdrawal requests from users will appear here.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100 dark:border-zinc-800">
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">User</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Amount</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Payment</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Status</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Date</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="w in withdrawals"
              :key="w.id"
              class="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <td class="px-5 py-3">
                <NuxtLink
                  :to="`/users/${w.user_id}`"
                  class="font-medium text-zinc-900 dark:text-zinc-100 hover:text-rose-600 dark:hover:text-rose-400"
                >
                  {{ w.profiles?.email || w.user_id?.slice(0, 8) }}
                </NuxtLink>
                <p class="text-xs text-zinc-400 mt-0.5">
                  {{ [w.profiles?.first_name, w.profiles?.last_name].filter(Boolean).join(' ') || '—' }}
                </p>
              </td>
              <td class="px-5 py-3 font-bold text-zinc-900 dark:text-zinc-100">
                {{ formatCurrency(w.amount) }}
              </td>
              <td class="px-5 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                {{ paymentLabel(w) }}
              </td>
              <td class="px-5 py-3">
                <UBadge :color="STATUS_COLORS[w.status] || 'neutral'" variant="subtle" size="xs">
                  {{ w.status }}
                </UBadge>
              </td>
              <td class="px-5 py-3 text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                {{ new Date(w.created_at).toLocaleDateString() }}
              </td>
              <td class="px-5 py-3 text-right">
                <div v-if="w.status === 'pending'" class="flex items-center gap-1 justify-end">
                  <UButton size="xs" color="primary" variant="soft" @click="openAction(w, 'approved')">
                    Approve
                  </UButton>
                  <UButton size="xs" color="error" variant="soft" @click="openAction(w, 'rejected')">
                    Reject
                  </UButton>
                </div>
                <div v-else-if="w.status === 'approved'" class="flex items-center gap-1 justify-end">
                  <UButton size="xs" color="primary" variant="soft" @click="openAction(w, 'completed')">
                    Mark Complete
                  </UButton>
                </div>
                <span v-else class="text-xs text-zinc-400">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-5 py-3 border-t border-zinc-100 dark:border-zinc-800">
        <p class="text-xs text-zinc-400">{{ total }} total</p>
        <div class="flex items-center gap-1">
          <UButton variant="ghost" size="xs" icon="i-lucide-chevron-left" :disabled="page <= 1" @click="page--" />
          <span class="text-xs text-zinc-500 dark:text-zinc-400 px-2">{{ page }} / {{ totalPages }}</span>
          <UButton variant="ghost" size="xs" icon="i-lucide-chevron-right" :disabled="page >= totalPages" @click="page++" />
        </div>
      </div>
    </div>

    <!-- Action Confirmation Modal -->
    <UModal v-model:open="actionModal">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            {{ actionType === 'approved' ? 'Approve Withdrawal' : actionType === 'rejected' ? 'Reject Withdrawal' : 'Mark as Complete' }}
          </h3>

          <div v-if="actionTarget" class="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 mb-4">
            <p class="text-sm font-medium">{{ actionTarget.profiles?.email }}</p>
            <p class="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">{{ formatCurrency(actionTarget.amount) }}</p>
            <p class="text-xs text-zinc-400 mt-1">{{ paymentLabel(actionTarget) }}</p>
          </div>

          <div v-if="actionType === 'approved'" class="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4 text-xs text-amber-700 dark:text-amber-300">
            This will deduct {{ actionTarget ? formatCurrency(actionTarget.amount) : '' }} from the user's wallet.
          </div>

          <div class="mb-4">
            <label class="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 block">Admin Note (optional)</label>
            <UTextarea v-model="adminNote" placeholder="Add a note..." :rows="2" size="sm" />
          </div>

          <div class="flex gap-3">
            <UButton variant="outline" color="neutral" class="flex-1" @click="actionModal = false">
              Cancel
            </UButton>
            <UButton
              :color="actionType === 'rejected' ? 'error' : 'primary'"
              class="flex-1"
              :loading="actionLoading"
              @click="confirmAction"
            >
              {{ actionType === 'approved' ? 'Approve' : actionType === 'rejected' ? 'Reject' : 'Complete' }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
