import React from 'react';
import { Event_Speaker } from '../types/Event_Speaker';
import { UploadIcon } from './icons';

interface SpeakerFormProps {
    formData: Omit<Event_Speaker, 'id' | 'photo' | 'company'>;
    photoFile: File | null;
    companyLogoFile: File | null;
    isLoading: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'company') => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}

const SpeakerForm: React.FC<SpeakerFormProps> = ({
    formData,
    photoFile,
    companyLogoFile,
    isLoading,
    onInputChange,
    onFileChange,
    onSubmit,
    onCancel
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Agregar Speaker
            </h1>
            
            <form onSubmit={onSubmit} className="space-y-6">
                {/* Nombre */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={onInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Nombre completo del speaker"
                    />
                </div>

                {/* Posición */}
                <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Posición *
                    </label>
                    <input
                        type="text"
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={onInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Cargo o posición en la empresa"
                    />
                </div>

                {/* LinkedIn */}
                <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        LinkedIn
                    </label>
                    <input
                        type="text"
                        id="linkedin"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={onInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="linkedin.com/in/usuario o https://linkedin.com/in/usuario"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Puedes escribir con o sin https://
                    </p>
                </div>

                {/* Foto del Speaker */}
                <div>
                    <label htmlFor="photo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Foto del Speaker
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                        <div className="space-y-1 text-center">
                            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                <label
                                    htmlFor="photo"
                                    className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                >
                                    <span>Subir archivo</span>
                                    <input
                                        id="photo"
                                        name="photo"
                                        type="file"
                                        accept="image/*"
                                        className="sr-only"
                                        onChange={(e) => onFileChange(e, 'photo')}
                                    />
                                </label>
                                <p className="pl-1">o arrastra y suelta</p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                PNG, JPG, GIF hasta 10MB
                            </p>
                        </div>
                    </div>
                    {photoFile && (
                        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                            ✓ Archivo seleccionado: {photoFile.name}
                        </p>
                    )}
                </div>

                {/* Logo de la Empresa */}
                <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Logo de la Empresa
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                        <div className="space-y-1 text-center">
                            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                <label
                                    htmlFor="company"
                                    className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                >
                                    <span>Subir logo</span>
                                    <input
                                        id="company"
                                        name="company"
                                        type="file"
                                        accept="image/*"
                                        className="sr-only"
                                        onChange={(e) => onFileChange(e, 'company')}
                                    />
                                </label>
                                <p className="pl-1">o arrastra y suelta</p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                PNG, JPG, GIF hasta 10MB
                            </p>
                        </div>
                    </div>
                    {companyLogoFile && (
                        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                            ✓ Logo seleccionado: {companyLogoFile.name}
                        </p>
                    )}
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-4 pt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Guardando...' : 'Guardar Speaker'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SpeakerForm;
