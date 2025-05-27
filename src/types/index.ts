// Результат классификации
export interface ClassificationResult {
  className: string;
  probability: number;
  translatedName?: string;
}

// Ответ от DeepL API
export interface DeepLResponse {
  translations: Array<{
    detected_source_language: string;
    text: string;
  }>;
}
