import logger from './logger'

type WriteFunction = {
  (buffer: string | Uint8Array, cb?: (err?: Error) => void): boolean;
  (str: string | Uint8Array, encoding?: BufferEncoding, cb?: (err?: Error) => void): boolean;
};

/**
 * Logger for stdio input and output
 * @param logFilePath - Path to the log file (unused, kept for backward compatibility)
 * @returns A function to stop logging
 */
export function createStdioLogger(logFilePath: string): () => void {
  // Store original stdio
  const originalStdoutWrite = process.stdout.write.bind(process.stdout)
  const originalStderrWrite = process.stderr.write.bind(process.stderr)

  // Create new write functions
  const newStdoutWrite: WriteFunction = function(str: string | Uint8Array, encoding?: BufferEncoding | ((err?: Error) => void), cb?: (err?: Error) => void): boolean {
    logger.info(`[STDOUT] ${str}`)
    if (typeof encoding === 'function') {
      return originalStdoutWrite(str, encoding)
    }
    return originalStdoutWrite(str, encoding, cb)
  }

  const newStderrWrite: WriteFunction = function(str: string | Uint8Array, encoding?: BufferEncoding | ((err?: Error) => void), cb?: (err?: Error) => void): boolean {
    logger.error(`[STDERR] ${str}`)
    if (typeof encoding === 'function') {
      return originalStderrWrite(str, encoding)
    }
    return originalStderrWrite(str, encoding, cb)
  }

  // Override stdio
  process.stdout.write = newStdoutWrite
  process.stderr.write = newStderrWrite

  // Add stdin listener
  process.stdin.on('data', (data) => {
    logger.info(`[STDIN] ${data}`)
  })

  // Return cleanup function
  return () => {
    process.stdout.write = originalStdoutWrite
    process.stderr.write = originalStderrWrite
    process.stdin.removeAllListeners('data')
  }
}
