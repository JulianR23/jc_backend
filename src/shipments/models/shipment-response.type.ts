import { Prisma } from '@prisma/client';

/**
 * Tipo de respuesta del envío con todas sus relaciones incluidas.
 * Se usa como tipo de retorno en ShipmentsService para dejar explícito qué datos se exponen en la API.
 */
export type ShipmentResponse = Prisma.ShipmentGetPayload<{
  include: {
    customer: true;
    products: { include: { product: true } };
    land: { include: { warehouse: true } };
    maritime: { include: { seaPort: true } };
  };
}>;
