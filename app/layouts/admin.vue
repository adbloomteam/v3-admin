<script setup lang="ts">
const { logout } = useAuth()
const { isDark, toggleColorMode } = useTheme()
const route = useRoute()
const mobileOpen = ref(false)

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: 'i-lucide-layout-dashboard' },
  { label: 'Missions', to: '/missions', icon: 'i-lucide-target' },
  { label: 'Brands', to: '/brands', icon: 'i-lucide-building-2' },
  { label: 'Users', to: '/users', icon: 'i-lucide-users' },
  { label: 'Segments', to: '/segments', icon: 'i-lucide-filter' },
  { label: 'Transactions', to: '/transactions', icon: 'i-lucide-receipt' },
  { label: 'Withdrawals', to: '/withdrawals', icon: 'i-lucide-banknote' },
  { label: 'Payouts', to: '/payouts', icon: 'i-lucide-wallet' },
  { label: 'Notifications', to: '/notifications', icon: 'i-lucide-bell' },
  { label: 'Profile Questions', to: '/profile-questions', icon: 'i-lucide-clipboard-list' },
]

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <div class="min-h-screen bg-(--ui-bg-muted) flex">
    <!-- Mobile overlay -->
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-40 bg-black/30 lg:hidden"
      @click="mobileOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-(--ui-bg) border-r border-(--ui-border) transition-transform lg:translate-x-0 lg:static lg:z-auto',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="p-6 flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-(--ui-text)">ShopperArmy</h1>
          <p class="text-xs text-(--ui-text-muted)">Admin Panel</p>
        </div>
        <button class="lg:hidden text-(--ui-text-muted) hover:text-(--ui-text)" @click="mobileOpen = false">
          <UIcon name="i-lucide-x" class="size-5" />
        </button>
      </div>
      <nav class="flex-1 px-3 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isActive(item.to)
              ? 'bg-(--ui-primary)/10 text-(--ui-primary)'
              : 'text-(--ui-text-dimmed) hover:bg-(--ui-bg-elevated)'
          ]"
          @click="mobileOpen = false"
        >
          <UIcon :name="item.icon" class="size-4 shrink-0" />
          {{ item.label }}
        </NuxtLink>
      </nav>
      <div class="p-3 border-t border-(--ui-border)">
        <button
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-(--ui-text-muted) hover:bg-(--ui-bg-elevated) w-full transition-colors"
          @click="toggleColorMode"
        >
          <UIcon :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'" class="size-4 shrink-0" />
          {{ isDark ? 'Light Mode' : 'Dark Mode' }}
        </button>
        <button
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-(--ui-text-muted) hover:bg-(--ui-bg-elevated) w-full transition-colors"
          @click="logout"
        >
          <UIcon name="i-lucide-log-out" class="size-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-14 bg-(--ui-bg) border-b border-(--ui-border) flex items-center px-4 lg:px-6 shrink-0">
        <button class="lg:hidden mr-3 text-(--ui-text-muted) hover:text-(--ui-text)" @click="mobileOpen = true">
          <UIcon name="i-lucide-menu" class="size-5" />
        </button>
        <h2 class="text-sm font-medium text-(--ui-text-muted) truncate">ShopperArmy Admin</h2>
      </header>
      <main class="flex-1 p-4 lg:p-6 overflow-auto">
        <ErrorBoundary>
          <slot />
        </ErrorBoundary>
      </main>
    </div>
  </div>
</template>
