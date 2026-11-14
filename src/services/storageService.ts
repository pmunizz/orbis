import { combos, demoAppointments } from '../data/mockData'
import type { Appointment, Selection } from '../types'

const APPOINTMENTS_KEY = 'orbis-appointments'
const SELECTION_KEY = 'orbis-selection'
const PREVIOUS_COMBO_SERVICES: Record<string, string[]> = {
  selfcare: ['consultation', 'brows'],
}

export const readAppointments = (): Appointment[] => {
  try {
    const saved = localStorage.getItem(APPOINTMENTS_KEY)
    if (saved) return JSON.parse(saved) as Appointment[]
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(demoAppointments))
  } catch (error) {
    console.error('Não foi possível carregar os agendamentos salvos.', error)
  }
  return demoAppointments
}

export const saveAppointments = (appointments: Appointment[]) => {
  try {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments))
  } catch (error) {
    console.error('Não foi possível salvar os agendamentos.', error)
  }
}

export const readSelection = (): Selection => {
  try {
    const saved = localStorage.getItem(SELECTION_KEY)
    if (saved) {
      const stored = JSON.parse(saved) as Partial<Selection>
      const comboIds = stored.comboIds ?? []
      const currentComboServices = new Set(
        combos.filter((combo) => comboIds.includes(combo.id)).flatMap((combo) => combo.services),
      )
      const previousComboServices = new Set(
        comboIds.flatMap((comboId) => PREVIOUS_COMBO_SERVICES[comboId] ?? []),
      )
      const serviceIds = (stored.serviceIds ?? []).filter((serviceId) =>
        !previousComboServices.has(serviceId) || currentComboServices.has(serviceId),
      )
      return {
        serviceIds: [...new Set([...serviceIds, ...currentComboServices])],
        comboIds,
      }
    }
  } catch (error) {
    console.error('Não foi possível carregar a seleção salva.', error)
  }
  return { serviceIds: [], comboIds: [] }
}

export const saveSelection = (selection: Selection) => {
  try {
    localStorage.setItem(SELECTION_KEY, JSON.stringify(selection))
  } catch (error) {
    console.error('Não foi possível salvar sua seleção.', error)
  }
}
