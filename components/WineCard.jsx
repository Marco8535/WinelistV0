// WineCard.jsx
import React from 'react';

// Este componente recibe un objeto 'wine' con los datos de un vino específico.
export default function WineCard({ wine }) {
  // Aseguramos que el precio se muestre con dos decimales.
  // Si Precio_Botella_Restaurante no es un número o es undefined, muestra un placeholder o maneja el error.
  const formatPrice = (price) => {
    const numberPrice = Number(price);
    if (isNaN(numberPrice)) {
      return '$ --.--'; // O alguna otra indicación de precio no disponible
    }
    return `$ ${numberPrice.toFixed(2)}`;
  };

  return (
    <div className="bg-[#FAFAFA] dark:bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-1">
          {/* Nombre del Vino */}
          {wine.Nombre_Vino_Completo || "Nombre no disponible"}
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-400 mb-1">
          {/* Bodega */}
          {wine.Bodega || "Bodega no disponible"}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-400 mb-1">
          {/* Cosecha */}
          {wine.Cosecha || "Cosecha no disponible"}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-500 mb-3">
          {/* País/Región Origen */}
          {wine.Pais_Region_Origen || "Origen no disponible"}
        </p>
        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
          {/* Precio */}
          {formatPrice(wine.Precio_Botella_Restaurante)}
        </p>
      </div>
    </div>
  );
}
