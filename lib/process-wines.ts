// Archivo: lib/process-wines.ts

import type { Wine, WineCategory, GroupedWineData } from "./types"; // Ajusta la ruta si es necesario
// Si creaste lib/fetch-category-config.ts y CategoryConfig está ahí:
import type { CategoryConfig } from "./fetch-category-config";


// La función ahora acepta categoryOrderConfig como segundo parámetro
export function processAndGroupWines(
  wines: Wine[],
  categoryOrderConfig: CategoryConfig[] // <--- Configuración del orden de categorías
): GroupedWineData {

  // PASO 1: FILTRADO INICIAL
  const filteredWines = wines.filter(wine => wine.enCarta === true);
  console.log(`[processWines] INFO: Después del filtro 'enCarta', quedaron: ${filteredWines.length} vinos de ${wines.length} originales.`);

  // PASO 2: ORDENAMIENTO GLOBAL DE LOS VINOS FILTRADOS
  const sortedWines = [...filteredWines].sort((vinoA, vinoB) => {
    const ordenA = vinoA.orden;
    const ordenB = vinoB.orden;
    if (ordenA !== null && ordenB === null) return -1;
    if (ordenA === null && ordenB !== null) return 1;
    if (ordenA !== null && ordenB !== null && ordenA !== ordenB) {
      return ordenA - ordenB;
    }

    const cosechaA = vinoA.ano;
    const cosechaB = vinoB.ano;
    const aEsNV = typeof cosechaA === 'string' && cosechaA.toUpperCase() === 'N/V';
    const bEsNV = typeof cosechaB === 'string' && cosechaB.toUpperCase() === 'N/V';
    const aEsNumero = typeof cosechaA === 'number';
    const bEsNumero = typeof cosechaB === 'number';

    if (aEsNumero && bEsNV) return -1;
    if (aEsNV && bEsNumero) return 1;
    if (aEsNumero && bEsNumero && cosechaA !== cosechaB) {
      return cosechaA - cosechaB;
    }
    return (vinoA.nombre || "").localeCompare(vinoB.nombre || "");
  });

  // PASO 3: AGRUPACIÓN VISUAL (LÓGICA REVISADA Y ROBUSTA CON LOGS ACTIVOS)
  const categoriasTemporales: Record<string, Wine[]> = {};
  const productoYaAnadidoACategoriaTracker = new Set<string>();

  console.log(`[processWines] INFO: Iniciando agrupación para ${sortedWines.length} vinos ordenados.`);
  // Log inicial para ver los datos que llegan a esta función (solo para vinos clave)
  sortedWines.forEach(v => {
    if (v.nombre === "A lisa" || v.nombre === "Alma Roja" || v.nombre?.includes("Chacra")) {
      console.log(`[processWines] DATOS ENTRANTES para sortedWines - Vino: "${v.nombre}", Estilo: '${v.estilo}', Tipo: '${v.tipo}', SKU: '${v.idInterno}'`);
    }
  });


  sortedWines.forEach(vino => {
    const nombreLimpio = vino.nombre?.trim().toLowerCase() || "sin_nombre";
    const productorLimpio = vino.productor?.trim().toLowerCase() || "sin_productor";
    const identificadorUnicoProducto = (vino.idInterno && vino.idInterno.trim() !== "")
      ? vino.idInterno.trim()
      : `${nombreLimpio}-${productorLimpio}`;

    const nombresDeCategoriasParaEsteVino = new Set<string>();

    const estiloLimpio = vino.estilo?.trim();
    if (estiloLimpio && estiloLimpio !== "") {
      nombresDeCategoriasParaEsteVino.add(estiloLimpio);
    }

    const tipoLimpio = vino.tipo?.trim();
    if (tipoLimpio && tipoLimpio !== "") {
      nombresDeCategoriasParaEsteVino.add(tipoLimpio);
    }

    if (nombresDeCategoriasParaEsteVino.size === 0) {
      nombresDeCategoriasParaEsteVino.add('Otros Vinos');
    }

    // Logs de depuración para vinos específicos ANTES de intentar añadirlos
    if (vino.nombre === "A lisa" || vino.nombre === "Alma Roja" || vino.nombre === "Fuego Andino" || vino.nombre?.includes("Chacra")) {
      console.log(
        `[processWines-PRE-AGRUP] Vino: "${vino.nombre}" (ID Prod: ${identificadorUnicoProducto}, SKU: '${vino.idInterno}')\n` +
        `  Valores usados para agrupación -> Estilo: '${estiloLimpio}', Tipo: '${tipoLimpio}'\n` + // Muestra los valores que realmente se usan
        `  Categorías candidatas para este vino: [${Array.from(nombresDeCategoriasParaEsteVino).join(', ')}]`
      );
    }

    nombresDeCategoriasParaEsteVino.forEach(nombreCategoriaVisual => {
      if (!nombreCategoriaVisual || nombreCategoriaVisual.trim() === "") {
        console.warn(`[processWines] ALERTA: Se intentó usar un nombre de categoría vacío para el vino: ${vino.nombre}`);
        return;
      }

      const trackingKey = `${identificadorUnicoProducto}%%%${nombreCategoriaVisual}`;

      if (!categoriasTemporales[nombreCategoriaVisual]) {
        categoriasTemporales[nombreCategoriaVisual] = [];
      }

      if (!productoYaAnadidoACategoriaTracker.has(trackingKey)) {
        categoriasTemporales[nombreCategoriaVisual].push(vino);
        productoYaAnadidoACategoriaTracker.add(trackingKey);
        
        if (vino.nombre === "A lisa" || vino.nombre === "Alma Roja" || vino.nombre === "Fuego Andino" || vino.nombre?.includes("Chacra")) {
          console.log(`  >>>> [processWines-AGRUP] AÑADIDO "${vino.nombre}" (ID Prod: ${identificadorUnicoProducto}) a Categoría Visual: "${nombreCategoriaVisual}"`);
        }
      } else {
        if (vino.nombre === "A lisa" || vino.nombre === "Alma Roja" || vino.nombre === "Fuego Andino" || vino.nombre?.includes("Chacra")) {
          console.log(`  >>>> [processWines-AGRUP] DUPLICADO EVITADO para "${vino.nombre}" (ID Prod: ${identificadorUnicoProducto}) en Categoría Visual: "${nombreCategoriaVisual}" (TrackingKey: ${trackingKey} ya existía)`);
        }
      }
    });
  });

  // PASO 4: ORDENAR LAS CATEGORÍAS VISUALES Y PREPARAR EL RESULTADO FINAL
  const configuredOrderMap = new Map<string, number>();
  if (categoryOrderConfig) { // Verificar si categoryOrderConfig fue pasado
    categoryOrderConfig.forEach(config => {
      if (config.categoryName && typeof config.displayOrder === 'number') { // Asegurarse que los datos son válidos
        configuredOrderMap.set(config.categoryName, config.displayOrder);
      }
    });
  }
  // console.log("[processWines] INFO: Mapa de orden de categorías configurado:", configuredOrderMap);


  const resultadoFinal: GroupedWineData = Object.keys(categoriasTemporales)
    .sort((categoryA_name, categoryB_name) => {
      const orderA = configuredOrderMap.get(categoryA_name);
      const orderB = configuredOrderMap.get(categoryB_name);

      if (orderA !== undefined && orderB !== undefined) {
        return orderA - orderB;
      }
      if (orderA !== undefined && orderB === undefined) {
        return -1;
      }
      if (orderA === undefined && orderB !== undefined) {
        return 1;
      }
      return categoryA_name.localeCompare(categoryB_name);
    })
    .map(categoryName => ({
      categoryName,
      wines: categoriasTemporales[categoryName]
    }));
  
  console.log("[processWines] INFO: Estructura final de GroupedWineData (después de ordenar categorías):", JSON.stringify(resultadoFinal.map(c => ({ categoria: c.categoryName, vinos: c.wines.length })), null, 2));
  return resultadoFinal;
}
