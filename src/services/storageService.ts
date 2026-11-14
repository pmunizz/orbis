import { demoAppointments } from '../data/mockData'
import type { Appointment, Selection } from '../types'

const APPOINTMENTS_KEY = 'orbis-appointments'
const SELECTION_KEY = 'orbis-selection'

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
      return {
        serviceIds: stored.serviceIds ?? [],
        comboIds: stored.comboIds ?? [],
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
