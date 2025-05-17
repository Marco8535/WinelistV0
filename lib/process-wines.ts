// Archivo: lib/process-wines.ts

import type { Wine, WineCategory, GroupedWineData } from "./types"; // Ajusta la ruta si es necesario

export function processAndGroupWines(wines: Wine[]): GroupedWineData {
  // PASO 1: FILTRADO INICIAL
  const filteredWines = wines.filter(wine => wine.enCarta === true);
  // console.log(`[processWines] Después del filtro 'enCarta', quedaron: ${filteredWines.length} vinos.`);

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

  // PASO 3: AGRUPACIÓN VISUAL (CON DEDUPLICACIÓN DE PRODUCTO POR CATEGORÍA)
  const categoriasTemporales: Record<string, Wine[]> = {};
  // Rastreador para asegurar que un producto (identificado por SKU o nombre+bodega)
  // solo se añada una vez a cada categoría visual específica.
  const productoYaEnCategoriaTracker = new Set<string>();

  sortedWines.forEach(vino => {
    // Usamos SKU (idInterno) como identificador primario del producto.
    // Si no hay SKU, usamos una combinación de nombre y productor normalizados.
    const nombreNorm = vino.nombre?.trim().toLowerCase() || "sin_nombre";
    const productorNorm = vino.productor?.trim().toLowerCase() || "sin_productor";
    const identificadorUnicoProducto = (vino.idInterno && vino.idInterno.trim() !== "")
      ? vino.idInterno.trim()
      : `${nombreNorm}-${productorNorm}`;

    const categoriasDelVino = new Set<string>(); // Categorías a las que este vino podría pertenecer

    // 1. Por Categoria_Sommelier (vino.estilo)
    if (vino.estilo && vino.estilo.trim() !== "") {
      categoriasDelVino.add(vino.estilo.trim());
    }
    // 2. Por Tipo_Vino (vino.tipo)
    if (vino.tipo && vino.tipo.trim() !== "") {
      categoriasDelVino.add(vino.tipo.trim());
    }
    // 3. Por Defecto "Otros Vinos"
    if (categoriasDelVino.size === 0) {
      categoriasDelVino.add('Otros Vinos');
    }

    // Añadir este vino a las categorías identificadas, evitando duplicados del MISMO PRODUCTO VINO en la MISMA CATEGORÍA.
    categoriasDelVino.forEach(nombreCategoria => {
      if (!categoriasTemporales[nombreCategoria]) {
        categoriasTemporales[nombreCategoria] = [];
      }

      const trackingKey = `${identificadorUnicoProducto}%%%${nombreCategoria}`;

      if (!productoYaEnCategoriaTracker.has(trackingKey)) {
        categoriasTemporales[nombreCategoria].push(vino);
        productoYaEnCategoriaTracker.add(trackingKey);
        
        // if (vino.nombre === "A lisa" || vino.nombre === "Alma Roja") { // Log de depuración
        //   console.log(`[processWines-AGRUP] Añadido "${vino.nombre}" (ID Prod: ${identificadorUnicoProducto}) a Cat: "${nombreCategoria}"`);
        // }
      } else {
        // if (vino.nombre === "A lisa" || vino.nombre === "Alma Roja") { // Log de depuración
        //   console.log(`[processWines-AGRUP] Duplicado EVITADO para "${vino.nombre}" (ID Prod: ${identificadorUnicoProducto}) en Cat: "${nombreCategoria}"`);
        // }
      }
    });
  });

  // PASO 4: ORDENAR LAS CATEGORÍAS Y PREPARAR EL RESULTADO FINAL
  const resultadoFinal: GroupedWineData = Object.keys(categoriasTemporales)
    .sort((a, b) => a.localeCompare(b))
    .map(categoryName => ({
      categoryName,
      wines: categoriasTemporales[categoryName]
    }));

  return resultadoFinal;
}
