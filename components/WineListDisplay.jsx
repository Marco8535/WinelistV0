// WineListDisplay.jsx
import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import WineCard from './WineCard'; // Importamos el componente WineCard

// URL de tu Google Sheet publicado como CSV
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSYJ_osaRfpE560QPeFdseyGCdyo0PQ10y0MutQYBaJXzk4b0oIs5twb1BliBePIANRiv0Qat_iftYF/pub?gid=0&single=true&output=csv';

export default function WineListDisplay() {
  // Estado para almacenar los vinos agrupados por categoría
  const [groupedWines, setGroupedWines] = useState({});
  // Estado para manejar la carga
  const [loading, setLoading] = useState(true);
  // Estado para manejar errores
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndProcessWines = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(GOOGLE_SHEET_CSV_URL);
        if (!response.ok) {
          throw new Error(`Error al obtener el CSV: ${response.status} ${response.statusText}`);
        }
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true, // Usa la primera fila como nombres de columna
          skipEmptyLines: true,
          dynamicTyping: true, // Intenta convertir tipos automáticamente (números, booleanos)
          transformHeader: header => header.trim(), // Limpia espacios en los encabezados
          complete: (results) => {
            if (results.errors.length > 0) {
              console.error("Errores de parseo:", results.errors);
              // Tomamos solo el primer error para mostrar un mensaje simple
              throw new Error(`Error al parsear el CSV: ${results.errors[0].message}`);
            }
            
            let data = results.data;

            // 1. Filtrar vinos que están en la carta del Restaurante 1
            // Asegurarse de que la comparación de EnCarta_Restaurante_1 sea robusta
            const filteredWines = data.filter(wine => {
                const enCartaValue = wine.EnCarta_Restaurante_1;
                if (typeof enCartaValue === 'string') {
                    return enCartaValue.toLowerCase() === 'true';
                }
                return Boolean(enCartaValue); // Para cuando dynamicTyping lo convierte a booleano
            });


            // 2. Agrupar vinos por Categoria_Sommelier (o Tipo_Vino como fallback)
            const winesByCat = filteredWines.reduce((acc, wine) => {
              const category = wine.Categoria_Sommelier || wine.Tipo_Vino || 'Otros Vinos';
              if (!acc[category]) {
                acc[category] = [];
              }
              acc[category].push(wine);
              return acc;
            }, {});

            // 3. Ordenar vinos dentro de cada categoría
            for (const category in winesByCat) {
              winesByCat[category].sort((a, b) => {
                // Criterio 1: Orden_Visualizacion_Restaurante (ascendente, números más bajos primero)
                const ordenA = a.Orden_Visualizacion_Restaurante;
                const ordenB = b.Orden_Visualizacion_Restaurante;

                if (ordenA !== null && ordenA !== undefined && ordenB !== null && ordenB !== undefined && ordenA !== ordenB) {
                  return ordenA - ordenB;
                }
                if (ordenA !== null && ordenA !== undefined && (ordenB === null || ordenB === undefined)) return -1; // a tiene orden, b no
                if ((ordenA === null || ordenA === undefined) && ordenB !== null && ordenB !== undefined) return 1;  // b tiene orden, a no

                // Criterio 2: Para "mismo vino" (mismo Nombre_Vino_Completo y Bodega), por Cosecha
                // "N/V" se considera más reciente que cualquier año. Entre años, el más viejo primero (ascendente).
                if (a.Nombre_Vino_Completo === b.Nombre_Vino_Completo && a.Bodega === b.Bodega) {
                  const cosechaA = String(a.Cosecha);
                  const cosechaB = String(b.Cosecha);

                  if (cosechaA === 'N/V' && cosechaB !== 'N/V') return 1; // N/V va después de los años
                  if (cosechaA !== 'N/V' && cosechaB === 'N/V') return -1; // N/V va después de los años
                  if (cosechaA === 'N/V' && cosechaB === 'N/V') return 0; // Ambos N/V, sin cambio de orden por cosecha

                  // Ambos son años, ordenar numéricamente ascendente (más viejo primero)
                  return parseInt(cosechaA, 10) - parseInt(cosechaB, 10);
                }

                // Criterio 3: Alfabéticamente por Nombre_Vino_Completo (ascendente)
                return (a.Nombre_Vino_Completo || '').localeCompare(b.Nombre_Vino_Completo || '');
              });
            }
            setGroupedWines(winesByCat);
          },
          error: (parseError) => {
            console.error("Error en PapaParse:", parseError);
            setError(`Error al procesar los datos del vino: ${parseError.message}`);
          }
        });
      } catch (e) {
        console.error("Error al obtener o procesar vinos:", e);
        setError(e.message || "Ocurrió un error desconocido.");
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessWines();
  }, []); // El array vacío [] significa que este efecto se ejecuta solo una vez, después del primer renderizado

  if (loading) {
    return <div className="text-center p-10">Cargando carta de vinos...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">Error: {error}</div>;
  }

  if (Object.keys(groupedWines).length === 0) {
    return <div className="text-center p-10">No hay vinos disponibles en la carta en este momento.</div>;
  }

  // Obtenemos las claves de las categorías y las ordenamos alfabéticamente para una presentación consistente
  const sortedCategories = Object.keys(groupedWines).sort((a, b) => a.localeCompare(b));

  return (
    <div className="bg-white dark:bg-gray-950 p-6 md:p-10 font-sans">
      {sortedCategories.map((categoryName) => (
        <section key={categoryName} className="mb-12">
          <h2 className="text-3xl font-bold text-[#003366] dark:text-blue-400 mb-6">
            {categoryName}
          </h2>
          <div className="grid grid-cols-1 gap-8">
            {groupedWines[categoryName].map((wine, index) => (
              // Usamos SKU_LAZZY o una combinación como key, asegurando que sea única.
              <WineCard key={wine.SKU_LAZZY || `${categoryName}-wine-${index}`} wine={wine} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
