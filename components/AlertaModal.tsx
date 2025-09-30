import React from 'react';
import { XIcon } from './icons';

interface AlertaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  type: 'eliminar' | 'validacion' | 'exito';
  title: string;
  message: string;
  camposFaltantes?: string[];
}

const AlertaModal: React.FC<AlertaModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  type, 
  title, 
  message, 
  camposFaltantes = [] 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 transform animate-[fadeIn_300ms_ease-out_forwards] border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800">
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              type === 'eliminar' 
                ? 'bg-red-100 dark:bg-red-900/20' 
                : type === 'exito'
                ? 'bg-green-100 dark:bg-green-900/20'
                : 'bg-amber-100 dark:bg-amber-900/20'
            }`}>
              <span className="text-lg">
                {type === 'eliminar' ? '⚠️' : type === 'exito' ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {message}
              </p>
              
              {camposFaltantes.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                    Campos requeridos:
                  </p>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 list-disc list-inside">
                    {camposFaltantes.map((campo, index) => (
                      <li key={index}>{campo}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {type === 'eliminar' && onConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
          )}
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              type === 'eliminar' 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                : type === 'exito'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {type === 'eliminar' ? 'Cancelar' : type === 'exito' ? 'Perfecto' : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertaModal;
