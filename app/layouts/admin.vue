<template>
  <div class="min-h-screen bg-zinc-50 flex">
    <!-- Sidebar -->
    <aside class="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-zinc-200">
      <div class="p-6">
        <h1 class="text-lg font-bold text-zinc-900">ShopperArmy</h1>
        <p class="text-xs text-zinc-400">Admin Panel</p>
      </div>
      <nav class="flex-1 px-3 space-y-1">
        <NuxtLink to="/dashboard" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50">Dashboard</NuxtLink>
        <NuxtLink to="/missions" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50">Missions</NuxtLink>
        <NuxtLink to="/users" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50">Users</NuxtLink>
        <NuxtLink to="/segments" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50">Segments</NuxtLink>
        <NuxtLink to="/profile-questions" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50">Profile Questions</NuxtLink>
        <NuxtLink to="/notifications" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50">Notifications</NuxtLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <header class="h-16 bg-white border-b border-zinc-200 flex items-center px-6">
        <h2 class="text-sm font-medium text-zinc-500">Admin</h2>
      </header>
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
