type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private levels: LogLevel[];
  private currentLevel: LogLevel;

  constructor() {
    this.levels = ["debug", "info", "warn", "error"];
    this.currentLevel = "debug";
  }

  setLevel(level: LogLevel): void {
    if (this.levels.includes(level)) {
      this.currentLevel = level;
    } else {
      console.error(`Nivel de log no válido: ${level}`);
    }
  }

  private log(level: LogLevel, message: string, details?: any): void {
    const levelIndex = this.levels.indexOf(level);
    const currentLevelIndex = this.levels.indexOf(this.currentLevel);
    
    if (levelIndex >= currentLevelIndex) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${level.toUpperCase()}][${timestamp}]: ${message}`;
      
      // Usar el método de console apropiado
      if (level === 'debug') {
        console.debug(logMessage, details || '');
      } else if (level === 'info') {
        console.info(logMessage, details || '');
      } else if (level === 'warn') {
        console.warn(logMessage, details || '');
      } else if (level === 'error') {
        console.error(logMessage, details || '');
      }
    }
  }

  debug(message: string, details?: any): void {
    this.log("debug", message, details);
  }

  info(message: string, details?: any): void {
    this.log("info", message, details);
  }

  warn(message: string, details?: any): void {
    this.log("warn", message, details);
  }

  error(message: string, details?: any): void {
    this.log("error", message, details);
  }
}

export default new Logger();

