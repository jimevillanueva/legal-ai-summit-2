import { supabase } from '../config/supabase'
import { Sesion } from '../types/Sesion'

export const sesionService = {

    async createSesion(sesion: Sesion): Promise<Sesion> {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .insert({
                    tittle: sesion.tittle,
                    description: sesion.description,
                    date: sesion.date,
                    link: sesion.link
                })
                .select()
                .single()

            if (error) {
                console.error('Error al crear sesión:', error.code, error.message)
                switch (error.code) {
                    case '23505': // violación de constraint único
                        throw new Error('Ya existe una sesión con esos datos')
                    case '42501': // permiso denegado
                        throw new Error('No tienes permisos para crear sesiones')
                    default:
                        throw new Error(`Error en la base de datos: ${error.message}`)
                }
            }

            return data
        } catch (err) {
            console.error('Excepción inesperada en createSesion:', err)
            throw err
        }
    },

    async updateSesion(sesion: Sesion): Promise<Sesion> {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .update({
                    tittle: sesion.tittle,
                    description: sesion.description,
                    date: sesion.date,
                    link: sesion.link
                })
                .eq('id', sesion.id)
                .select()
                .single()

            if (error) {
                console.error('Error al actualizar sesión:', error.code, error.message)
                switch (error.code) {
                    case '42501': // permiso denegado
                        throw new Error('No tienes permisos para actualizar sesiones')
                    case '23505': // violación de constraint único
                        throw new Error('Ya existe una sesión con esos datos')
                    default:
                        throw new Error(`Error en la base de datos: ${error.message}`)
                }
            }

            if (!data) {
                throw new Error('Sesión no encontrada')
            }

            return data
        } catch (err) {
            console.error('Excepción inesperada en updateSesion:', err)
            throw err
        }
    },

    async deleteSesion(sesion: Sesion): Promise<Sesion> {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .delete()
                .eq('id', sesion.id)
                .select()
                .single()

            if (error) {
                console.error('Error al eliminar sesión:', error.code, error.message)
                switch (error.code) {
                    case '42501': // permiso denegado
                        throw new Error('No tienes permisos para eliminar sesiones')
                    case '23503': // violación de foreign key
                        throw new Error('No se puede eliminar la sesión porque tiene speakers asociados')
                    default:
                        throw new Error(`Error en la base de datos: ${error.message}`)
                }
            }

            if (!data) {
                throw new Error('Sesión no encontrada')
            }

            return data
        } catch (err) {
            console.error('Excepción inesperada en deleteSesion:', err)
            throw err
        }
    },

    async getSesionbyId(id: string): Promise<Sesion> {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                console.error('Error al obtener sesión por ID:', error.code, error.message)
                switch (error.code) {
                    case '42P01': // tabla no existe
                        throw new Error('La tabla "sessions" no existe en la base de datos')
                    case '42501': // permiso denegado
                        throw new Error('No tienes permisos para consultar sesiones')
                    case 'PGRST116': // no rows returned
                        throw new Error('Sesión no encontrada')
                    default:
                        throw new Error(`Error en la base de datos: ${error.message}`)
                }
            }

            return data
        } catch (err) {
            console.error('Excepción inesperada en getSesionbyId:', err)
            throw err
        }
    },

    async getAllSesions(): Promise<Sesion[]> {
        try {
          const { data, error } = await supabase
            .from('sessions')
            .select('*')
      
          if (error) {
            console.error('Error al obtener sesiones:', error.code, error.message)
      
            switch (error.code) {
              case '42P01': // tabla no existe
                throw new Error('La tabla "sessions" no existe en la base de datos')
              case '42501': // permiso denegado
                throw new Error('No tienes permisos para consultar sesiones')
              default:
                throw new Error(`Error en la base de datos: ${error.message}`)
            }
          }
      
          return data || []
        } catch (err) {
          console.error('Excepción inesperada en getAllSesions:', err)
          throw err
        }
    }
}