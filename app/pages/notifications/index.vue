<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { apiFetch } = useApi()

// Send form
const sending = ref(false)
const sendError = ref('')
const sendSuccess = ref('')
const sendForm = reactive({
  segmentId: '',
  subject: '',
  templateId: '',
  dataVariables: '',
})

// Segments for dropdown
const segments = ref<any[]>([])
onMounted(async () => {
  try {
    const res = await apiFetch<any>('/segments?perPage=100')
    segments.value = (res.segments || []).map((s: any) => ({ label: s.name, value: s.id }))
  } catch {}
  loadHistory()
})

const segmentOptions = computed(() => [
  { label: 'Select a segment...', value: '' },
  ...segments.value,
])

async function handleSend() {
  if (!sendForm.segmentId || !sendForm.subject) return
  sending.value = true
  sendError.value = ''
  sendSuccess.value = ''
  try {
    const body: any = {
      segmentId: sendForm.segmentId,
      subject: sendForm.subject,
    }
    if (sendForm.templateId) body.templateId = sendForm.templateId
    if (sendForm.dataVariables) {
      try { body.dataVariables = JSON.parse(sendForm.dataVariables) } catch {}
    }
    await apiFetch('/notifications/send', { method: 'POST', body })
    sendSuccess.value = 'Notification sent successfully'
    sendForm.subject = ''
    sendForm.templateId = ''
    sendForm.dataVariables = ''
    loadHistory()
  } catch (e: any) {
    sendError.value = e?.data?.error || 'Failed to send notification'
  } finally {
    sending.value = false
  }
}

// History
const loadingHistory = ref(true)
const history = ref<any[]>([])
const historyTotal = ref(0)
const historyPage = ref(1)
const historyPerPage = 20

async function loadHistory() {
  loadingHistory.value = true
  try {
    const params = new URLSearchParams({ page: String(historyPage.value), perPage: String(historyPerPage) })
    const res = await apiFetch<any>(`/notifications?${params}`)
    history.value = res.data || []
    historyTotal.value = res.total || 0
  } catch {}
  loadingHistory.value = false
}

const historyTotalPages = computed(() => Math.ceil(historyTotal.value / historyPerPage))
watch(historyPage, loadHistory)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Notifications</h1>

    <!-- Send form -->
    <div class="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
      <h2 class="text-base font-semibold mb-4">Send Notification</h2>
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
          <UFormField label="Template ID">
            <UInput v-model="sendForm.templateId" placeholder="Optional template ID" class="w-full" />
          </UFormField>
          <UFormField label="Data Variables (JSON)">
            <UInput v-model="sendForm.dataVariables" placeholder='{"key": "value"}' class="w-full" />
          </UFormField>
        </div>
        <div class="flex items-center gap-3">
          <UButton type="submit" color="primary" size="sm" :loading="sending" :disabled="!sendForm.segmentId || !sendForm.subject">
            Send Notification
          </UButton>
          <span v-if="sendSuccess" class="text-sm text-emerald-600">{{ sendSuccess }}</span>
          <span v-if="sendError" class="text-sm text-red-600">{{ sendError }}</span>
        </div>
      </form>
    </div>

    <!-- History -->
    <div class="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <div class="px-5 py-4 border-b border-zinc-100">
        <h2 class="text-base font-semibold">Notification History</h2>
      </div>

      <div v-if="loadingHistory" class="flex items-center justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-zinc-400" />
      </div>

      <div v-else-if="!history.length" class="px-5 py-12 text-center text-sm text-zinc-400">No notifications sent yet</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-100">
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Subject</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Segment</th>
              <th class="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Sent</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in history" :key="n.id" class="border-b border-zinc-50 last:border-0">
              <td class="px-5 py-3 text-zinc-900 font-medium">{{ n.subject || '—' }}</td>
              <td class="px-5 py-3 text-zinc-500">{{ n.segments?.name || n.segment_id?.slice(0, 8) || '—' }}</td>
              <td class="px-5 py-3">
                <UBadge :color="n.status === 'sent' ? 'success' : n.status === 'failed' ? 'error' : 'neutral'" variant="subtle" size="sm">
                  {{ n.status || 'pending' }}
                </UBadge>
              </td>
              <td class="px-5 py-3 text-right text-zinc-400">{{ formatDateTime(n.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="historyTotalPages > 1" class="flex items-center justify-between px-5 py-3 border-t border-zinc-100">
        <p class="text-xs text-zinc-400">{{ historyTotal }} total</p>
        <div class="flex items-center gap-1">
          <UButton variant="ghost" size="xs" icon="i-lucide-chevron-left" :disabled="historyPage <= 1" @click="historyPage--" />
          <span class="text-xs text-zinc-500 px-2">{{ historyPage }} / {{ historyTotalPages }}</span>
          <UButton variant="ghost" size="xs" icon="i-lucide-chevron-right" :disabled="historyPage >= historyTotalPages" @click="historyPage++" />
        </div>
      </div>
    </div>
  </div>
</template>
