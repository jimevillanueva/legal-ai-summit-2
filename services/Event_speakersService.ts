import { supabase } from '../utils/supabaseClient'
import { Event_Speaker } from '../types/Event_Speaker'

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
    }
}
        