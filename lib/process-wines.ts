// Este es el archivo NUEVO: lib/process-wines.ts

// Importamos las "fichas técnicas" que definimos en types.ts
import type { Wine, WineCategory, GroupedWineData } from "./types";
// Si pusiste los tipos en lib/types/wine.ts, la línea de arriba sería:
// import type { Wine, WineCategory, GroupedWineData } from "./types/wine";

// Esta es la función principal que hará todo el trabajo de procesar los vinos.
export function processAndGroupWines(wines: Wine[]): GroupedWineData {
  // -------- PASO 1: FILTRADO INICIAL --------
  // Nos quedamos solo con los vinos que tienen 'enCarta' como verdadero.
  const filteredWines = wines.filter(wine => wine.enCarta === true);
  // console.log("[processAndGroupWines] Después filtro 'enCarta === true':", filteredWines.length, "vinos."); // Puedes descomentar para depurar

  // -------- PASO 2: ORDENAMIENTO GLOBAL DE LOS VINOS FILTRADOS --------
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

  // -------- PASO 3: AGRUPACIÓN VISUAL (CORREGIDA PARA ASIGNACIÓN Y DEDUPLICACIÓN) --------
const categoriasTemporales: Record<string, Wine[]> = {};
const vinosYaProcesadosPorCategoria = new Map<string, Set<string>>(); // Mapa: nombreCategoria -> Set de identificadoresUnicosDeVino

sortedWines.forEach(vino => {
  // Definir el identificador único del PRODUCTO vino.
  // Priorizamos idInterno (SKU_LAZZY). Si no existe, usamos nombre+productor.
  const identificadorUnicoProducto = vino.idInterno && vino.idInterno.trim() !== ""
    ? vino.idInterno.trim()
    : `${vino.nombre?.trim()}-${vino.productor?.trim()}`;

  const categoriasParaEsteVino = new Set<string>(); // Nombres de las categorías a las que este vino podría pertenecer

  // 1. Categoría por Categoria_Sommelier (vino.estilo)
  if (vino.estilo && vino.estilo.trim() !== "") {
    categoriasParaEsteVino.add(vino.estilo.trim());
  }

  // 2. Categoría por Tipo_Vino (vino.tipo)
  if (vino.tipo && vino.tipo.trim() !== "") {
    categoriasParaEsteVino.add(vino.tipo.trim());
  }

  // 3. Si no tiene ni estilo ni tipo con valor, va a "Otros Vinos"
  if (categoriasParaEsteVino.size === 0) {
    categoriasParaEsteVino.add('Otros Vinos');
  }

  // Añadir el vino a cada una de sus categorías identificadas, evitando duplicados del MISMO PRODUCTO VINO
  categoriasParaEsteVino.forEach(nombreCategoria => {
    if (!categoriasTemporales[nombreCategoria]) {
      categoriasTemporales[nombreCategoria] = [];
      vinosYaProcesadosPorCategoria.set(nombreCategoria, new Set<string>());
    }

    // Verificar si este PRODUCTO vino ya fue añadido a ESTA categoría específica
    if (!vinosYaProcesadosPorCategoria.get(nombreCategoria)!.has(identificadorUnicoProducto)) {
      categoriasTemporales[nombreCategoria].push(vino);
      vinosYaProcesadosPorCategoria.get(nombreCategoria)!.add(identificadorUnicoProducto);
      
      // Log para depuración de la asignación
      if (vino.nombre === "A lisa" || vino.nombre === "Alma Roja" || vino.nombre === "Fuego Andino") {
        console.log(`[processWines-AGRUPACION] Añadiendo "${vino.nombre}" (ID Producto: ${identificadorUnicoProducto}) a Categoría: "${nombreCategoria}"`);
      }
    } else {
      // Log para depuración si se evita un duplicado
      if (vino.nombre === "A lisa" || vino.nombre === "Alma Roja" || vino.nombre === "Fuego Andino") {
        console.log(`[processWines-AGRUPACION] EVITADO DUPLICADO: "${vino.nombre}" (ID Producto: ${identificadorUnicoProducto}) ya existe en Categoría: "${nombreCategoria}"`);
      }
    }
  });
});

  // -------- PASO 4: ORDENAR LAS CATEGORÍAS Y PREPARAR EL RESULTADO FINAL --------
  const resultadoFinal: GroupedWineData = Object.keys(categoriasTemporales) // Se usa categoriasTemporales
    .sort((a, b) => a.localeCompare(b))
    .map(categoryName => ({
      categoryName,
      wines: categoriasTemporales[categoryName] // Se usa categoriasTemporales
    }));

  return resultadoFinal;
}
