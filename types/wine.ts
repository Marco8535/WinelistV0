export interface Wine {
  id: string
  nombre: string // Wine name
  productor: string // Producer
  region?: string // Region
  pais?: string // Country
  ano?: string | number // Vintage year
  uva?: string // Grape variety
  alcohol?: string // Alcohol content
  enologo?: string // Winemaker
  precio?: number | null // Bottle price
  precioCopa?: number | null // Glass price (general)
  precioCopaR1?: string // Glass price R1
  precioCopaR2?: string // Glass price R2
  precioCopaR3?: string // Glass price R3
  precioUSD?: string // Price in USD
  vista?: string // Visual tasting notes
  nariz?: string // Aroma tasting notes
  boca?: string // Palate tasting notes
  maridaje?: string // Food pairing
  otros?: string // Other info (organic, biodynamic, etc.)
  altitud?: string // Altitude
  estilo?: string // Style
  tipo?: string // Type (red, white, etc.)
  caracteristica?: string // Wine characteristic
  enCarta?: boolean // If the wine is on the menu
  orden?: number // Display order
  idInterno?: string // Internal ID
  // New fields for premium wineries
  isPremiumWinery?: boolean // If the winery paid for premium space
  premiumContent?: {
    text?: string
    imageUrl?: string
    websiteUrl?: string
  }
}

export interface WineFilter {
  region?: string[]
  grape?: string[]
  style?: string[]
  type?: string[]
  price?: string[]
}

export interface WineCategory {
  categoryName: string
  wines: Wine[]
}

export type GroupedWineData = WineCategory[]

// New interface for app configuration
export interface AppConfig {
  sommelierEnabled: boolean
  sommelierPhone?: string
  whatsappEnabled: boolean
  emailEnabled: boolean
  contactEmail?: string
  // Restaurant information
  restaurantName?: string
  restaurantAddress?: string
  currencySymbol?: string
  // Interface settings
  appTitle?: string
  showPrices?: boolean
  showAlcohol?: boolean
  compactView?: boolean
}
