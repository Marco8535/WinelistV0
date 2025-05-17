// Archivo: lib/fetch-wines.ts

// Asegúrate de que la ruta a tu archivo de tipos sea la correcta.
// Si tu archivo de tipos se llama 'wine.ts' y está en la carpeta 'types' (que a su vez está al mismo nivel que 'lib'),
// y tienes un alias '@/' que apunta a la raíz de tu proyecto (donde está 'types', 'lib', 'app', etc.),
// entonces "@/types/wine" es probablemente correcto.
// Si 'types.ts' está directamente en 'lib/', podría ser './types' o '@/lib/types'.
import type { Wine } from "@/types/wine";

export async function fetchWines(): Promise<Wine[]> {
  try {
    const csvUrl =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYJ_osaRfpE560QPeFdseyGCdyo0PQ10y0MutQYBaJXzk4b0oIs5twb1BliBePIANRiv0Qat_iftYF/pub?output=csv";
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Falló la carga de datos de vinos: ${response.status}`);
    }
    const csvText = await response.text();
    const wines = parseCSV(csvText);
    console.log("[fetchWines] Vinos parseados del CSV:", wines.length); // Log general
    return wines;
  } catch (error) {
    console.error("Error crítico en fetchWines:", error);
    return [];
  }
}

// Función auxiliar para parsear una línea del CSV, manejando comillas.
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = "";
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue.trim());
  return values;
}

// Función principal para parsear el texto CSV completo.
function parseCSV(csvText: string): Wine[] {
  const lines = csvText.split("\n");
  if (lines.length <= 1) {
    console.warn("[parseCSV] El CSV está vacío o solo tiene encabezados.");
    return [];
  }

  const headers = lines[0].split(",").map((header) => header.trim());
  const wines: Wine[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Saltar líneas vacías

    const values = parseCSVLine(line);
    const wine: any = { id: `wine-${Date.now()}-${i}` }; // ID único generado

    headers.forEach((header, index) => {
      const rawValue = values[index] ? values[index].trim() : "";
      const key = mapHeaderToWineProperty(header);

      if (key) {
        let processedValue: any = rawValue; // Por defecto, el valor es el texto crudo

        // Conversiones de tipo específicas
        if (key === 'enCarta') {
          const lowerVal = rawValue.toLowerCase();
          processedValue = lowerVal === "true" || lowerVal === "verdadero"; // Acepta "true" O "verdadero"
        } else if (key === 'orden') {
          const num = parseInt(rawValue, 10);
          processedValue = isNaN(num) ? null : num;
        } else if (key === 'precio' || key === 'precioCopa') {
          const num = parseFloat(rawValue.replace(',', '.')); // Considera comas en decimales
          processedValue = isNaN(num) ? null : num;
        } else if (key === 'ano') {
          if (rawValue.toUpperCase() === 'N/V') {
            processedValue = 'N/V';
          } else if (rawValue) {
            const yearNum = parseInt(rawValue, 10);
            // Si no es un número válido, pero rawValue tiene contenido (ej. texto descriptivo), mantenemos rawValue.
            // Si rawValue es vacío y no es 'N/V', se volverá null abajo.
            processedValue = isNaN(yearNum) ? rawValue : yearNum;
          } else {
            processedValue = null; // Si está vacío, lo dejamos como 'nada'
          }
        }
        // Aquí no se hace más conversión, se asigna el valor procesado o el rawValue si no hubo regla.
        wine[key] = processedValue;
      }
    });

    // console.log para depurar cada vino parseado (antes de filtrar por nombre)
    // Descomenta la siguiente línea si quieres ver cada objeto 'wine' en la consola.
    // console.log("CSV Parseado - Obj Vino:", JSON.stringify(wine));
    // console.log("CSV Parseado - enCarta:", wine.enCarta, "| Tipo:", typeof wine.enCarta, "| Nombre:", wine.nombre);


    if (wine.nombre) { // Solo añadimos si tiene nombre (un filtro muy básico aquí)
        // Log específico para 'enCarta' justo antes de decidir si se añade el vino
        if (i < 5) { // Loguea solo los primeros 5 para no llenar la consola
            console.log(`[parseCSV] Vino procesado: ${wine.nombre}, enCarta: ${wine.enCarta} (tipo: ${typeof wine.enCarta}), valor crudo para enCarta: '${values[headers.findIndex(h => mapHeaderToWineProperty(h) === 'enCarta')]}', orden: ${wine.orden}`);
        }
        wines.push(wine as Wine);
    } else {
        // Loguea si un vino es descartado por no tener nombre
        // console.log("[parseCSV] Vino descartado por no tener nombre. Datos crudos de la línea:", values.join(','));
    }
  }
  return wines;
}

// Función para mapear encabezados del CSV a propiedades del objeto Wine.
function mapHeaderToWineProperty(header: string): keyof Wine | null {
  const normalizedHeader = header.trim().toUpperCase(); // Normalizar: quitar espacios y a MAYÚSCULAS

  // Las CLAVES (izquierda) deben ser los encabezados de tu CSV en MAYÚSCULAS.
  // Los VALORES (derecha) deben ser las propiedades de tu 'interface Wine'.
  const headerMap: Record<string, keyof Wine> = {
    "NOMBRE_VINO_COMPLETO": "nombre",
    "BODEGA": "productor",
    "COSECHA": "ano",
    "PRECIO_BOTELLA_RESTAURANTE R1": "precio",
    "PRECIO R1 COPA": "precioCopa",
    // ¡MUY IMPORTANTE! Verifica esta línea con tu CSV:
    // Si tu columna se llama "EnCarta_Restaurante_1" (con guion bajo antes del 1), usa "ENCARTA_RESTAURANTE_1".
    // Si se llama "EnCarta_Restaurante1" (sin guion bajo antes del 1), usa "ENCARTA_RESTAURANTE1".
    "ENCARTA_RESTAURANTE_1": "enCarta", // <--- AJUSTA ESTA CLAVE SI ES NECESARIO
    "PAIS_REGION_ORIGEN": "region",
    "CATEGORIA_SOMMELIER": "estilo",
    "TIPO_VINO": "tipo",
    "VARIEDAD": "uva",
    "ALCOHOL": "alcohol",
    "ENOLOGO": "enologo",
    "VISTA": "vista",
    "NARIZ": "nariz",
    "BOCA": "boca",
    "MARIDAJE": "maridaje",
    "OTROS": "otros",
    "ALTITUD": "altitud",
    "ORDEN_VISUALIZACION_RESTAURANTE": "orden",
    "SKU_LAZZY": "idInterno", // Usamos 'idInterno' para el SKU del CSV
  };

  const mappedKey = headerMap[normalizedHeader];
  // if (!mappedKey && header.trim() !== "") { // Descomenta para ver cabeceras no mapeadas
  //   console.warn(`[mapHeaderToWineProperty] Cabecera no mapeada: '${header}' (Normalizada: '${normalizedHeader}')`);
  // }
  return mappedKey || null;
}
