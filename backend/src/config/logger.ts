import winston from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Formato customizado para logs
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;

  // Adiciona metadata extra se existir
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }

  return msg;
});

// Criar diretório de logs se não existir
const logsDir = path.resolve(process.cwd(), 'logs');

// Configuração do logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }), // Captura stack traces
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  defaultMeta: {
    service: 'saborconnect-api',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Logs de erro em arquivo separado
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Todos os logs em arquivo combined
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Em desenvolvimento, também loga no console com cores
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat),
    })
  );
}

// Helper functions para logs estruturados
export const logInfo = (message: string, meta?: Record<string, unknown>) => {
  logger.info(message, meta);
};

export const logError = (
  message: string,
  error?: Error | unknown,
  meta?: Record<string, unknown>
) => {
  if (error instanceof Error) {
    logger.error(message, {
      ...meta,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
    });
  } else {
    logger.error(message, { ...meta, error });
  }
};

export const logWarn = (message: string, meta?: Record<string, unknown>) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: Record<string, unknown>) => {
  logger.debug(message, meta);
};

// Log de requisições HTTP
export const logRequest = (
  req: { method: string; url: string; ip?: string },
  duration?: number
) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    duration: duration ? `${duration}ms` : undefined,
  });
};

// Log de autenticação
export const logAuth = (
  action: string,
  userId?: string,
  success: boolean = true,
  meta?: Record<string, unknown>
) => {
  logger.info('Authentication', {
    action,
    userId,
    success,
    ...meta,
  });
};

// Log de operações do banco
export const logDatabase = (
  operation: string,
  table: string,
  duration?: number,
  meta?: Record<string, unknown>
) => {
  logger.debug('Database Operation', {
    operation,
    table,
    duration: duration ? `${duration}ms` : undefined,
    ...meta,
  });
};

export default logger;
