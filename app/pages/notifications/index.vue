<script setup lang="ts">
definePageMeta({ layout: 'admin' })

// Segments dropdown — kept as raw apiFetch for the one-time load
const { apiFetch } = useApi()
const segments = ref<any[]>([])
onMounted(async () => {
  try {
    const res = await apiFetch<any>('/segments?perPage=100')
    segments.value = (res.segments || []).map((s: any) => ({ label: s.name, value: s.id }))
  } catch {}
})
const segmentOptions = computed(() => [
  { label: 'Select a segment...', value: 'none' },
  ...segments.value,
])

// Send form
const sendMutation = useSendNotification()
const sendSuccess = ref('')
const sendForm = reactive({
  segmentId: 'none',
  subject: '',
  templateId: '',
  dataVariables: '',
})

function handleSend() {
  if (sendForm.segmentId === 'none' || !sendForm.subject || !sendForm.templateId) return
  sendSuccess.value = ''
  const body: any = {
    segmentId: sendForm.segmentId,
    subject: sendForm.subject,
    templateId: sendForm.templateId,
  }
  if (sendForm.dataVariables) {
    try { body.dataVariables = JSON.parse(sendForm.dataVariables) } catch {}
  }
  sendMutation.mutate(body, {
    onSuccess: () => {
      sendSuccess.value = 'Notification sent successfully'
      sendForm.subject = ''
      sendForm.templateId = ''
      sendForm.dataVariables = ''
    },
  })
}

// History
const historyPage = ref(1)
const historyPerPage = 20

const historyParams = computed(() => ({
  page: historyPage.value,
  perPage: historyPerPage,
}))

const { data: historyData, isPending: loadingHistory } = useNotificationsQuery(historyParams)

const history = computed(() => historyData.value?.data || [])
const historyTotal = computed(() => historyData.value?.total || 0)
const historyTotalPages = computed(() => Math.ceil(historyTotal.value / historyPerPage))
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Notifications</h1>

    <!-- Send form -->
    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
      <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Send Notification</h2>
      <form @submit.prevent="handleSend" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Segment" required>
            <USelect v-model="sendForm.segmentId" :items="segmentOptions" value-key="value" class="w-full" />
          </UFormField>
          <UFormField label="Subject" required>
            <UInput v-model="sendForm.subject" placeholder="Notification subject" class="w-full" required />
          </UFormField>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Template ID" required>
            <UInput v-model="sendForm.templateId" placeholder="Loops template ID" class="w-full" required />
          </UFormField>
          <UFormField label="Data Variables (JSON)">
            <UInput v-model="sendForm.dataVariables" placeholder='{"key": "value"}' class="w-full" />
          </UFormField>
        </div>
        <div class="flex items-center gap-3">
          <UButton type="submit" color="primary" size="sm" :loading="sendMutation.isPending.value" :disabled="sendForm.segmentId === 'none' || !sendForm.subject || !sendForm.templateId">
            Send Notification
          </UButton>
          <span v-if="sendSuccess" class="text-sm text-emerald-600 dark:text-emerald-400">{{ sendSuccess }}</span>
          <span v-if="sendMutation.isError.value" class="text-sm text-red-600 dark:text-red-400">
            {{ sendMutation.error.value?.message || 'Failed to send notification' }}
          </span>
        </div>
      </form>
    </div>

    <!-- History -->
    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div class="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">Notification History</h2>
      </div>

      <TablesTableSkeleton v-if="loadingHistory" :cols="4" :rows="4" />

      <div v-else-if="!history.length" class="px-5 py-16 text-center">
        <UIcon name="i-lucide-bell" class="size-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
        <p class="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">No notifications sent yet</p>
        <p class="text-xs text-zinc-400 dark:text-zinc-500">Use the form above to send your first notification.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100 dark:border-zinc-800">
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Subject</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Segment</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Results</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Sent</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in history" :key="n.id" class="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
              <td class="px-5 py-3 text-zinc-900 dark:text-zinc-100 font-medium">{{ n.subject || '—' }}</td>
              <td class="px-5 py-3 text-zinc-500 dark:text-zinc-400">{{ n.segments?.name || n.segment_id?.slice(0, 8) || '—' }}</td>
              <td class="px-5 py-3">
                <span class="text-xs text-zinc-600 dark:text-zinc-400">
                  {{ n.success_count || 0 }}/{{ n.recipients_count || 0 }} sent
                </span>
                <span v-if="n.fail_count" class="text-xs text-red-500 dark:text-red-400 ml-1">({{ n.fail_count }} failed)</span>
              </td>
              <td class="px-5 py-3 text-right text-zinc-400">{{ formatDateTime(n.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="historyTotalPages > 1" class="flex items-center justify-between px-5 py-3 border-t border-zinc-100 dark:border-zinc-800">
        <p class="text-xs text-zinc-400">{{ historyTotal }} total</p>
        <div class="flex items-center gap-1">
          <UButton variant="ghost" size="xs" icon="i-lucide-chevron-left" :disabled="historyPage <= 1" @click="historyPage--" />
          <span class="text-xs text-zinc-500 dark:text-zinc-400 px-2">{{ historyPage }} / {{ historyTotalPages }}</span>
          <UButton variant="ghost" size="xs" icon="i-lucide-chevron-right" :disabled="historyPage >= historyTotalPages" @click="historyPage++" />
        </div>
      </div>
    </div>
  </div>
</template>
