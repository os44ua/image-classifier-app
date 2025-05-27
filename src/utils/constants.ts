// Lista de palabras censuradas (ejemplo con "café")
export const CENSORED_WORDS = [
  'café',
  'coffee',
  'beer',
  'wine',
  'cigarette',
  'espresso',
  // Agregar más palabras según necesidades
];

// URL base de DeepL API
//export const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
export const DEEPL_API_URL = 'http://localhost:3001/translate';


// Configuración de la aplicación
export const APP_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  CLASSIFICATION_THRESHOLD: 0.1, // Mínima probabilidad para mostrar resultado
};