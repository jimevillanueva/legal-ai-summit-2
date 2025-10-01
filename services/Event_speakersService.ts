import { supabase } from '../utils/supabaseClient'
import { Event_Speaker } from '../types/Event_Speaker'
import { uploadFile } from '../utils/storage'

export const event_SpeakerService = {

    async getAllEvent_Speakers(): Promise<Event_Speaker[]> {
        try {
            const { data, error } = await supabase
                .from('event_speakers')
                .select('*')

            if (error) {
                console.error('Error al obtener speakers:', error.code, error.message)

                switch (error.code) {
                    case '42P01': // tabla no existe
                        throw new Error('La tabla "event_speakers" no existe en la base de datos')
                    case '42501': // permiso denegado
                        throw new Error('No tienes permisos para consultar speakers')
                    default:
                        throw new Error(`Error en la base de datos: ${error.message}`)
                }
            }
            return data || []
        } catch (err) {
            console.error('Excepción inesperada en getAllEvent_Speakers:', err)
            throw err
        }
    },
    async getEvent_SpeakersById(id: string): Promise<Event_Speaker> {
        try {
            const { data, error } = await supabase
                .from('event_speakers')
                .select('*')
                .eq('id', id)   
                .single()

                
                if (error) {
                    console.error('Error al obtener speakers:', error.code, error.message)
    
                    switch (error.code) {
                        case '42P01': // tabla no existe
                            throw new Error('La tabla "event_speakers" no existe en la base de datos')
                        case '42501': // permiso denegado
                            throw new Error('No tienes permisos para consultar speakers')
                        default:
                            throw new Error(`Error en la base de datos: ${error.message}`)
                    }
                }
                return data
            } catch (err) {
                console.error('Excepción inesperada en getEvent_SpeakersById:', err)
                throw err
            }
        },
    async getEvent_SpeakersByName(name: string): Promise<Event_Speaker[]> {
        try {
            const { data, error } = await supabase
                .from('event_speakers')
                .select('*')
                .ilike('name', `%${name}%`) // Usar ilike para búsqueda case-insensitive y parcial
            
            if (error) {
                console.error('Error al obtener speakers:', error.code, error.message)
                throw new Error(`Error en la base de datos: ${error.message}`)
            }
            
            return data || [] // Devolver array vacío si no hay datos
        } catch (err) {
            console.error('Excepción inesperada en getEvent_SpeakerBYName:', err)
            throw err
        }
    },
    async createEvent_Speaker(event_Speaker: Event_Speaker): Promise<Event_Speaker> {
        try {
            const { data, error } = await supabase
                .from('event_speakers')
                .insert(event_Speaker)
                .select()
                .single()

            if (error) {
                console.error('Error al crear speaker:', error.code, error.message)
                throw new Error(`Error en la base de datos: ${error.message}`)
            }
            return data || []
        } catch (err) {
            console.error('Excepción inesperada en createEvent_Speaker:', err)
            throw err
        }
    },
    async createEvent_SpeakerWithFiles(
        speakerData: Omit<Event_Speaker, 'id' | 'photo' | 'company'>,
        photoFile?: File,
        companyLogoFile?: File
    ): Promise<Event_Speaker> {
        try {
            let photoUrl = '';
            let companyLogoUrl = '';

            // Subir foto del speaker si se proporciona
            if (photoFile) {
                const photoFileName = `speaker_${Date.now()}_${photoFile.name}`;
                const uploadedPhotoUrl = await uploadFile('speakers_event_photos', photoFile, photoFileName);
                if (uploadedPhotoUrl) {
                    photoUrl = uploadedPhotoUrl;
                } else {
                    throw new Error('Error al subir la foto del speaker');
                }
            }

            // Subir logo de la empresa si se proporciona
            if (companyLogoFile) {
                const logoFileName = `company_${Date.now()}_${companyLogoFile.name}`;
                const uploadedLogoUrl = await uploadFile('company_logo_event', companyLogoFile, logoFileName);
                if (uploadedLogoUrl) {
                    companyLogoUrl = uploadedLogoUrl;
                } else {
                    throw new Error('Error al subir el logo de la empresa');
                }
            }

            // Crear el speaker con las URLs de las imágenes
            const speakerToCreate = {
                ...speakerData,
                photo: photoUrl,
                company: companyLogoUrl
            };

            return await this.createEvent_Speaker(speakerToCreate);
        } catch (err) {
            console.error('Excepción inesperada en createEvent_SpeakerWithFiles:', err)
            throw err
        }
    }
}
        