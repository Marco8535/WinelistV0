// Tipos para la configuración persistente
export interface CategoryConfig {
  id: string
  name: string
  order: number
}

export interface CepaConfig {
  id: string
  categoryId: string
  name: string
  order: number
}

export interface WineConfig {
  id: string
  visible: boolean
  order: number
}

export interface WineListConfig {
  categories: CategoryConfig[]
  cepas: CepaConfig[]
  wines: WineConfig[]
  lastUpdated: number // timestamp
}

// Claves para localStorage
const CONFIG_KEY = "wine-list-config"

// Servicio de almacenamiento
export const storageService = {
  // Guardar configuración
  saveConfig: (config: WineListConfig): boolean => {
    try {
      const configWithTimestamp = {
        ...config,
        lastUpdated: Date.now(),
      }
      localStorage.setItem(CONFIG_KEY, JSON.stringify(configWithTimestamp))
      console.log("Configuración guardada correctamente:", configWithTimestamp)
      return true
    } catch (error) {
      console.error("Error al guardar la configuración:", error)
      return false
    }
  },

  // Cargar configuración
  loadConfig: (): WineListConfig | null => {
    try {
      const storedConfig = localStorage.getItem(CONFIG_KEY)
      if (!storedConfig) return null

      const parsedConfig = JSON.parse(storedConfig) as WineListConfig
      console.log("Configuración cargada correctamente:", parsedConfig)
      return parsedConfig
    } catch (error) {
      console.error("Error al cargar la configuración:", error)
      return null
    }
  },

  // Eliminar configuración
  clearConfig: (): boolean => {
    try {
      localStorage.removeItem(CONFIG_KEY)
      console.log("Configuración eliminada correctamente")
      return true
    } catch (error) {
      console.error("Error al eliminar la configuración:", error)
      return false
    }
  },
}
