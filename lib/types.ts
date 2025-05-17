// Este es el archivo: lib/types.ts (o lib/types/wine.ts si lo pusiste en una subcarpeta)

// Esta es la "ficha técnica" para un solo vino.
// Le dice al programa qué información esperamos de cada vino.
export interface Wine {
  id: string; // Un identificador único que le damos nosotros al vino
  idInterno?: string; // El 'SKU_LAZZY' que viene de tu Google Sheet

  // Estas son las propiedades que usaremos para ordenar y mostrar
  nombre: string; // Para 'Nombre_Vino_Completo'
  productor?: string; // Para 'Bodega'
  ano?: string | number; // Para 'Cosecha' (puede ser 'N/V' como texto, o un año como número)
  estilo?: string; // Para 'Categoria_Sommelier'
  tipo?: string; // Para 'Tipo_Vino'
  precio?: number | null; // Para 'Precio_Botella_Restaurante' (puede ser un número o no tener nada)
  enCarta: boolean; // Para 'EnCarta_Restaurante_1' (verdadero o falso)
  orden?: number | null; // Para 'Orden_Visualizacion_Restaurante' (un número para ordenar o no tener nada)

  // Aquí puedes añadir más datos del vino que quieras usar después
  precioCopa?: number | null; // Para 'Precio R1 copa'
  region?: string; // Para 'Pais_Region_Origen'
  uva?: string; // Para 'Variedad'
  alcohol?: string;
  enologo?: string;
  vista?: string;
  nariz?: string;
  boca?: string;
  maridaje?: string;
  otros?: string;
  altitud?: string;
}

// Esta es la "ficha técnica" para una categoría de vinos.
// Dice que cada categoría tendrá un nombre y una lista de vinos (usando la ficha Wine de arriba).
export interface WineCategory {
  categoryName: string; // El nombre de la categoría (Ej: "Tintos", "Blancos")
  wines: Wine[]; // Una lista de vinos que pertenecen a esta categoría
}

// Esto es solo un nombre más corto para referirnos a una lista de WineCategory.
export type GroupedWineData = WineCategory[];
