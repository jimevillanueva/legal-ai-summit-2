import { supabase } from '../utils/supabaseClient';
import { Contact } from '../types/Contact';

export const contactService = {
    async createContact(contact: Contact): Promise<Contact> {
        try {
            // Verificar si ya existe un contacto con ese email
            const existingContact = await this.verifyContact(contact.email);
            if (existingContact) {
                throw new Error('Ya existe un contacto con ese email');
            }

            const { data, error } = await supabase
                .from('contacts')
                .insert({
                    name: contact.name,
                    email: contact.email,
                    phone: contact.phone,
                    company: contact.company,
                    billing_address: contact.billing_address,
                    source: contact.source,
                    stripe_customer_id: contact.stripe_custome_id,
                    metadata: contact.metadata,
                    group_session_id: contact.group_session_id
                })
                .select()
                .single()

            if (error) {
                console.error('Error al crear contacto:', error.code, error.message)
                switch (error.code) {
                    case '23505': // violación de constraint único
                        throw new Error('Ya existe un contacto con esos datos')
                    case '42501': // permiso denegado
                        throw new Error('No tienes permisos para crear contactos')
                    default:
                        throw new Error(`Error en la base de datos: ${error.message}`)
                }
            }

            return data
        } catch (err) {
            console.error('Excepción inesperada en createContact:', err)
            throw err
        }
    }, 
    async verifyContact(email: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('email', email)
            .maybeSingle()
        if (error) {
            throw new Error(`Error al verificar contacto: ${error.code} - ${error.message}`)
        }
        return data ? true : false
    }
}