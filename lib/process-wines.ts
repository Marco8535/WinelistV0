// Archivo: lib/process-wines.ts

import type { Wine, GroupedWineData } from "@/types/wine"
import type { CategoryConfig } from "@/lib/storage-service"

// La función ahora acepta la configuración de categorías desde localStorage
export function processAndGroupWines(
  wines: Wine[],
  categoryConfig: CategoryConfig[] = [], // Configuración de categorías desde localStorage
): GroupedWineData {
  // Log para cada vino antes del filtrado
  wines.forEach((wine) => {
    console.log(`[processAndGroupWines] Receiving wine: ${wine.nombre} (ID: ${wine.id}), enCarta: ${wine.enCarta}`)
  })

  // PASO 1: FILTRADO INICIAL - Solo vinos en carta
  const filteredWines = wines.filter((wine) => wine.enCarta !== false)
  console.log(
    `[processWines] INFO: Después del filtro 'enCarta', quedaron: ${filteredWines.length} vinos de ${wines.length} originales.`,
  )

  // Log para depuración
  wines.forEach((wine) => {
    if (wine.enCarta === false) {
      console.log(`Vino excluido por enCarta=false: ${wine.nombre} (ID: ${wine.id})`)
    }
  })

  // Si no hay vinos después del filtrado, devolver un array vacío
  if (filteredWines.length === 0) {
    console.warn("[processWines] ADVERTENCIA: No hay vinos que cumplan con el criterio 'enCarta=true'")
    return []
  }

  // PASO 2: ORDENAMIENTO GLOBAL DE LOS VINOS FILTRADOS
  const sortedWines = [...filteredWines].sort((vinoA, vinoB) => {
    const ordenA = vinoA.orden
    const ordenB = vinoB.orden
    if (ordenA !== null && ordenB === null) return -1
    if (ordenA === null && ordenB !== null) return 1
    if (ordenA !== null && ordenB !== null && ordenA !== ordenB) {
      return ordenA - ordenB
    }

    const cosechaA = vinoA.ano
    const cosechaB = vinoB.ano
    const aEsNV = typeof cosechaA === "string" && cosechaA.toUpperCase() === "N/V"
    const bEsNV = typeof cosechaB === "string" && cosechaB.toUpperCase() === "N/V"
    const aEsNumero = typeof cosechaA === "number"
    const bEsNumero = typeof cosechaB === "number"

    if (aEsNumero && bEsNV) return -1
    if (aEsNV && bEsNumero) return 1
    if (aEsNumero && bEsNumero && cosechaA !== cosechaB) {
      return cosechaA - cosechaB
    }
    return (vinoA.nombre || "").localeCompare(vinoB.nombre || "")
  })

  // PASO 3: ASIGNACIÓN DE CATEGORÍAS MÚLTIPLES
  // Ahora permitiremos que un vino aparezca en múltiples categorías
  const categoriasTemporales: Record<string, Wine[]> = {}

  // Conjunto para evitar duplicados dentro de la misma categoría
  const vinoEnCategoriaTracker = new Set<string>() // formato: "vinoId-categoriaNombre"

  // Función para obtener todas las categorías de un vino
  const obtenerCategoriasDelVino = (vino: Wine): string[] => {
    const categorias: string[] = []

    // Añadir categoría basada en estilo (Categoria_Sommelier)
    if (vino.estilo && vino.estilo.trim() !== "") {
      categorias.push(vino.estilo.trim())
    }

    // Añadir categoría basada en tipo (Tipo_Vino) si es diferente del estilo
    if (vino.tipo && vino.tipo.trim() !== "") {
      const tipoLimpio = vino.tipo.trim()
      // Verificar si el tipo ya está incluido como estilo (para evitar duplicados)
      if (!categorias.some((cat) => cat.toLowerCase() === tipoLimpio.toLowerCase())) {
        categorias.push(tipoLimpio)
      }
    }

    // Si no hay categorías, asignar a "Otros Vinos"
    if (categorias.length === 0) {
      categorias.push("Otros Vinos")
    }

    return categorias
  }

  // Asignar cada vino a todas sus categorías
  sortedWines.forEach((vino) => {
    const categorias = obtenerCategoriasDelVino(vino)

    // Log para vinos específicos
    if (vino.nombre === "A lisa" || vino.nombre === "Alma Roja" || vino.nombre?.includes("Chacra")) {
      console.log(
        `[processWines] Vino "${vino.nombre}" (ID: ${vino.id}) asignado a categorías: ${categorias.join(", ")}`,
      )
    }

    // Asignar el vino a cada una de sus categorías
    categorias.forEach((categoria) => {
      const trackingKey = `${vino.id}-${categoria.toLowerCase()}`

      // Evitar duplicados dentro de la misma categoría
      if (!vinoEnCategoriaTracker.has(trackingKey)) {
        if (!categoriasTemporales[categoria]) {
          categoriasTemporales[categoria] = []
        }
        categoriasTemporales[categoria].push(vino)
        vinoEnCategoriaTracker.add(trackingKey)
      }
    })
  })

  // Si no hay categorías después de la asignación, devolver un array vacío
  if (Object.keys(categoriasTemporales).length === 0) {
    console.warn("[processWines] ADVERTENCIA: No se pudieron asignar categorías a los vinos")
    return []
  }

  // PASO 4: ORDENAR LAS CATEGORÍAS SEGÚN LA CONFIGURACIÓN
  const configuredOrderMap = new Map<string, number>()

  // Usar la configuración de categorías desde localStorage
  if (categoryConfig && categoryConfig.length > 0) {
    categoryConfig.forEach((config) => {
      if (config.name) {
        configuredOrderMap.set(config.name, config.order)
      }
    })
  }

  const resultadoFinal: GroupedWineData = Object.keys(categoriasTemporales)
    .sort((categoryA_name, categoryB_name) => {
      const orderA = configuredOrderMap.get(categoryA_name)
      const orderB = configuredOrderMap.get(categoryB_name)

      if (orderA !== undefined && orderB !== undefined) {
        return orderA - orderB
      }
      if (orderA !== undefined && orderB === undefined) {
        return -1
      }
      if (orderA === undefined && orderB !== undefined) {
        return 1
      }
      return categoryA_name.localeCompare(categoryB_name)
    })
    .map((categoryName) => ({
      categoryName,
      wines: categoriasTemporales[categoryName],
    }))

  console.log(
    "[processWines] INFO: Estructura final de GroupedWineData:",
    JSON.stringify(
      resultadoFinal.map((c) => ({ categoria: c.categoryName, vinos: c.wines.length })),
      null,
      2,
    ),
  )
  return resultadoFinal
}
