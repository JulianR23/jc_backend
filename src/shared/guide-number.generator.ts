/**
 * Utilidad para generar números de guía secuenciales automáticamente.
 * Formato: AA00000000 (2 letras + 8 dígitos)
 * Comienza en AA00000000 e incrementa de uno en uno.
 */

const INITIAL_GUIDE = 'AA00000000';

/**
 * Extrae el número secuencial de un trackingNumber
 * @param trackingNumber - Número de guía en formato AA00000000
 * @returns Número secuencial (0-99999999)
 */
export const parseTrackingNumber = (trackingNumber: string): number => {
  if (!trackingNumber || trackingNumber.length !== 10) return -1;
  const sequential = parseInt(trackingNumber.substring(2), 10);
  return isNaN(sequential) ? -1 : sequential;
};

/**
 * Convierte un número secuencial a un trackingNumber
 * @param sequential - Número secuencial (0-99999999)
 * @returns Número de guía en formato AA00000000
 */
export const sequentialToTrackingNumber = (sequential: number): string => {
  if (sequential < 0 || sequential > 99999999) {
    throw new Error('Sequential number must be between 0 and 99999999');
  }
  const paddedNumber = String(sequential).padStart(8, '0');
  return `AA${paddedNumber}`;
};

/**
 * Genera el siguiente número de guía basado en un número actual
 * @param lastTrackingNumber - Último número de guía usado (opcional)
 * @returns Siguiente número de guía
 */
export const generateNextTrackingNumber = (
  lastTrackingNumber?: string,
): string => {
  if (!lastTrackingNumber) {
    return INITIAL_GUIDE;
  }

  const sequential = parseTrackingNumber(lastTrackingNumber);
  if (sequential === -1) {
    return INITIAL_GUIDE;
  }

  return sequentialToTrackingNumber(sequential + 1);
};

/**
 * Genera el siguiente número de guía basado en una lista de números existentes
 * @param existingTrackingNumbers - Array de números de guía existentes
 * @returns Siguiente número de guía
 */
export const getNextTrackingNumber = (
  existingTrackingNumbers: string[],
): string => {
  if (!existingTrackingNumbers || existingTrackingNumbers.length === 0) {
    return INITIAL_GUIDE;
  }

  // Encontrar el número máximo válido
  const validSequentials = existingTrackingNumbers
    .map(parseTrackingNumber)
    .filter((num) => num >= 0);

  if (validSequentials.length === 0) {
    return INITIAL_GUIDE;
  }

  const maxSequential = Math.max(...validSequentials);
  return sequentialToTrackingNumber(maxSequential + 1);
};
