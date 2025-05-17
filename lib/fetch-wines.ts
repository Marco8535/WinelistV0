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

  console.log("----------------------------------------------------");
  console.log("[parseCSV] CABECERAS DETECTADAS EN EL CSV Y SU MAPEO:");
  headers.forEach(h => {
    const mappedKey = mapHeaderToWineProperty(h);
    console.log(`  -> Cabecera Original CSV: "${h}"   --- Mapeada a Propiedad Wine --->   "${mappedKey || "NO MAPEADA"}"`);
  });
  console.log("----------------------------------------------------");

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
      if (i < 6) {
        const enCartaColumnIndex = headers.findIndex(h => mapHeaderToWineProperty(h) === 'enCarta');
        const rawEnCartaValue = enCartaColumnIndex !== -1 ? values[enCartaColumnIndex] : "COLUMNA_ENCARTA_NO_ENCONTRADA_O_NO_MAPEADA";
        
        const estiloColumnIndex = headers.findIndex(h => mapHeaderToWineProperty(h) === 'estilo');
        const rawEstiloValue = estiloColumnIndex !== -1 ? values[estiloColumnIndex] : "COLUMNA_ESTILO_NO_ENCONTRADA_O_NO_MAPEADA";

        const tipoColumnIndex = headers.findIndex(h => mapHeaderToWineProperty(h) === 'tipo');
        const rawTipoValue = tipoColumnIndex !== -1 ? values[tipoColumnIndex] : "COLUMNA_TIPO_NO_ENCONTRADA_O_NO_MAPEADA";

        console.log(
          `[parseCSV] Vino: ${wine.nombre || "SIN_NOMBRE"} | ` +
          `enCarta: ${wine.enCarta} (crudo:'${rawEnCartaValue}') | ` +
          `Estilo (Cat.Somm): '${wine.estilo}' (crudo:'${rawEstiloValue}') | ` +
          `Tipo: '${wine.tipo}' (crudo:'${rawTipoValue}') | ` +
          `Orden: ${wine.orden}`
        );
      }
      wines.push(wine as Wine);
    }
  }
  return wines;
}

function mapHeaderToWineProperty(header: string): keyof Wine | null {
  const normalizedHeader = header.trim().toUpperCase();
  const headerMap: Record<string, keyof Wine> = {
    // Mapeos principales confirmados por tus logs o altamente probables
    "SKU_LAZZY": "idInterno",
    "NOMBRE_VINO_COMPLETO": "nombre",
    "BODEGA": "productor",
    "COSECHA": "ano",
    "ORDEN_VISUALIZACION_RESTAURANTE": "orden",
    "ALCOHOL": "alcohol",

    // --- ¡CORRECCIONES CRÍTICAS BASADAS EN TUS ÚLTIMOS LOGS! ---
    "ENCARTA_RESTAURANTE1": "enCarta",         // CSV tiene 'EnCarta_Restaurante1'
    "CATEGORIA_SOMMELIER": "estilo",          // CSV tiene 'Categoría_Sommelier' (si es con tilde, usa "CATEGORÍA_SOMMELIER")
                                              // Basado en el log "(Normalizada como: 'CATEGORÍA_SOMMELIER')", usa la tilde si así está en el CSV.
                                              // Si dudas, usa la versión sin tilde primero, y si falla, prueba con tilde.
                                              // Por seguridad, si el CSV la tiene con tilde, la clave aquí DEBE tenerla.
                                              // Si tu log mostró 'CATEGORÍA_SOMMELIER' (con tilde) como NO MAPEADA, entonces la clave en el mapa debe ser "CATEGORÍA_SOMMELIER".
                                              // Vamos a asumir que es con tilde por tu log:
    "CATEGORÍA_SOMMELIER": "estilo",           // <--- Ajustado para incluir tilde basado en el log de "NO MAPEADA"
    "TIPOVINO": "tipo",                       // CSV tiene 'TipoVino'

    // --- Otros mapeos que tenías (verifica si las cabeceras CSV son correctas) ---
    "PRECIO_BOTELLA_RESTAURANTE R1": "precio",
    "PRECIO R1 COPA": "precioCopa",
    "PAIS_REGION_ORIGEN": "region",         // Verifica si esta es la cabecera correcta en tu CSV para la región
    "VISTA": "vista",
    "NARIZ": "nariz",
    "BOCA": "boca",
    "OTROS": "otros",
    "ALTITUD": "altitud",

    // --- Mapeos añadidos basados en tus logs de "NO MAPEADA" (si quieres usarlos) ---
    "CEPA": "uva",                             // CSV tiene 'Cepa'
    // "ENÓLOGO": "enologo",                   // CSV tiene 'Enólogo'. Asegúrate que 'enologo' exista en tu interface Wine.
                                              // Si la cabecera CSV es "Enologo" (sin tilde), usa "ENOLOGO".
    // "MARIDAJES": "maridaje",                // CSV tiene 'Maridajes'. Asegúrate que 'maridaje' exista en tu interface Wine.
                                              // Si la cabecera CSV es "Maridaje" (singular), usa "MARIDAJE".

    // Las siguientes son otras cabeceras que tus logs mostraron como "NO MAPEADA".
    // Si necesitas alguna, añádela aquí y a tu interface Wine.
    // "CARACTERÍSTICA DEL VINO": "propiedadCorrespondiente",
    // "NOMBRE": "propiedadCorrespondiente", // Ojo si es diferente a NOMBRE_VINO_COMPLETO
    // "DESCRIPCIÓN": "propiedadCorrespondiente",
    // "REGIÓN 1": "propiedadCorrespondiente",
    // "NOTAS DE CATA": "propiedadCorrespondiente",
  };

  const mappedKey = headerMap[normalizedHeader];
  // Descomenta el siguiente if si quieres un log explícito de cabeceras no encontradas en el mapa
  // if (!mappedKey && normalizedHeader !== "" && !normalizedHeader.startsWith("FIELD")) {
  //   console.warn(`[mapHeaderToWineProperty] ATENCIÓN: Cabecera CSV "${header}" (normalizada a "${normalizedHeader}") no tiene un mapeo definido en headerMap.`);
  // }
  return mappedKey || null;
}
