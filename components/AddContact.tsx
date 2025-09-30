import React from 'react';
import { contactService } from '../services/ContactService';
import { Contact } from '../types/Contact';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertaModal from './AlertaModal';

const AddContact: React.FC = () => {
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact>({
    id: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    billing_address: '',
    source: '',
    stripe_custome_id: '',
    metadata: '',
    group_session_id: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: 'validacion' as 'eliminar' | 'validacion' | 'exito',
    title: '',
    message: '',
    camposFaltantes: [] as string[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContact(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que el email no esté vacío
    if (!contact.email.trim()) {
      setAlertModal({
        isOpen: true,
        type: 'validacion',
        title: 'Email requerido',
        message: 'El email es el único campo obligatorio para crear un contacto.',
        camposFaltantes: ['Email']
      });
      return;
    }

    setIsLoading(true);

    try {
      await contactService.createContact(contact);
      
      // Éxito - mostrar mensaje y redirigir
      setAlertModal({
        isOpen: true,
        type: 'exito',
        title: 'Contacto creado',
        message: 'El contacto se ha creado exitosamente.',
        camposFaltantes: []
      });

      // Limpiar formulario después de 2 segundos
      setTimeout(() => {
        setContact({
          id: '',
          name: '',
          email: '',
          phone: '',
          company: '',
          billing_address: '',
          source: '',
          stripe_custome_id: '',
          metadata: '',
          group_session_id: ''
        });
        setAlertModal({ ...alertModal, isOpen: false });
      }, 2000);

    } catch (error: any) {
      console.error('Error al crear contacto:', error);
      
      // Mostrar error específico
      setAlertModal({
        isOpen: true,
        type: 'validacion',
        title: 'Error al crear contacto',
        message: error.message || 'Ocurrió un error inesperado al crear el contacto.',
        camposFaltantes: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeAlertModal = () => {
    setAlertModal({ ...alertModal, isOpen: false });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Agregar contacto</h1>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-yellow-600 dark:text-yellow-400 text-lg">ℹ️</span>
          <div>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1">
              Información importante:
            </p>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
              <li>El <strong>email es el único campo obligatorio</strong></li>
              <li>El contacto no debe existir previamente en el sistema</li>
              <li>Todos los demás campos son opcionales</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={contact.email}
            onChange={handleInputChange}
            placeholder="Email"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Nombre
          </label>
          <input
            type="text"
            name="name"
            value={contact.name}
            onChange={handleInputChange}
            placeholder="Nombre"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Teléfono
          </label>
          <input
            type="text"
            name="phone"
            value={contact.phone}
            onChange={handleInputChange}
            placeholder="Teléfono"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Empresa
          </label>
          <input
            type="text"
            name="company"
            value={contact.company}
            onChange={handleInputChange}
            placeholder="Empresa"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Dirección de facturación
          </label>
          <input
            type="text"
            name="billing_address"
            value={contact.billing_address}
            onChange={handleInputChange}
            placeholder="Dirección de facturación"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Origen
          </label>
          <input
            type="text"
            name="source"
            value={contact.source}
            onChange={handleInputChange}
            placeholder="Origen"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            ID de Stripe
          </label>
          <input
            type="text"
            name="stripe_custome_id"
            value={contact.stripe_custome_id}
            onChange={handleInputChange}
            placeholder="ID de Stripe"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Metadatos
          </label>
          <input
            type="text"
            name="metadata"
            value={contact.metadata}
            onChange={handleInputChange}
            placeholder="Metadatos"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            ID de sesión
          </label>
          <input
            type="text"
            name="group_session_id"
            value={contact.group_session_id}
            onChange={handleInputChange}
            placeholder="ID de sesión"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Creando...' : 'Agregar contacto'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>

      <AlertaModal
        isOpen={alertModal.isOpen}
        onClose={closeAlertModal}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        camposFaltantes={alertModal.camposFaltantes}
      />
    </div>
  );
};

export default AddContact;