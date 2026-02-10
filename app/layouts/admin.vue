<script setup lang="ts">
const { logout } = useAuth()
const route = useRoute()
const mobileOpen = ref(false)

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: 'i-lucide-layout-dashboard' },
  { label: 'Missions', to: '/missions', icon: 'i-lucide-target' },
  { label: 'Users', to: '/users', icon: 'i-lucide-users' },
  { label: 'Segments', to: '/segments', icon: 'i-lucide-filter' },
  { label: 'Transactions', to: '/transactions', icon: 'i-lucide-receipt' },
  { label: 'Payouts', to: '/payouts', icon: 'i-lucide-wallet' },
  { label: 'Notifications', to: '/notifications', icon: 'i-lucide-bell' },
  { label: 'Profile Questions', to: '/profile-questions', icon: 'i-lucide-clipboard-list' },
]

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <div class="min-h-screen bg-zinc-50 flex">
    <!-- Mobile overlay -->
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-40 bg-black/30 lg:hidden"
      @click="mobileOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-zinc-200 transition-transform lg:translate-x-0 lg:static lg:z-auto',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="p-6 flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-zinc-900">ShopperArmy</h1>
          <p class="text-xs text-zinc-400">Admin Panel</p>
        </div>
        <button class="lg:hidden text-zinc-400 hover:text-zinc-600" @click="mobileOpen = false">
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
              ? 'bg-rose-50 text-rose-700'
              : 'text-zinc-600 hover:bg-zinc-100'
          ]"
          @click="mobileOpen = false"
        >
          <UIcon :name="item.icon" class="size-4 shrink-0" />
          {{ item.label }}
        </NuxtLink>
      </nav>
      <div class="p-3 border-t border-zinc-200">
        <button
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:bg-zinc-100 w-full transition-colors"
          @click="logout"
        >
          <UIcon name="i-lucide-log-out" class="size-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-14 bg-white border-b border-zinc-200 flex items-center px-4 lg:px-6 shrink-0">
        <button class="lg:hidden mr-3 text-zinc-500 hover:text-zinc-700" @click="mobileOpen = true">
          <UIcon name="i-lucide-menu" class="size-5" />
        </button>
        <h2 class="text-sm font-medium text-zinc-500 truncate">ShopperArmy Admin</h2>
      </header>
      <main class="flex-1 p-4 lg:p-6 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
