export interface Wine {
  id: string
  nombre: string // Wine name
  productor: string // Producer
  region?: string // Region
  pais?: string // Country
  ano?: string // Vintage year
  uva?: string // Grape variety
  alcohol?: string // Alcohol content
  enologo?: string // Winemaker
  precio?: string // Bottle price
  precioCopa?: string // Glass price (general)
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
  categoria?: string // Sommelier category
  orden?: number // Display order
}

export type WineCategory = "all" | "glass" | "red" | "white" | "sparkling" | "rose" | "favorites"

export interface WineFilter {
  region?: string[]
  grape?: string[]
  style?: string[]
  type?: string[]
  price?: string[]
}
