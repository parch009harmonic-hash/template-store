type LogLevel = "info" | "warn" | "error";

interface LogMeta {
  [key: string]: unknown;
}

function writeLog(level: LogLevel, message: string, meta?: LogMeta) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ?? {})
  };

  const serialized = JSON.stringify(payload);
  if (level === "error") {
    console.error(serialized);
    return;
  }
  if (level === "warn") {
    console.warn(serialized);
    return;
  }
  console.info(serialized);
}

export function getRequestId(request: Request) {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    writeLog("info", message, meta);
  },
  warn(message: string, meta?: LogMeta) {
    writeLog("warn", message, meta);
  },
  error(message: string, meta?: LogMeta) {
    writeLog("error", message, meta);
  }
};
