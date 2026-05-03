/**
 * Tipo de respuesta para las operaciones de autenticación.
 * Contiene el token JWT y los datos básicos del usuario.
 */
export type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

/**
 * Payload que se almacena dentro del token JWT.
 * Es lo que retorna JwtStrategy.validate() y queda disponible
 * en el request como req.user.
 */
export type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
};
