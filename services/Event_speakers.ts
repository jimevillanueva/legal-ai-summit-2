import { supabase } from '../config/supabase'
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
            console.log(data);
            return data || []
        } catch (err) {
            console.error('Excepción inesperada en getAllEvent_Speakers:', err)
            throw err
        }
    }

}
        