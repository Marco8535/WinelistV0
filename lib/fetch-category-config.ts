// Archivo: lib/fetch-category-config.ts

// Definimos cómo se verá cada objeto de configuración de categoría
export interface CategoryConfig {
  categoryName: string; // Nombre de la categoría (debe coincidir con los generados)
  displayOrder: number; // El número de orden
}

// Mapeo de cabeceras del CSV de Configuración a las propiedades de CategoryConfig
function mapHeaderToConfigProperty(header: string): keyof CategoryConfig | null {
  const normalizedHeader = header.trim().toUpperCase();
  const headerMap: Record<string, keyof CategoryConfig> = {
    "NOMBRE_CATEGORIA_PARA_ORDEN": "categoryName", // Cabecera de tu CSV para el nombre
    "ORDEN_VISUALIZACION_CATEGORIA": "displayOrder", // Cabecera de tu CSV para el orden
  };
  return headerMap[normalizedHeader] || null;
}

// Parseador de CSV simple (similar al de fetch-wines)
function parseCategoryConfigCSV(csvText: string): CategoryConfig[] {
  const lines = csvText.split("\n");
  if (lines.length <= 1) {
    console.warn("[parseCategoryConfigCSV] El CSV de configuración de categorías está vacío o solo tiene encabezados.");
    return [];
  }

  const headers = lines[0].split(",").map((header) => header.trim());
  const configEntries: CategoryConfig[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(",").map(value => value.trim()); // Asumimos CSV simple sin comas en los valores
    const entry: any = {};

    headers.forEach((header, index) => {
      const rawValue = values[index] ? values[index].trim() : "";
      const key = mapHeaderToConfigProperty(header);

      if (key) {
        if (key === 'displayOrder') {
          const num = parseInt(rawValue, 10);
          entry[key] = isNaN(num) ? Infinity : num; // Si no es número, va al final
        } else {
          entry[key] = rawValue; // categoryName se queda como string
        }
      }
    });

    // Solo añadir si tenemos un nombre de categoría y un orden válido (o Infinity)
    if (entry.categoryName && typeof entry.displayOrder === 'number') {
      configEntries.push(entry as CategoryConfig);
    } else {
      // console.warn(`[parseCategoryConfigCSV] Entrada de configuración inválida o incompleta omitida:`, entry);
    }
  }
  return configEntries;
}

// Función principal para obtener la configuración de orden de categorías
export async function fetchCategoryConfig(): Promise<CategoryConfig[]> {
  try {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYJ_osaRfpE560QPeFdseyGCdyo0PQ10y0MutQYBaJXzk4b0oIs5twb1BliBePIANRiv0Qat_iftYF/pub?gid=1602638745&single=true&output=csv";
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Falló la carga de configuración de categorías: ${response.status}`);
    }
    const csvText = await response.text();
    const config = parseCategoryConfigCSV(csvText);
    console.log(`[fetchCategoryConfig] Configuración de orden de categorías cargada: ${config.length} entradas.`);
    return config;
  } catch (error) {
    console.error("Error crítico en fetchCategoryConfig:", error);
    return []; // Devolver array vacío en caso de error para no romper el flujo
  }
}
