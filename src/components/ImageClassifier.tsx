import React, { useState, useEffect, useRef } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs-backend-webgl';
import type { ClassificationResult } from '../types';
import { translateText } from '../services/deepl';
import { checkCensorship, CensorshipError } from '../services/censorship';
import logger from '../services/logger';
import { LoadingSpinner } from './LoadingSpinner';
import { APP_CONFIG } from '../utils/constants';
import './ImageClassifier.css';

export const ImageClassifier: React.FC = () => {
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [predictions, setPredictions] = useState<ClassificationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const imageRef = useRef<HTMLImageElement>(null);


  // cargamos el modelo MobileNet
  const loadModel = async () => {
    try {
      setIsModelLoading(true);
      logger.info('Iniciando carga del modelo MobileNet...');
      
      const loadedModel = await mobilenet.load();
      setModel(loadedModel);
      
      logger.info('Modelo MobileNet cargado exitosamente');
    } catch (error) {
      const errorMsg = 'Error cargando el modelo MobileNet';
      logger.error(errorMsg, error);
      setError(errorMsg);
    } finally {
      setIsModelLoading(false);
    }
  };

  useEffect(() => {
    loadModel();
  }, []);


  // cargamos el imagen
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      if (!APP_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        const errorMsg = 'Tipo de archivo no permitido. Use JPG, PNG o GIF.';
        logger.warn(errorMsg, { fileType: file.type });
        setError(errorMsg);
        return;
      }

      if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
        const errorMsg = 'Archivo demasiado grande. Máximo 10MB.';
        logger.warn(errorMsg, { fileSize: file.size });
        setError(errorMsg);
        return;
      }

      setSelectedFile(file);
      setError('');
      
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
      setPredictions([]);
      
      logger.info('Archivo seleccionado correctamente', { 
        fileName: file.name, 
        fileSize: file.size,
        fileType: file.type 
      });
    }
  };

  const classifyAndTranslate = async () => {
    if (!model) {
      const errorMsg = 'El modelo aún no se ha cargado. Espera un momento e inténtalo de nuevo.';
      logger.warn(errorMsg);
      setError(errorMsg);
      return;
    }

    if (!imageRef.current) {
      const errorMsg = 'No se encontró la referencia a la imagen.';
      logger.error(errorMsg);
      setError(errorMsg);
      return;
    }

    setIsLoading(true);
    setError('');
    logger.info('Iniciando proceso de clasificación y traducción');

    try {
      logger.info('Clasificando imagen con MobileNet...');
      const results = await model.classify(imageRef.current);
      logger.info('Clasificación completada', { resultsCount: results.length });

      const filteredResults = results.filter(
        result => result.probability >= APP_CONFIG.CLASSIFICATION_THRESHOLD
      );

      logger.info('Resultados filtrados por threshold', { 
        originalCount: results.length,
        filteredCount: filteredResults.length 
      });

      for (const result of filteredResults) {
        try {
          checkCensorship(result.className);
        } catch (censorshipError) {
          if (censorshipError instanceof CensorshipError) {
            throw new Error(
              `Contenido censurado detectado. Palabras prohibidas encontradas: ${censorshipError.censoredWords.join(', ')}`
            );
          }
          throw censorshipError;
        }
      }

      logger.info('Iniciando traducción en paralelo de resultados...');
      
      const translatedResults: ClassificationResult[] = await Promise.all(
        filteredResults.map(async (item) => {
          try {
            const translatedName = await translateText(item.className, 'ES');
            return { ...item, translatedName };
          } catch (translationError) {
            logger.warn('Error traduciendo item individual', {
              className: item.className,
              error: translationError
            });
            return { ...item, translatedName: item.className };
          }
        })
      );

      setPredictions(translatedResults);
      logger.info('Proceso completo finalizado exitosamente', { 
        resultsCount: translatedResults.length 
      });

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error en proceso de clasificación/traducción', error);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setPredictions([]);
    setError('');
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    logger.info('Selección limpiada');
  };

  return (
    <div className="image-classifier">
      <h1 className="image-classifier__title">
        Clasificador de Imágenes + Traducción (Chaining)
      </h1>
      <p className="image-classifier__subtitle">
        Selecciona una imagen para que el modelo intente clasificarla y luego traduzca el resultado.
      </p>

      {isModelLoading && (
        <div className="loading-model">
          <LoadingSpinner message="Cargando modelo MobileNet..." />
        </div>
      )}

      {!isModelLoading && (
        <>
          <div className="file-input-section">
            <div className="file-input-wrapper">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
              />
              {selectedFile && (
                <button onClick={clearSelection} className="clear-button">
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="error-message fade-in">
               {error}
            </div>
          )}

          {previewUrl && (
            <div className="image-preview-section fade-in">
              <h3 className="image-preview-title">Vista previa:</h3>
              <img
                ref={imageRef}
                src={previewUrl}
                alt="Vista previa"
                className="image-preview"
              />
            </div>
          )}

          {selectedFile && !isLoading && (
            <button onClick={classifyAndTranslate} className="classify-button fade-in">
              Clasificar y traducir
            </button>
          )}

          {isLoading && (
            <LoadingSpinner message="Clasificando imagen y traduciendo resultados..." />
          )}

          {predictions.length > 0 && (
            <div className="results-section fade-in">
              <h2 className="results-title"> Resultados:</h2>
              <ul className="results-list">
                {predictions.map((item, index) => (
                  <li key={index} className="result-item">
                    <div className="result-row">
                      <span className="result-label">Original:</span>
                      <span className="result-original">{item.className}</span>
                    </div>
                    <div className="result-row">
                      <span className="result-label">Traducción:</span>
                      <span className="result-translation">
                        {item.translatedName || 'N/A'}
                      </span>
                    </div>
                    <div className="result-row">
                      <span className="result-label">Prob:</span>
                      <span className="result-probability">
                        {(item.probability * 100).toFixed(2)}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};