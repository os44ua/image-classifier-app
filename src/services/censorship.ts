import { CENSORED_WORDS } from '../utils/constants';
import logger from '../services/logger'; 

export class CensorshipError extends Error {
  public readonly censoredWords: string[];
  
  constructor(censoredWords: string[]) {
    super(`Contenido censurado detectado: ${censoredWords.join(', ')}`);
    this.name = 'CensorshipError';
    this.censoredWords = censoredWords;
  }
}

export function checkCensorship(text: string): void {
  logger.info('Verificando censura para texto', { text });
  
  const lowerText = text.toLowerCase();
  const foundCensoredWords = CENSORED_WORDS.filter(word => 
    lowerText.includes(word.toLowerCase())
  );

  if (foundCensoredWords.length > 0) {
    logger.warn('Palabras censuradas detectadas', { words: foundCensoredWords });
    throw new CensorshipError(foundCensoredWords);
  }
  
  logger.info('Verificación de censura completada - contenido aprobado');
}