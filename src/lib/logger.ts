type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function formatEntry(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
}

function write(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry = formatEntry(level, message, meta);

  if (process.env.NODE_ENV === "production") {
    // Structured JSON for Vercel log ingestion
    const output = JSON.stringify(entry);
    if (level === "error") {
      if (process.stderr?.write) {
        process.stderr.write(output + "\n");
      } else {
        console.error(output);
      }
    } else {
      if (process.stdout?.write) {
        process.stdout.write(output + "\n");
      } else {
        console.log(output);
      }
    }
  } else {
    // Human-readable in development
    const prefix = `[${level.toUpperCase()}]`;
    if (level === "error") {
      console.error(prefix, message, meta ?? "");
    } else if (level === "warn") {
      console.warn(prefix, message, meta ?? "");
    } else {
      console.log(prefix, message, meta ?? "");
    }
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => write("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write("error", message, meta),
};
