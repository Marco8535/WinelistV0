// Archivo: lib/fetch-wines.ts

import type { Wine } from "@/types/wine"; // Asegúrate que la ruta sea correcta

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
    // console.log(`[fetchWines] Vinos parseados del CSV en total: ${wines.length}`);
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

  // console.log("----------------------------------------------------");
  // console.log("[parseCSV] CABECERAS DETECTADAS EN EL CSV Y SU MAPEO (fetch-wines):");
  // headers.forEach(h => {
  //   const mappedKey = mapHeaderToWineProperty(h);
  //   console.log(`  -> Cabecera CSV: "${h}"   --- Mapeada a --->   "${mappedKey || "NO MAPEADA"}"`);
  // });
  // console.log("----------------------------------------------------");

  const wines: Wine[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const wine: any = { id: `wine-${Date.now()}-${i}-${Math.random().toString(36).substring(7)}` };

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

    if (wine.nombre && wine.nombre.trim() !== "") {
      // Loguear los primeros vinos para depuración
      if (wines.length < 5) { // Loguea solo los primeros 5 que se AÑADEN a la lista de vinos
        const getRawVal = (prop: keyof Wine | null): string => {
            if (!prop) return "PROP_NO_MAPEADA";
            const colIdx = headers.findIndex(h => mapHeaderToWineProperty(h) === prop);
            return colIdx !== -1 ? (values[colIdx]?.trim() || "VACIO_EN_CSV") : "COL_NO_ENC_EN_HDR_MAP";
        };
        console.log(
            `[parseCSV] Vino Leído: ${wine.nombre} | ` +
            `SKU: '${wine.idInterno}' (crudo:'${getRawVal('idInterno')}') | ` +
            `enCarta: ${wine.enCarta} (crudo:'${getRawVal('enCarta')}') | ` +
            `Estilo (Cat.Somm): '${wine.estilo}' (crudo:'${getRawVal('estilo')}') | ` +
            `Tipo: '${wine.tipo}' (crudo:'${getRawVal('tipo')}') | ` +
            `Precio: ${wine.precio} (crudo:'${getRawVal('precio')}') | ` +
            `PrecioCopa: ${wine.precioCopa} (crudo:'${getRawVal('precioCopa')}') | ` +
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
    "SKU_LAZZY": "idInterno",
    "NOMBRE_VINO_COMPLETO": "nombre",
    "BODEGA": "productor",
    "COSECHA": "ano",
    "ORDEN_VISUALIZACION_RESTAURANTE": "orden",
    "ALCOHOL": "alcohol",
    "ENCARTA_RESTAURANTE1": "enCarta",
    // --- CORRECCIÓN CRÍTICA AQUÍ BASADA EN TU CSV ---
    "CATEGORIA_SOMMELIER": "estilo",  // Tu CSV tiene "Categoria_Sommelier" (SIN TILDE)
    // -------------------------------------------------
    "TIPOVINO": "tipo",
    "PRECIO_BOTELLA_RESTAURANTE R1": "precio",
    "PRECIO R1 COPA": "precioCopa",
    "PAIS_REGION_ORIGEN": "region",
    "CEPA": "uva",
    "ENÓLOGO": "enologo",             // CSV tiene "Enólogo" (CON TILDE) -> Clave CON TILDE
    "MARIDAJES": "maridaje",          // CSV tiene "Maridajes" (plural) -> Clave Plural
    "VISTA": "vista",
    "NARIZ": "nariz",
    "BOCA": "boca",
    "OTROS": "otros",
    "ALTITUD": "altitud",
  };

  const mappedKey = headerMap[normalizedHeader];
  // if (!mappedKey && normalizedHeader !== "" && !normalizedHeader.startsWith("FIELD")) {
  //   console.warn(`[mapHeaderToWineProperty] ATENCIÓN: Cabecera CSV "${header}" (norm:"${normalizedHeader}") no tiene mapeo.`);
  // }
  return mappedKey || null;
}
