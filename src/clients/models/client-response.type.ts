/**
 * Tipo de respuesta para el cliente.
 * Se usa como tipo de retorno en el servicio para dejar
 * explícito qué campos se exponen en la API.
 */
export type ClientResponse = {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  createdAt: Date;
  updatedAt: Date;
};
