import React from 'react';
import { useState } from 'react';
import { Event_Speaker } from '../types/Event_Speaker';
import { event_SpeakerService } from '../services/Event_speakersService';
import { useNavigate } from 'react-router-dom';
import AlertaModal from './AlertaModal';
import SpeakerForm from './SpeakerForm';
import SpeakerPreview from './SpeakerPreview';
import Header from './Header';

const AddEvent_Speaker: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Omit<Event_Speaker, 'id' | 'photo' | 'company'>>({
        name: '',
        linkedin: '',
        position: ''
    });
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'eliminar' | 'validacion' | 'exito'>('exito');
    const [createdSpeaker, setCreatedSpeaker] = useState<Event_Speaker | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'company') => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === 'photo') {
                setPhotoFile(file);
            } else {
                setCompanyLogoFile(file);
            }
        }
    };

    const formatLinkedInUrl = (url: string): string => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `https://${url}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Validar campos requeridos
            if (!formData.name.trim()) {
                throw new Error('El nombre es requerido');
            }

            // Formatear LinkedIn URL
            const formattedLinkedIn = formatLinkedInUrl(formData.linkedin);

            // Crear el speaker con archivos
            const newSpeaker = await event_SpeakerService.createEvent_SpeakerWithFiles(
                { ...formData, linkedin: formattedLinkedIn },
                photoFile || undefined,
                companyLogoFile || undefined
            );
            
            setCreatedSpeaker(newSpeaker);
            setAlertMessage('Speaker agregado exitosamente');
            setAlertType('exito');
            setShowAlert(true);
            
            // Limpiar formulario
            setFormData({
                name: '',
                linkedin: '',
                position: ''
            });
            setPhotoFile(null);
            setCompanyLogoFile(null);

        } catch (error) {
            console.error('Error al crear speaker:', error);
            setAlertMessage(error instanceof Error ? error.message : 'Error al crear el speaker');
            setAlertType('validacion');
            setShowAlert(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin');
    };

    const handleAddAnother = () => {
        setCreatedSpeaker(null);
    };

    const handleCloseAlert = () => {
        setShowAlert(false);
    };

    // Datos para la vista previa en tiempo real
    const previewData = {
        name: formData.name,
        position: formData.position,
        linkedin: formData.linkedin,
        photoFile,
        companyLogoFile
    };

    return (
        <div >
            <Header 
                onShare={() => {}} 
                onImportExport={() => {}} 
            />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Formulario */}
                    <SpeakerForm
                        formData={formData}
                        photoFile={photoFile}
                        companyLogoFile={companyLogoFile}
                        isLoading={isLoading}
                        onInputChange={handleInputChange}
                        onFileChange={handleFileChange}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />

                    {/* Vista previa del Speaker */}
                    <SpeakerPreview
                        speaker={createdSpeaker}
                        previewData={previewData}
                        onAddAnother={handleAddAnother}
                    />
                </div>
            </div>

            {/* Modal de alerta */}
            {showAlert && (
                <AlertaModal
                    isOpen={showAlert}
                    title={alertType === 'exito' ? 'Éxito' : 'Error'}
                    message={alertMessage}
                    type={alertType}
                    onClose={handleCloseAlert}
                />
            )}
        </div>
        </div>
    );
};

export default AddEvent_Speaker;