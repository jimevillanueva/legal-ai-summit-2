import { supabase } from '../utils/supabaseClient'
import { Speaker_Sesion } from '../types/Speaker_Sesion'

export const speaker_SesionService = {

    async createSpeaker_Sesion(speaker_Sesion: Omit<Speaker_Sesion, 'id' | 'created_at'>): Promise<Speaker_Sesion> {
        try {
            const { data, error } = await supabase
                .from('speakers_sessions')
                .insert({
                    session_id: speaker_Sesion.session_id,
                    speaker_id: speaker_Sesion.speaker_id
                })
                .select()
                .single()

            if (error) {
                console.error('Error al crear speaker_sesion:', error.code, error.message)
                switch (error.code) {
                    case '23505': // violación de constraint único
                        throw new Error('Ya existe esa relación speaker-sesión')
                    case '23503': // violación de foreign key
                        throw new Error('El speaker o la sesión no existen')
                    case '42501': // permiso denegado
                        throw new Error('No tienes permisos para crear relaciones speaker-sesión')
                    default:
                        throw new Error(`Error en la base de datos: ${error.message}`)
                }
            }

            return data
        } catch (err) {
            console.error('Excepción inesperada en createSpeaker_Sesion:', err)
            throw err
        }
    },

    async updateSpeaker_Sesion(speaker_Sesion: Speaker_Sesion): Promise<Speaker_Sesion> {
        try {
            const { data, error } = await supabase
                .from('speakers_sessions')
                .update({
                    session_id: speaker_Sesion.session_id,
                    speaker_id: speaker_Sesion.speaker_id
                })
                .eq('id', speaker_Sesion.id)
                .select()
                .single()

            if (error) {
                console.error('Error al actualizar speaker_sesion:', error.code, error.message)
                switch (error.code) {
                    case '42501': // permiso denegado
                        throw new Error('No tienes permisos para actualizar relaciones speaker-sesión')
                    case '23505': // violación de constraint único
                        throw new Error('Ya existe esa relación speaker-sesión')
                    case '23503': // violación de foreign key
                        throw new Error('El speaker o la sesión no existen')
                    default:
                        throw new Error(`Error en la base de datos: ${error.message}`)
                }
            }

            if (!data) {
                throw new Error('Relación speaker-sesión no encontrada')
            }

            return data
        } catch (err) {
            console.error('Excepción inesperada en updateSpeaker_Sesion:', err)
            throw err
        }
    },

    async getAllSpeaker_SesionsBySesionId(sesionId: string): Promise<Speaker_Sesion[]> {
        try {
            const { data, error } = await supabase
                .from('speakers_sessions')
                .select('*')
                .eq('session_id', sesionId)

            if (error) {
                console.error('Error al obtener speakers por sesión:', error.code, error.message)
                switch (error.code) {
                    case '42P01': // tabla no existe
                        throw new Error('La tabla "speakers_sessions" no existe en la base de datos')
                    case '42501': // permiso denegado
                        throw new Error('No tienes permisos para consultar relaciones speaker-sesión')
                    default:
                        throw new Error(`Error en la base de datos: ${error.message}`)
                }
            }

            return data || []
        } catch (err) {
            console.error('Excepción inesperada en getAllSpeaker_SesionsBySesionId:', err)
            throw err
        }
    },

    async getAllSpeaker_Sesions(): Promise<Speaker_Sesion[]> {
        try {
            const { data, error } = await supabase
                .from('speakers_sessions')
                .select('*')

            if (error) {
                console.error('Error al obtener todas las relaciones speaker-sesión:', error.code, error.message)
                switch (error.code) {
                    case '42P01': // tabla no existe
                        throw new Error('La tabla "speakers_sessions" no existe en la base de datos')
                    case '42501': // permiso denegado
                        throw new Error('No tienes permisos para consultar relaciones speaker-sesión')
                    default:
                        throw new Error(`Error en la base de datos: ${error.message}`)
                }
            }

            return data || []
        } catch (err) {
            console.error('Excepción inesperada en getAllSpeaker_Sesions:', err)
            throw err
        }
    },

    async getAllIdSpeakerBySpeakerSesionId(speakerSesionId: string): Promise<string[]> {
        try {
            const { data, error } = await supabase
                .from('speakers_sessions')
                .select('speaker_id')
                .eq('id', speakerSesionId)

            if (error) {
                console.error('Error al obtener speaker IDs:', error.code, error.message)
                switch (error.code) {
                    case '42P01': // tabla no existe
                        throw new Error('La tabla "speakers_sessions" no existe en la base de datos')
                    case '42501': // permiso denegado
                        throw new Error('No tienes permisos para consultar relaciones speaker-sesión')
                    default:
                        throw new Error(`Error en la base de datos: ${error.message}`)
                }
            }

            return data?.map(item => item.speaker_id) || []
        } catch (err) {
            console.error('Excepción inesperada en getAllIdSpeakerBySpeakerSesionId:', err)
            throw err
        }
    },

    async deleteSpeakerSessionsBySessionId(sessionId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('speakers_sessions')
                .delete()
                .eq('session_id', sessionId)

            if (error) {
                console.error('Error al eliminar relaciones speaker-session:', error.code, error.message)
                switch (error.code) {
                    case '42501': // permiso denegado
                        throw new Error('No tienes permisos para eliminar relaciones speaker-sesión')
                    default:
                        throw new Error(`Error en la base de datos: ${error.message}`)
                }
            }
        } catch (err) {
            console.error('Excepción inesperada en deleteSpeakerSessionsBySessionId:', err)
            throw err
        }
    }
}