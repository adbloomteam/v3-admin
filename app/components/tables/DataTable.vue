<script setup lang="ts" generic="T">
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  type ColumnDef,
} from '@tanstack/vue-table'

const props = withDefaults(defineProps<{
  columns: ColumnDef<T, any>[]
  data: T[]
  loading?: boolean
  error?: string
  emptyMessage?: string
  // Server-side pagination
  page?: number
  perPage?: number
  total?: number
}>(), {
  loading: false,
  error: '',
  emptyMessage: 'No results found',
  page: 1,
  perPage: 20,
  total: 0,
})

const emit = defineEmits<{
  'update:page': [page: number]
}>()

const table = useVueTable({
  get data() { return props.data },
  get columns() { return props.columns },
  getCoreRowModel: getCoreRowModel(),
  manualPagination: true,
  get rowCount() { return props.total },
})

const totalPages = computed(() => Math.ceil(props.total / props.perPage))
</script>

<template>
  <div class="bg-(--ui-bg) rounded-xl border border-(--ui-border) overflow-hidden">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-(--ui-text-muted)" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="px-5 py-12 text-center text-sm text-red-600">
      {{ error }}
    </div>

    <!-- Empty -->
    <div v-else-if="!data.length" class="px-5 py-12 text-center text-sm text-(--ui-text-muted)">
      {{ emptyMessage }}
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-(--ui-border)">
            <th
              v-for="header in table.getHeaderGroups()[0]?.headers"
              :key="header.id"
              class="px-5 py-3 text-xs font-medium text-(--ui-text-muted) uppercase tracking-wide"
              :class="(header.column.columnDef.meta as any)?.headerClass || 'text-left'"
            >
              <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="border-b border-(--ui-border-muted) last:border-0 hover:bg-(--ui-bg-elevated)/50 transition-colors"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              class="px-5 py-3"
              :class="(cell.column.columnDef.meta as any)?.cellClass || ''"
            >
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between px-5 py-3 border-t border-(--ui-border)">
      <p class="text-xs text-(--ui-text-muted)">{{ total }} total</p>
      <div class="flex items-center gap-1">
        <UButton
          variant="ghost"
          size="xs"
          icon="i-lucide-chevron-left"
          :disabled="page <= 1"
          @click="emit('update:page', page - 1)"
        />
        <span class="text-xs text-(--ui-text-muted) px-2">{{ page }} / {{ totalPages }}</span>
        <UButton
          variant="ghost"
          size="xs"
          icon="i-lucide-chevron-right"
          :disabled="page >= totalPages"
          @click="emit('update:page', page + 1)"
        />
      </div>
    </div>
  </div>
</template>
