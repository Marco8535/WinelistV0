/**
 * CSV Parser for Google Sheets wine data
 * Centralizes the CSV parsing logic used by both cron sync and manual sync endpoints
 */

// Función auxiliar para parsear líneas CSV con comas dentro de comillas
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuotes) {
      // Check for escaped quote
      if (i + 1 < line.length && line[i + 1] === quoteChar) {
        current += char;
        i++; // Skip next quote
      } else {
        inQuotes = false;
        quoteChar = '';
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

// Función principal para parsear CSV y convertir a objetos de vino
export function parseCSVToWines(csvText: string): any[] {
  try {
    console.log('[CSV_PARSER] Starting CSV parsing...');
    
    // Dividir por líneas y filtrar líneas vacías
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      console.log('[CSV_PARSER] CSV has less than 2 lines (header + data)');
      return [];
    }
    
    // Obtener headers (primera línea)
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('[CSV_PARSER] CSV Headers found:', headers.length, 'columns');
    console.log('[CSV_PARSER] First 10 headers:', headers.slice(0, 10));
    
    // Parsear cada línea de datos
    const wines = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      // Parsear línea CSV (manejar comas dentro de comillas)
      const values = parseCSVLine(line);
      
      if (values.length > 0 && values[0]) { // Al menos debe tener SKU
        const wine: any = {};
        
        // Mapear headers a valores usando índices conocidos o buscar por nombre
        headers.forEach((header, index) => {
          const value = values[index] ? values[index].replace(/"/g, '').trim() : '';
          
          // Mapear columnas del Google Sheet a campos de la base de datos
          switch (header) {
            case 'sku_lazzy':
              wine.id_interno = value;
              break;
            case 'Nombre':
            case 'Nombre_Vino_Completo':
              if (value && value !== '') wine.nombre = value;
              break;
            case 'Bodega':
              wine.productor = value;
              break;
            case 'TipoVino':
              wine.tipo = value;
              wine.estilo = value; // También mapeamos a estilo
              break;
            case 'Cepa':
              wine.uva = value;
              break;
            case 'Cosecha':
              wine.ano = value;
              break;
            case 'Enólogo':
              wine.enologo = value;
              break;
            case 'Región 1':
              wine.region = value;
              break;
            case 'Región 2':
              if (value && wine.region) {
                wine.region += `, ${value}`;
              } else if (value) {
                wine.region = value;
              }
              break;
            case 'Precio_Botella_Restaurante R1':
              if (value) {
                const cleanPrice = value.replace(/[$,"]/g, '');
                const numPrice = parseFloat(cleanPrice);
                if (!isNaN(numPrice)) wine.precio = numPrice;
              }
              break;
            case 'Precio R1 copa':
              if (value) {
                const cleanPrice = value.replace(/[$,"]/g, '');
                const numPrice = parseFloat(cleanPrice);
                if (!isNaN(numPrice)) wine.precio_copa = numPrice;
              }
              break;
            case 'Descripción':
              wine.vista = value;
              break;
            case 'Maridajes':
              wine.maridaje = value;
              break;
            case 'Notas de Cata':
              wine.boca = value;
              break;
            case 'Alcohol':
              wine.alcohol = value;
              break;
            case 'EnCarta_Restaurante1':
              wine.en_carta = value === 'TRUE' || value === 'true';
              break;
            case 'Orden_Visualizacion_Restaurante':
              const ordenNum = parseInt(value);
              if (!isNaN(ordenNum)) wine.orden = ordenNum;
              break;
            case 'Característica del Vino':
              wine.caracteristica = value;
              break;
            // Solo incluir campos que existen en la tabla wines
            // Ignorar campos como: coordenadas, stock_total, depo_1, etc.
          }
        });
        
        // Solo incluir vinos que tengan al menos ID interno o nombre
        if ((wine.id_interno && wine.id_interno.trim()) || (wine.nombre && wine.nombre.trim())) {
          // Asegurar valores por defecto
          wine.en_carta = wine.en_carta !== false; // Por defecto true si no se especifica
          wine.orden = wine.orden || 0;
          
          wines.push(wine);
        }
      }
    }
    
    console.log(`[CSV_PARSER] Successfully parsed ${wines.length} wines from CSV`);
    if (wines.length > 0) {
      console.log('[CSV_PARSER] Sample wine:', JSON.stringify(wines[0], null, 2));
    }
    return wines;
    
  } catch (error) {
    console.error('[CSV_PARSER] Error parsing CSV:', error);
    return [];
  }
}

// Función helper para obtener vinos desde Google Sheet
export async function fetchWinesFromSheet(sheetId: string): Promise<any[]> {
  const csvUrl = `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv`;
  try {
    console.log(`[CSV_PARSER] Fetching sheet: ${csvUrl}`);
    const response = await fetch(csvUrl, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`[CSV_PARSER] Error fetching sheet ${sheetId}. Status: ${response.status}`);
      return [];
    }
    const csvText = await response.text();
    console.log(`[CSV_PARSER] CSV Text for sheet ${sheetId} fetched, length: ${csvText.length}`);
    
    // Parsear CSV a objetos de vino
    const wines = parseCSVToWines(csvText);
    console.log(`[CSV_PARSER] Parsed ${wines.length} wines from sheet ${sheetId}`);
    
    return wines;
  } catch (error) {
    console.error(`[CSV_PARSER] Exception fetching sheet ${sheetId}:`, error);
    return [];
  }
} 