import type { Wine, GroupedWineData } from "@/types/wine"
import type { WineListConfig } from "./storage-service"

export function diagnoseWineData(
  rawWines: Wine[],
  processedWines: Wine[],
  categorizedData: GroupedWineData,
  config: WineListConfig | null,
) {
  console.group("Diagnóstico de Datos de Vinos")

  // Información general
  console.log(`Total de vinos crudos: ${rawWines.length}`)
  console.log(`Total de vinos procesados: ${processedWines.length}`)
  console.log(`Total de categorías: ${categorizedData.length}`)

  // Verificar vinos en carta
  const winesInCarta = rawWines.filter((wine) => wine.enCarta === true)
  console.log(`Vinos marcados como 'enCarta=true' en datos crudos: ${winesInCarta.length}`)

  // Verificar configuración
  if (config) {
    console.log(`Configuración cargada: ${config.wines.length} vinos configurados`)

    // Verificar visibilidad en la configuración
    const visibleInConfig = config.wines.filter((w) => w.visible).length
    console.log(`Vinos marcados como visibles en la configuración: ${visibleInConfig}`)

    // Verificar si hay discrepancias
    const winesNotInConfig = rawWines.filter((wine) => !config.wines.some((configWine) => configWine.id === wine.id))
    console.log(`Vinos sin configuración: ${winesNotInConfig.length}`)

    if (winesNotInConfig.length > 0) {
      console.log("Ejemplos de vinos sin configuración:", winesNotInConfig.slice(0, 3))
    }
  } else {
    console.log("No hay configuración guardada")
  }

  // Verificar categorías vacías
  const emptyCats = categorizedData.filter((cat) => cat.wines.length === 0)
  console.log(`Categorías sin vinos: ${emptyCats.length}`)
  if (emptyCats.length > 0) {
    console.log(
      "Categorías vacías:",
      emptyCats.map((cat) => cat.categoryName),
    )
  }

  // Verificar distribución de vinos por categoría
  console.log("Distribución de vinos por categoría:")
  categorizedData.forEach((cat) => {
    console.log(`- ${cat.categoryName}: ${cat.wines.length} vinos`)
  })

  console.groupEnd()
}

// Añadir después de la función diagnoseWineData existente

export function diagnoseWineIds(rawWines: Wine[], processedWines: Wine[], config: WineListConfig | null) {
  console.group("Diagnóstico de IDs de Vinos")

  // Verificar IDs en datos crudos
  console.log(`Total de vinos crudos: ${rawWines.length}`)

  // Contar vinos con idInterno
  const winesWithIdInterno = rawWines.filter((w) => w.idInterno && w.idInterno.trim() !== "")
  console.log(
    `Vinos con idInterno: ${winesWithIdInterno.length} (${Math.round((winesWithIdInterno.length / rawWines.length) * 100)}%)`,
  )

  // Verificar si los IDs coinciden con idInterno
  const winesWithMatchingIds = rawWines.filter((w) => w.id === w.idInterno)
  console.log(
    `Vinos donde id === idInterno: ${winesWithMatchingIds.length} (${Math.round((winesWithMatchingIds.length / rawWines.length) * 100)}%)`,
  )

  // Mostrar ejemplos de IDs
  console.log("Ejemplos de IDs de vinos:")
  rawWines.slice(0, 5).forEach((wine) => {
    console.log(`- ${wine.nombre}: id="${wine.id}", idInterno="${wine.idInterno}"`)
  })

  // Verificar configuración
  if (config) {
    console.log(`Configuración cargada: ${config.wines.length} vinos configurados`)

    // Verificar coincidencias de IDs entre config y rawWines
    const configMatchesById = config.wines.filter((configWine) => rawWines.some((wine) => wine.id === configWine.id))
    console.log(
      `Vinos en config que coinciden por id con rawWines: ${configMatchesById.length} (${Math.round((configMatchesById.length / config.wines.length) * 100)}%)`,
    )

    // Verificar coincidencias por idInterno
    const configMatchesByIdInterno = config.wines.filter((configWine) =>
      rawWines.some((wine) => wine.idInterno === configWine.id),
    )
    console.log(
      `Vinos en config que coinciden por idInterno con rawWines: ${configMatchesByIdInterno.length} (${Math.round((configMatchesByIdInterno.length / config.wines.length) * 100)}%)`,
    )

    // Mostrar ejemplos de configuración
    console.log("Ejemplos de configuración de vinos:")
    config.wines.slice(0, 5).forEach((configWine) => {
      const matchingWine = rawWines.find((w) => w.id === configWine.id)
      console.log(
        `- Config ID: "${configWine.id}", visible: ${configWine.visible}, matches wine: ${matchingWine ? matchingWine.nombre : "NO MATCH"}`,
      )
    })
  }

  console.groupEnd()
}
