export interface Wine {
  SKU_LAZZY: string
  EnCarta_Restaurante_1: boolean
  Bodega: string
  Nombre_Vino_Completo: string
  Cosecha: string
  Tipo_Vino: string
  Pais_Region_Origen: string
  Categoria_Sommelier?: string
  Precio_Botella_Restaurante: number
  Orden_Visualizacion_Restaurante: number
}

// This would typically fetch from an API or database
export async function fetchWines(): Promise<Wine[]> {
  // Sample data for demonstration
  const wines: Wine[] = [
    {
      SKU_LAZZY: "MAL001",
      EnCarta_Restaurante_1: true,
      Bodega: "Bodega Ejemplo",
      Nombre_Vino_Completo: "Gran Reserva Malbec Ejemplo",
      Cosecha: "2019",
      Tipo_Vino: "Tinto",
      Pais_Region_Origen: "Mendoza, Argentina",
      Categoria_Sommelier: "Grandes Tintos",
      Precio_Botella_Restaurante: 125.5,
      Orden_Visualizacion_Restaurante: 1,
    },
    {
      SKU_LAZZY: "CAB002",
      EnCarta_Restaurante_1: true,
      Bodega: "Viñedos Antiguos",
      Nombre_Vino_Completo: "Cabernet Sauvignon Reserva",
      Cosecha: "2018",
      Tipo_Vino: "Tinto",
      Pais_Region_Origen: "Valle de Uco, Argentina",
      Categoria_Sommelier: "Grandes Tintos",
      Precio_Botella_Restaurante: 180.0,
      Orden_Visualizacion_Restaurante: 2,
    },
    {
      SKU_LAZZY: "ESP002",
      EnCarta_Restaurante_1: true,
      Bodega: "Cava Ejemplo",
      Nombre_Vino_Completo: "Brut Nature Ejemplo",
      Cosecha: "N/V",
      Tipo_Vino: "Espumoso",
      Pais_Region_Origen: "Penedès, España",
      Categoria_Sommelier: "Burbujas Festivas",
      Precio_Botella_Restaurante: 90.0,
      Orden_Visualizacion_Restaurante: 2,
    },
    {
      SKU_LAZZY: "CHA003",
      EnCarta_Restaurante_1: true,
      Bodega: "Champagne Prestige",
      Nombre_Vino_Completo: "Cuvée Especial Brut",
      Cosecha: "2015",
      Tipo_Vino: "Espumoso",
      Pais_Region_Origen: "Champagne, Francia",
      Categoria_Sommelier: "Burbujas Festivas",
      Precio_Botella_Restaurante: 210.0,
      Orden_Visualizacion_Restaurante: 1,
    },
    {
      SKU_LAZZY: "CHA004",
      EnCarta_Restaurante_1: true,
      Bodega: "Maison Elegance",
      Nombre_Vino_Completo: "Blanc de Blancs Premier",
      Cosecha: "N/V",
      Tipo_Vino: "Espumoso",
      Pais_Region_Origen: "Champagne, Francia",
      Categoria_Sommelier: "Burbujas Festivas",
      Precio_Botella_Restaurante: 185.0,
      Orden_Visualizacion_Restaurante: 3,
    },
    {
      SKU_LAZZY: "BLA001",
      EnCarta_Restaurante_1: true,
      Bodega: "Château Blanc",
      Nombre_Vino_Completo: "Sauvignon Blanc Reserva",
      Cosecha: "2021",
      Tipo_Vino: "Blanco",
      Pais_Region_Origen: "Valle de Casablanca, Chile",
      Categoria_Sommelier: "Blancos Frescos",
      Precio_Botella_Restaurante: 95.0,
      Orden_Visualizacion_Restaurante: 1,
    },
    {
      SKU_LAZZY: "CHA002",
      EnCarta_Restaurante_1: true,
      Bodega: "Domaine Elegance",
      Nombre_Vino_Completo: "Chardonnay Grand Cru",
      Cosecha: "2020",
      Tipo_Vino: "Blanco",
      Pais_Region_Origen: "Borgoña, Francia",
      Categoria_Sommelier: "Blancos Frescos",
      Precio_Botella_Restaurante: 165.0,
      Orden_Visualizacion_Restaurante: 2,
    },
    {
      SKU_LAZZY: "PIN001",
      EnCarta_Restaurante_1: true,
      Bodega: "Viñedos del Norte",
      Nombre_Vino_Completo: "Pinot Noir Selección Especial",
      Cosecha: "2019",
      Tipo_Vino: "Tinto",
      Pais_Region_Origen: "Valle de Leyda, Chile",
      Precio_Botella_Restaurante: 140.0,
      Orden_Visualizacion_Restaurante: 3,
    },
    {
      SKU_LAZZY: "ROS001",
      EnCarta_Restaurante_1: true,
      Bodega: "Château Rosé",
      Nombre_Vino_Completo: "Rosé de Provence Premium",
      Cosecha: "2022",
      Tipo_Vino: "Rosado",
      Pais_Region_Origen: "Provence, Francia",
      Categoria_Sommelier: "Rosados Elegantes",
      Precio_Botella_Restaurante: 110.0,
      Orden_Visualizacion_Restaurante: 1,
    },
    {
      SKU_LAZZY: "ROS002",
      EnCarta_Restaurante_1: true,
      Bodega: "Bodegas Rosadas",
      Nombre_Vino_Completo: "Garnacha Rosé Reserva",
      Cosecha: "2021",
      Tipo_Vino: "Rosado",
      Pais_Region_Origen: "Navarra, España",
      Categoria_Sommelier: "Rosados Elegantes",
      Precio_Botella_Restaurante: 85.0,
      Orden_Visualizacion_Restaurante: 2,
    },
  ]

  return wines
}
