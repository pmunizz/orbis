import { createContext, type Dispatch, type SetStateAction } from 'react'
import type { Appointment, Selection } from '../types'

export type AppStore = {
  appointments: Appointment[]
  selection: Selection
  notice: string
  setAppointments: (appointments: Appointment[]) => void
  setSelection: Dispatch<SetStateAction<Selection>>
  notify: (message: string) => void
  addService: (serviceId: string) => void
  addCombo: (comboId: string) => void
}

export const AppStoreContext = createContext<AppStore | null>(null)
