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
  // Quitamos el símbolo '$' y cualquier espacio en blanco al inicio/final
  // También reemplazamos la coma decimal (si la usas) por un punto.
  const cleanedValue = rawValue.replace('$', '').replace(',', '.').trim();
  const num = parseFloat(cleanedValue);
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
      if (i < 6) { // Loguea los primeros 5 vinos para depuración
        const getRawValue = (propName: keyof Wine | null): string => {
          if (!propName) return "PROP_NO_MAPEADA";
          const colIndex = headers.findIndex(h => mapHeaderToWineProperty(h) === propName);
          return colIndex !== -1 ? (values[colIndex] || "VACIO_EN_CSV") : "COLUMNA_NO_ENCONTRADA_EN_HEADERS";
        };

        console.log(
          `[parseCSV] Vino: ${wine.nombre || "SIN_NOMBRE"} | ` +
          `enCarta: ${wine.enCarta} (crudo:'${getRawValue('enCarta')}') | ` +
          `Estilo: '${wine.estilo}' (crudo:'${getRawValue('estilo')}') | ` +
          `Tipo: '${wine.tipo}' (crudo:'${getRawValue('tipo')}') | ` +
          `Precio: ${wine.precio} (tipo: ${typeof wine.precio}, crudo:'${getRawValue('precio')}') | ` +
          `PrecioCopa: ${wine.precioCopa} (tipo: ${typeof wine.precioCopa}, crudo:'${getRawValue('precioCopa')}') | ` +
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
    // Mapeos principales
    "SKU_LAZZY": "idInterno",
    "NOMBRE_VINO_COMPLETO": "nombre",
    "BODEGA": "productor",
    "COSECHA": "ano",
    "ORDEN_VISUALIZACION_RESTAURANTE": "orden",
    "ALCOHOL": "alcohol",

    // --- CORRECCIONES BASADAS EN TUS LOGS Y CONFIRMACIONES ---
    "ENCARTA_RESTAURANTE1": "enCarta",
    // Para CATEGORIA_SOMMELIER, tu log mostró (Normalizada como: 'CATEGORÍA_SOMMELIER') cuando NO se mapeó.
    // Esto sugiere que la cabecera en tu CSV es "Categoría_Sommelier" (CON TILDE).
    // Si estás 100% seguro de que en tu CSV NO tiene tilde, quítala de la clave aquí.
    "CATEGORÍA_SOMMELIER": "estilo", // CLAVE CON TILDE (ajusta si tu CSV es diferente)
    "TIPOVINO": "tipo",

    // --- PRECIOS (TAL COMO ME LOS CONFIRMASTE) ---
    "PRECIO_BOTELLA_RESTAURANTE R1": "precio",
    "PRECIO R1 COPA": "precioCopa",

    // --- OTROS MAPEOS (VERIFICA SI LAS CABECERAS CSV SON CORRECTAS Y SI LOS QUIERES USAR) ---
    "PAIS_REGION_ORIGEN": "region",
    "VISTA": "vista",
    "NARIZ": "nariz",
    "BOCA": "boca",
    "OTROS": "otros",
    "ALTITUD": "altitud",

    // --- MAPEOS TENTATIVOS BASADOS EN TUS LOGS DE "NO MAPEADA" ---
    // Si quieres usar estas columnas, asegúrate que la propiedad exista en tu interface Wine
    // y que el nombre de la cabecera CSV (la clave aquí) sea exacto.
    "CEPA": "uva",
    // "ENÓLOGO": "enologo", // Si la cabecera CSV es "Enólogo" (con tilde)
    // "MARIDAJES": "maridaje", // Si la cabecera CSV es "Maridajes" (plural)

    // --- CABECERAS QUE TUS LOGS MOSTRARON COMO "NO MAPEADA" Y QUE NO ESTOY MAPEANDO AQUÍ ---
    // Si necesitas alguna de estas, añádela al mapa y a tu interface Wine:
    // 'Característica del Vino', 'Nombre' (si es diferente a Nombre_Vino_Completo),
    // 'Descripción', 'Región 1', 'Región 2', 'Región 3', 'Región 4',
    // 'Notas de Cata', 'Coordenadas', 'URL de Imagen de Botella',
    // 'Stock Total', 'Depo 1', 'Depo 2',
    // 'Precio Sugerido R2', 'Precio R2', 'Desvío R2',
    // 'Precio Sugerido R3', 'Precio R3', 'Desvío R3',
    // 'EnCarta_Restaurante2', 'EnCarta_Restaurante3'
  };

  const mappedKey = headerMap[normalizedHeader];
  if (!mappedKey && normalizedHeader !== "" && !normalizedHeader.startsWith("FIELD") && !normalizedHeader.includes("RESTAURANTE2") && !normalizedHeader.includes("RESTAURANTE3") && !normalizedHeader.includes("SUGERIDO R") && !normalizedHeader.includes("PRECIO R") && !normalizedHeader.includes("DESVÍO R") && !normalizedHeader.includes("DEPO")) {
    // Loguea solo si la cabecera no es una de las variantes de precio/stock para otros restaurantes
    console.warn(`[mapHeaderToWineProperty] ATENCIÓN: Cabecera CSV "${header}" (normalizada a "${normalizedHeader}") no tiene un mapeo definido en headerMap y podría ser relevante.`);
  }
  return mappedKey || null;
}
