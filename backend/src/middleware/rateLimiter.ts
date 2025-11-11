import rateLimit from 'express-rate-limit';

// Rate limiter geral para toda a API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: {
    success: false,
    error: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiter mais restritivo para autenticação
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas de login por IP
  skipSuccessfulRequests: true, // Não conta requests bem-sucedidos
  message: {
    success: false,
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para criação de recursos
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 criações por hora
  message: {
    success: false,
    error: 'Muitas criações em pouco tempo. Tente novamente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para uploads
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 uploads por hora
  message: {
    success: false,
    error: 'Muitos uploads em pouco tempo. Tente novamente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
