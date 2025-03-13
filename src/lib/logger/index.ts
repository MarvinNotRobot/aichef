// Browser-compatible logger with enhanced context tracking
class Logger {
  private getCallerInfo(): { file: string; component: string; function: string } {
    try {
      const error = new Error();
      const stackLines = error.stack?.split('\n') || [];
      
      // Find the relevant caller line (skip internal logger calls)
      let callerLine = '';
      for (let i = 0; i < stackLines.length; i++) {
        if (!stackLines[i].includes('logger/index.ts') && !stackLines[i].includes('at new Error')) {
          callerLine = stackLines[i];
          break;
        }
      }

      // Extract file path
      const fileMatch = callerLine.match(/\((.+?)\)/);
      let file = 'unknown';
      if (fileMatch) {
        const fullPath = fileMatch[1].split('/src/')[1];
        file = fullPath ? fullPath.replace(/\?.+$/, '') : 'unknown';
      } else {
        const atMatch = callerLine.match(/at\s+(.+?)$/);
        if (atMatch) {
          file = atMatch[1].split(' ')[0];
        }
      }

      // Extract component and function names
      let component = 'unknown';
      let functionName = 'unknown';

      // Try to extract from format: "at Component.functionName"
      const methodMatch = callerLine.match(/at\s+([^.]+)\.([^(\s]+)/);
      if (methodMatch) {
        component = methodMatch[1];
        functionName = methodMatch[2];
      } else {
        // Try to extract from format: "at functionName"
        const funcMatch = callerLine.match(/at\s+([^(\s]+)/);
        if (funcMatch) {
          functionName = funcMatch[1];
          // If it's a class/component method, try to extract the class name
          const classMatch = callerLine.match(/\(([^/]+)\)/);
          if (classMatch) {
            component = classMatch[1].split('.')[0];
          }
        }
      }

      return {
        file,
        component,
        function: functionName
      };
    } catch (error) {
      console.error('Error parsing stack trace:', error);
      return {
        file: 'unknown',
        component: 'unknown',
        function: 'unknown'
      };
    }
  }

  private log(level: LogLevel, message: string, meta: Record<string, unknown> = {}) {
    const timestamp = new Date().toISOString();
    const caller = this.getCallerInfo();
    const context = {
      timestamp,
      level,
      location: {
        file: caller.file,
        component: caller.component,
        function: caller.function
      },
      ...meta
    };

    switch (level) {
      case 'error':
        console.error(message, context);
        break;
      case 'warn':
        console.warn(message, context);
        break;
      case 'info':
        console.info(message, context);
        break;
      case 'debug':
        console.debug(message, context);
        break;
    }
  }

  error(message: string, meta: Record<string, unknown> = {}) {
    this.log('error', message, meta);
  }

  warn(message: string, meta: Record<string, unknown> = {}) {
    this.log('warn', message, meta);
  }

  info(message: string, meta: Record<string, unknown> = {}) {
    this.log('info', message, meta);
  }

  debug(message: string, meta: Record<string, unknown> = {}) {
    this.log('debug', message, meta);
  }
}

export const appLogger = new Logger();

export const LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

export interface ILogger {
  error(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}