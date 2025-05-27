import type { DeepLResponse } from '../types';
import { DEEPL_API_URL } from '../utils/constants';
import logger from '../services/logger'; 


//const DEEPL_API_KEY = '7d1dd463-a2aa-47af-99c9-145172547b3c:fx'; 
const DEEPL_API_KEY = import.meta.env.VITE_DEEPL_API_KEY;


export async function translateText(
  text: string, 
  targetLang: string = 'ES'
): Promise<string> {
  logger.info('Iniciando traducción', { text, targetLang });

  if (!DEEPL_API_KEY) {
    logger.warn('API Key de DeepL no configurada, usando traducción simulada');
    // Simulación para desarrollo
    return `(${targetLang}) ${text}`;
  }

  try {
     logger.info('antes de entrar en fetch, DEEPL_API_URL=', `${DEEPL_API_URL}`);

    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: text,
        target_lang: targetLang,
      }),
    });

    logger.info('despues de fetch, DEEPL_API_URL=', ` ${DEEPL_API_URL}`);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    const data: DeepLResponse = await response.json();
    const translatedText = data.translations[0]?.text || text;
    
    logger.info('Traducción completada exitosamente', { 
      original: text, 
      translated: translatedText 
    });
    
    return translatedText;
  } catch (error) {
    logger.error('Error en traducción', error);
    
    // En caso de error, retornar texto original
    logger.warn('Retornando texto original debido a error en traducción');
    return text;
  }
}