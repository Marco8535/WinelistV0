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

  // -------- PASO 2: ORDENAMIENTO GLOBAL DE LOS VINOS FILTRADOS --------
  // Hacemos una copia de los vinos filtrados para no modificar la lista original directamente.
  const sortedWines = [...filteredWines].sort((vinoA, vinoB) => {
    // Criterio de Ordenamiento Primario: 'orden' (Orden_Visualizacion_Restaurante)
    const ordenA = vinoA.orden; // El valor de 'orden' del vino A
    const ordenB = vinoB.orden; // El valor de 'orden' del vino B

    // Si vinoA tiene un número de orden y vinoB no (es null), vinoA va primero.
    if (ordenA !== null && ordenB === null) return -1;
    // Si vinoA no tiene orden (es null) y vinoB sí, vinoB va primero.
    if (ordenA === null && ordenB !== null) return 1;
    // Si ambos tienen un número de orden y son diferentes, los ordenamos del más bajo al más alto.
    if (ordenA !== null && ordenB !== null && ordenA !== ordenB) {
      return ordenA - ordenB;
    }
    // Si ambos tienen el mismo número de orden, o ambos son null, pasamos al siguiente criterio.

    // Criterio de Ordenamiento Secundario: 'ano' (Cosecha)
    // Este criterio solo se aplica si el Nombre_Vino_Completo Y la Bodega son iguales.
    // (En tu descripción original, este criterio es para vinos con el mismo Nombre y Bodega.
    //  Si el nombre o la bodega son diferentes, este criterio de cosecha no debería desempatar aquí,
    //  sino que se pasaría directamente al orden por nombre. Vamos a asumir que si los 'orden' son
    //  iguales, queremos ver la cosecha, y si las cosechas también llevan a empate, entonces el nombre.)

    // Para simplificar un poco aquí y asegurar que siempre haya un orden, aplicaremos el de cosecha
    // y luego el de nombre si los 'orden' son iguales o ambos nulos.
    // Si quieres el chequeo estricto de "mismo Nombre Y misma Bodega" para el sub-orden de cosecha,
    // necesitaríamos añadir: if (vinoA.nombre === vinoB.nombre && vinoA.productor === vinoB.productor) { ... }
    // alrededor de la lógica de cosecha. Por ahora, lo haremos más general.

    const cosechaA = vinoA.ano;
    const cosechaB = vinoB.ano;

    const aEsNV = typeof cosechaA === 'string' && cosechaA.toUpperCase() === 'N/V';
    const bEsNV = typeof cosechaB === 'string' && cosechaB.toUpperCase() === 'N/V';
    const aEsNumero = typeof cosechaA === 'number';
    const bEsNumero = typeof cosechaB === 'number';

    // Si vinoA es un año (número) y vinoB es 'N/V', vinoA va primero.
    if (aEsNumero && bEsNV) return -1;
    // Si vinoA es 'N/V' y vinoB es un año (número), vinoB va primero (así 'N/V' va después).
    if (aEsNV && bEsNumero) return 1;
    // Si ambos son años (números) y son diferentes, ordenamos del más antiguo al más nuevo.
    if (aEsNumero && bEsNumero && cosechaA !== cosechaB) {
      return cosechaA - cosechaB;
    }
    // Si ambos son 'N/V', o uno es 'N/V' y el otro no es un número comparable, o ambos son números iguales,
    // pasamos al siguiente criterio.

    // Criterio de Ordenamiento Terciario: 'nombre' (Nombre_Vino_Completo)
    // Ordenamos alfabéticamente por nombre, de la A a la Z.
    // (Usamos || "" por si acaso algún nombre fuera null o undefined, para evitar errores)
    return (vinoA.nombre || "").localeCompare(vinoB.nombre || "");
  });

  // -------- PASO 3: AGRUPACIÓN VISUAL --------
  // Creamos un objeto para ir guardando los vinos por categoría.
  // Ejemplo: { "Tintos": [vino1, vino2], "Blancos": [vino3] }
  const categoriasTemporales: Record<string, Wine[]> = {};

  sortedWines.forEach(vino => {
    // Decidimos la categoría:
    // 1. Usamos 'estilo' (Categoria_Sommelier) si existe.
    // 2. Si no, usamos 'tipo' (Tipo_Vino) si existe.
    // 3. Si no tiene ninguno, lo ponemos en "Otros Vinos".
    let categoriaClave = vino.estilo || vino.tipo || 'Otros Vinos';

    // Si es la primera vez que vemos esta categoría, creamos una lista vacía para ella.
    if (!categoriasTemporales[categoriaClave]) {
      categoriasTemporales[categoriaClave] = [];
    }
    // Añadimos el vino actual a la lista de su categoría.
    categoriasTemporales[categoriaClave].push(vino);
  });

  // -------- PASO 4: ORDENAR LAS CATEGORÍAS Y PREPARAR EL RESULTADO FINAL --------
  // Ahora convertimos nuestro objeto de categorías en una lista,
  // y ordenamos esta lista de categorías alfabéticamente por su nombre.
  const resultadoFinal: GroupedWineData = Object.keys(categoriasTemporales)
    .sort((categoriaA, categoriaB) => categoriaA.localeCompare(categoriaB))
    .map(nombreDeCategoria => ({
      categoryName: nombreDeCategoria,
      wines: categoriasTemporales[nombreDeCategoria] // La lista de vinos para esa categoría (ya están ordenados globalmente)
    }));

  return resultadoFinal; // Devolvemos la lista de categorías, con sus vinos dentro, todo ordenado.
}
