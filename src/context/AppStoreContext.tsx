import { useCallback, useEffect, useState, type ReactNode, type SetStateAction } from 'react'
import { combos } from '../data/mockData'
import { readAppointments, readSelection, saveAppointments, saveSelection } from '../services/storageService'
import type { Appointment, Selection } from '../types'
import { AppStoreContext } from './storeContext'

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointmentsState] = useState(readAppointments)
  const [selection, setSelectionState] = useState(readSelection)
  const [notice, setNotice] = useState('')

  useEffect(() => saveAppointments(appointments), [appointments])
  useEffect(() => saveSelection(selection), [selection])
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 3200)
    return () => window.clearTimeout(timer)
  }, [notice])

  const setAppointments = useCallback((next: Appointment[]) => {
    setAppointmentsState(next)
  }, [])

  const setSelection = useCallback((next: SetStateAction<Selection>) => {
    setSelectionState(next)
  }, [])

  const notify = useCallback((message: string) => {
    setNotice(message)
  }, [])

  const addService = useCallback((serviceId: string) => {
    if (selection.serviceIds.includes(serviceId)) {
      notify('Este serviço já está na sua seleção.')
      return
    }
    setSelection({ ...selection, serviceIds: [...selection.serviceIds, serviceId] })
    notify('Serviço adicionado à sua seleção.')
  }, [notify, selection, setSelection])

  const addCombo = useCallback((comboId: string) => {
    const combo = combos.find((item) => item.id === comboId)
    if (!combo) return
    if (selection.comboIds.includes(comboId)) {
      notify('Este combo já está na sua seleção.')
      return
    }

    const overlaps = combos.some((selected) =>
      selection.comboIds.includes(selected.id) &&
      selected.services.some((serviceId) => combo.services.includes(serviceId)),
    )
    if (overlaps) {
      notify('Um serviço deste combo já está incluído em outro combo.')
      return
    }

    setSelection({
      ...selection,
      serviceIds: [...new Set([...selection.serviceIds, ...combo.services])],
      comboIds: [...selection.comboIds, comboId],
    })
    notify('Combo adicionado à sua seleção.')
  }, [notify, selection, setSelection])

  return (
    <AppStoreContext.Provider value={{
      appointments,
      selection,
      notice,
      setAppointments,
      setSelection,
      notify,
      addService,
      addCombo,
    }}>
      {children}
    </AppStoreContext.Provider>
  )
}
