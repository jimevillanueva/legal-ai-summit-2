import React from 'react';
import { contactService } from '../services/ContactService';
import { Contact } from '../types/Contact';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertaModal from './AlertaModal';
import { EmailService } from '../utils/emailService';
import Header from './Header';

const AddContact: React.FC = () => {
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact>({
    id: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    billing_address: '',
    source: 'cortesia',
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

  // Lista de dominios comunes para detectar errores tipográficos
  const commonDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
    'icloud.com', 'me.com', 'aol.com', 'msn.com', 'ymail.com',
    'protonmail.com', 'zoho.com', 'mail.com', 'gmx.com'
  ];

  // Función para calcular distancia de Levenshtein (similitud entre strings)
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  // Función para encontrar dominio sugerido si hay error tipográfico
  const findSuggestedDomain = (domain: string): string | null => {
    const domainLower = domain.toLowerCase();
    
    // Primero verificar si el dominio ya es exactamente uno de los dominios comunes
    if (commonDomains.includes(domainLower)) {
      return null; // No sugerir nada si ya es correcto
    }
    
    for (const commonDomain of commonDomains) {
      const distance = levenshteinDistance(domainLower, commonDomain);
      // Si la distancia es 1-2 caracteres y el dominio es similar en longitud
      if (distance <= 2 && Math.abs(domainLower.length - commonDomain.length) <= 2) {
        return commonDomain;
      }
    }
    
    return null;
  };

  // Función para validar dominio de email
  const isValidEmailDomain = (email: string): { isValid: boolean; suggestedDomain?: string } => {
    if (!email || !email.includes('@')) return { isValid: false };
    
    const domain = email.split('@')[1];
    if (!domain) return { isValid: false };
    
    // Validar formato básico del dominio
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    // El dominio debe tener al menos un punto y una extensión válida
    const hasValidExtension = /\.[a-zA-Z]{2,}$/.test(domain);
    
    const isFormatValid = domainRegex.test(domain) && hasValidExtension;
    
    if (!isFormatValid) return { isValid: false };
    
    // Verificar si hay errores tipográficos en dominios conocidos
    const suggestedDomain = findSuggestedDomain(domain);
    
    if (suggestedDomain) {
      return { isValid: false, suggestedDomain };
    }
    
    return { isValid: true };
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

    // Validar que el dominio del email sea válido
    const emailValidation = isValidEmailDomain(contact.email);
    if (!emailValidation.isValid) {
      const message = emailValidation.suggestedDomain 
        ? `¿Quisiste decir "${contact.email.split('@')[0]}@${emailValidation.suggestedDomain}"? Por favor verifica el dominio del email.`
        : 'Por favor ingresa un email con un dominio válido (ej: usuario@dominio.com).';
      
      setAlertModal({
        isOpen: true,
        type: 'validacion',
        title: 'Email inválido',
        message,
        camposFaltantes: ['Email']
      });
      return;
    }

    setIsLoading(true);

    try {
      // Normalizar email a minúsculas antes de guardar
      const normalizedContact = {
        ...contact,
        email: contact.email.toLowerCase().trim()
      };
      
      const createdContact = await contactService.createContact(normalizedContact);
      
      // Enviar ticket por email usando los datos del contacto recién creado
      const emailService = EmailService.getInstance();
      const ticketResult = await emailService.sendTicketEmail({
        to: createdContact.email,
        user: {
          id: createdContact.id,
          name: createdContact.name || createdContact.email,
          email: createdContact.email
        },
        confirmationUrl: `https://agenda.lawgic.institute/access/${createdContact.id}`
      });

      // Mostrar mensaje según el resultado del envío
      if (ticketResult.success) {
        setAlertModal({
          isOpen: true,
          type: 'exito',
          title: 'Contacto creado y ticket enviado',
          message: 'El contacto se ha creado exitosamente y se ha enviado el ticket de acceso por email.',
          camposFaltantes: []
        });
      } else {
        setAlertModal({
          isOpen: true,
          type: 'validacion',
          title: 'Contacto creado, error al enviar ticket',
          message: `El contacto se creó correctamente, pero hubo un error al enviar el ticket: ${ticketResult.error}`,
          camposFaltantes: []
        });
      }

      // Limpiar formulario después de 2 segundos
      setTimeout(() => {
        setContact({
          id: '',
          name: '',
          email: '',
          phone: '',
          company: '',
          billing_address: '',
          source: 'cortesia',
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
    <div >
      <Header 
        onShare={() => {}} 
        onImportExport={() => {}} 
      />
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
            Company
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
    </div>
  );
};

export default AddContact;