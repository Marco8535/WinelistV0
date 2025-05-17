// Archivo: lib/fetch-wines.ts

import type { Wine } from "@/types/wine"; // Asegúrate que la ruta a tu archivo de tipos sea correcta

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
    console.log(`[fetchWines] Vinos parseados del CSV en total (antes de cualquier filtro en otras partes): ${wines.length}`);
    return wines;
  } catch (error) {
    console.error("Error crítico en fetchWines:", error);
    return [];
  }
}

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

function parseCSV(csvText: string): Wine[] {
  const lines = csvText.split("\n");
  if (lines.length <= 1) {
    console.warn("[parseCSV] El CSV está vacío o solo tiene encabezados.");
    return [];
  }

  const headers = lines[0].split(",").map((header) => header.trim());

  // ----> LOG PARA VER CABECERAS Y SU MAPEO <----
  console.log("----------------------------------------------------");
  console.log("[parseCSV] CABECERAS DETECTADAS EN EL CSV Y SU MAPEO:");
  headers.forEach(h => {
    const mappedKey = mapHeaderToWineProperty(h);
    console.log(`  -> Cabecera Original CSV: "${h}"   --- Mapeada a Propiedad Wine --->   "${mappedKey || "NO MAPEADA"}"`);
  });
  console.log("----------------------------------------------------");
  // ----> FIN DE LOG PARA CABECERAS <----

  const wines: Wine[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const wine: any = { id: `wine-${Date.now()}-${i}` };

    headers.forEach((header, index) => {
      const rawValue = values[index] ? values[index].trim() : "";
      const key = mapHeaderToWineProperty(header);

      if (key) {
        let processedValue: any = rawValue;
        if (key === 'enCarta') {
          const lowerVal = rawValue.toLowerCase();
          processedValue = lowerVal === "true" || lowerVal === "verdadero";
        } else if (key === 'orden') {
          const num = parseInt(rawValue, 10);
          processedValue = isNaN(num) ? null : num;
        } else if (key === 'precio' || key === 'precioCopa') {
          const num = parseFloat(rawValue.replace(',', '.'));
          processedValue = isNaN(num) ? null : num;
        } else if (key === 'ano') {
          if (rawValue.toUpperCase() === 'N/V') {
            processedValue = 'N/V';
          } else if (rawValue) {
            const yearNum = parseInt(rawValue, 10);
            processedValue = isNaN(yearNum) ? rawValue : yearNum;
          } else {
            processedValue = null;
          }
        }
        wine[key] = processedValue;
      }
    });

    if (wine.nombre) {
      // Log para los primeros vinos procesados, mostrando el valor crudo de enCarta
      if (i < 6) { // Loguea los primeros 5 vinos (índice 1 a 5)
        const enCartaColumnIndex = headers.findIndex(h => mapHeaderToWineProperty(h) === 'enCarta');
        const rawEnCartaValue = enCartaColumnIndex !== -1 ? values[enCartaColumnIndex] : "COLUMNA_ENCARTA_NO_ENCONTRADA";
        console.log(`[parseCSV] Procesando vino: ${wine.nombre || "SIN_NOMBRE"}, enCarta (procesado): ${wine.enCarta} (tipo: ${typeof wine.enCarta}), valor crudo para enCarta: '${rawEnCartaValue}', orden: ${wine.orden}`);
      }
      wines.push(wine as Wine);
    }
  }
  return wines;
}

function mapHeaderToWineProperty(header: string): keyof Wine | null {
  const normalizedHeader = header.trim().toUpperCase();
  const headerMap: Record<string, keyof Wine> = {
    "NOMBRE_VINO_COMPLETO": "nombre",
    "BODEGA": "productor",
    "COSECHA": "ano",
    "PRECIO_BOTELLA_RESTAURANTE R1": "precio",
    "PRECIO R1 COPA": "precioCopa",
    // --- ¡ATENCIÓN AQUÍ! ---
    // Cambia "ENCARTA_RESTAURANTE_1" por el nombre EXACTO de tu columna en el CSV (en mayúsculas)
    // Basado en tu imagen del CSV, parece que la columna es "EnCarta_Restaurante_1"
    // Si fuera "EnCarta_Restaurante1" (sin el último guion bajo), deberías poner:
    // "ENCARTA_RESTAURANTE1": "enCarta",
    "ENCARTA_RESTAURANTE1": "enCarta", // <-- Revisa esta clave con tu archivo CSV
    // ------------------------
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
    "SKU_LAZZY": "idInterno",
  };

  const mappedKey = headerMap[normalizedHeader];
  if (!mappedKey && header.trim() !== "" && !header.startsWith("FIELD")) { // Ignora si la cabecera es FIELD seguito de número.
    console.warn(`[mapHeaderToWineProperty] Cabecera del CSV no mapeada: '${header}' (Normalizada como: '${normalizedHeader}')`);
  }
  return mappedKey || null;
}
