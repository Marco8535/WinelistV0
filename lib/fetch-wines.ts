// Archivo: lib/fetch-wines.ts

import type { Wine } from "@/types/wine"; // Asegúrate que la ruta a tu archivo de tipos sea correcta.
                                        // Si creaste lib/types.ts, sería: import type { Wine } from "./types";

export async function fetchWines(): Promise<Wine[]> {
  try {
    const csvUrl =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYJ_osaRfpE560QPeFdseyGCdyo0PQ10y0MutQYBaJXzk4b0oIs5twb1BliBePIANRiv0Qat_iftYF/pub?output=csv";
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch wine data: ${response.status}`);
    }
    const csvText = await response.text();
    const wines = parseCSV(csvText);
    return wines;
  } catch (error) {
    console.error("Error fetching wine data:", error);
    return [];
  }
}

function parseCSVLine(line: string): string[] { // Asegúrate que esta función exista
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
    return [];
  }

  const headers = lines[0].split(",").map((header) => header.trim());
  const wines: Wine[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);

    // Corrección en la generación del ID para que sea JavaScript válido:
    const wine: any = { id: `wine-${Date.now()}-${i}` };


    headers.forEach((header, index) => {
      const rawValue = values[index] ? values[index].trim() : "";
      const key = mapHeaderToWineProperty(header);

      if (key) {
        let processedValue: any = rawValue;
        if (key === 'enCarta') {
          processedValue = rawValue.toLowerCase() === "true";
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
      wines.push(wine as Wine);
    }
  }
  return wines;
}

// Corregir y simplificar mapHeaderToWineProperty:
function mapHeaderToWineProperty(header: string): keyof Wine | null {
  const normalizedHeader = header.trim().toUpperCase(); // Normalizar ANTES de buscar en el mapa

  // Un ÚNICO mapa. Las claves (izquierda) deben ser los encabezados del CSV en MAYÚSCULAS.
  // Los valores (derecha) deben ser las propiedades de tu 'interface Wine'.
  const headerMap: Record<string, keyof Wine> = {
    "NOMBRE_VINO_COMPLETO": "nombre",
    "BODEGA": "productor",
    "COSECHA": "ano",
    "PRECIO_BOTELLA_RESTAURANTE R1": "precio",
    "PRECIO R1 COPA": "precioCopa",
    // ¡IMPORTANTE! Revisa esta línea:
    // Si tu CSV dice "EnCarta_Restaurante_1", entonces "ENCARTA_RESTAURANTE_1" está bien.
    // Si tu CSV dice "EnCarta_Restaurante1" (sin el _ antes del 1), usa "ENCARTA_RESTAURANTE1".
    "ENCARTA_RESTAURANTE_1": "enCarta", // O "ENCARTA_RESTAURANTE1": "enCarta",
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
    "SKU_LAZZY": "idInterno", // Cambiado de "id" a "idInterno" como sugerí antes
  };

  return headerMap[normalizedHeader] || null;
}
