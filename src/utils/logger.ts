import winston from 'winston';
import path from 'path';
import fs from 'fs';
import 'winston-daily-rotate-file';
import os from 'os';
import archiver from 'archiver';

// Get platform-specific app data directory
function getAppDataDir(): string {
  const platform = process.platform;
  const appName = 'rednote-mcp';

  switch (platform) {
    case 'win32':
      // Windows: %APPDATA%\rednote-mcp\logs
      return path.join(process.env.APPDATA || '', appName, 'logs');
    case 'darwin':
      // macOS: ~/Library/Application Support/rednote-mcp/logs
      return path.join(os.homedir(), 'Library', 'Application Support', appName, 'logs');
    case 'linux':
      // Linux: ~/.local/share/rednote-mcp/logs
      return path.join(os.homedir(), '.local', 'share', appName, 'logs');
    default:
      // Fallback to current directory if platform is not recognized
      return path.join(process.cwd(), 'logs');
  }
}

// Constants for log management
export const LOGS_DIR = getAppDataDir();
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_LOG_FILES = 5; // Keep last 5 log files

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.DailyRotateFile({
      filename: path.join(LOGS_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: MAX_LOG_SIZE,
      maxFiles: MAX_LOG_FILES,
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.DailyRotateFile({
      filename: path.join(LOGS_DIR, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: MAX_LOG_SIZE,
      maxFiles: MAX_LOG_FILES,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

// Add a stream for Morgan (if needed in the future)
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

// Function to pack logs into a zip file
export async function packLogs(): Promise<string> {
  const output = fs.createWriteStream(path.join(process.cwd(), 'rednote-logs.zip'));
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level
  });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      resolve(path.join(process.cwd(), 'rednote-logs.zip'));
    });

    archive.on('error', (err: Error) => {
      reject(err);
    });

    archive.pipe(output);

    // Add all log files to the archive
    if (fs.existsSync(LOGS_DIR)) {
      archive.directory(LOGS_DIR, 'logs');
    }

    archive.finalize();
  });
}

export default logger;
