import React from 'react';
import { Event_Speaker } from '../types/Event_Speaker';

interface SpeakerPreviewProps {
    speaker: Event_Speaker | null;
    previewData: {
        name: string;
        position: string;
        linkedin: string;
        photoFile: File | null;
        companyLogoFile: File | null;
    };
    onAddAnother: () => void;
}

const SpeakerPreview: React.FC<SpeakerPreviewProps> = ({ speaker, previewData, onAddAnother }) => {
    // Si hay un speaker creado, mostrarlo; si no, mostrar la vista previa en tiempo real
    const displayData = speaker || {
        name: previewData.name || 'Nombre del Speaker',
        position: previewData.position || 'Posición',
        linkedin: previewData.linkedin || '',
        photo: previewData.photoFile ? URL.createObjectURL(previewData.photoFile) : '',
        company: previewData.companyLogoFile ? URL.createObjectURL(previewData.companyLogoFile) : ''
    };

    const formatLinkedInUrl = (url: string): string => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `https://${url}`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                {speaker ? 'Speaker Creado' : 'Vista Previa'}
            </h2>
            
            <div className="space-y-6">
                {/* Foto del Speaker */}
                {displayData.photo && (
                    <div className="text-center">
                        <img
                            src={displayData.photo}
                            alt={displayData.name}
                            className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-200 dark:border-gray-600"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Placeholder para la foto si no hay imagen */}
                {!displayData.photo && (
                    <div className="text-center">
                        <div className="w-32 h-32 rounded-full mx-auto bg-gray-100 dark:bg-gray-700 border-4 border-gray-200 dark:border-gray-600 flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Información del Speaker */}
                <div className="text-center space-y-2">
                    <h3 className={`text-2xl font-bold ${displayData.name === 'Nombre del Speaker' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {displayData.name}
                    </h3>
                    <p className={`text-lg ${displayData.position === 'Posición' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                        {displayData.position}
                    </p>
                </div>

                {/* Logo de la Empresa */}
                {displayData.company && (
                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Empresa:</p>
                        <img
                            src={displayData.company}
                            alt="Logo de la empresa"
                            className="h-16 mx-auto object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Placeholder para el logo si no hay imagen */}
                {!displayData.company && (
                    <div className="text-center">
                        <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">Empresa:</p>
                        <div className="h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center w-24">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* LinkedIn */}
                {displayData.linkedin && (
                    <div className="text-center">
                        <a
                            href={formatLinkedInUrl(displayData.linkedin)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            Ver LinkedIn
                        </a>
                    </div>
                )}

                {/* Placeholder para LinkedIn si no hay URL */}
                {!displayData.linkedin && (
                    <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded-lg">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            LinkedIn
                        </div>
                    </div>
                )}

                {/* Botón para agregar otro - solo se muestra si hay un speaker creado */}
                {speaker && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                        <button
                            onClick={onAddAnother}
                            className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                            Agregar Otro Speaker
                        </button>
                    </div>
                )}

                {/* Mensaje de ayuda cuando no hay datos */}
                {!speaker && !previewData.name && !previewData.position && !previewData.linkedin && !previewData.photoFile && !previewData.companyLogoFile && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        <p className="text-sm">Comienza a llenar el formulario para ver la vista previa</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpeakerPreview;
