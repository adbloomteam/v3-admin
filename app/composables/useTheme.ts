const ACCENT_KEY = 'sa-admin-accent-color'

const defaultAccent = 'rose'

export function useTheme() {
  const colorMode = useColorMode()
  const appConfig = useAppConfig()

  const accentColor = useState('accent-color', () => {
    if (import.meta.client) {
      return localStorage.getItem(ACCENT_KEY) || defaultAccent
    }
    return defaultAccent
  })

  function setAccentColor(color: string) {
    accentColor.value = color
    appConfig.ui.colors.primary = color
    if (import.meta.client) {
      localStorage.setItem(ACCENT_KEY, color)
    }
  }

  function toggleColorMode() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }

  const isDark = computed(() => colorMode.value === 'dark')

  return {
    accentColor: readonly(accentColor),
    setAccentColor,
    colorMode,
    isDark,
    toggleColorMode,
  }
}
