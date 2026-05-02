/**
 * Constantes de reglas de negocio para envíos.
 *
 * Logística terrestre — descuento 5% si totalUnits > 10
 * Logística marítima  — descuento 3% si totalUnits > 10
 */

export const DISCOUNT_THRESHOLD = 10;

export const LAND_DISCOUNT_RATE = 0.05;

export const MARITIME_DISCOUNT_RATE = 0.03;

/**
 * Umbral para procesamiento en background con BullMQ.
 * Si totalUnits supera este valor, el envío se encola
 * en lugar de procesarse sincrónicamente.
 */
export const BULK_PROCESSING_THRESHOLD = 100;
