import { combos, professionals, services } from '../data/mockData'
import type { Appointment, Professional } from '../types'

export function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function calendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  return [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) =>
      new Date(month.getFullYear(), month.getMonth(), index + 1),
    ),
  ]
}

export function serviceDuration(serviceIds: string[]) {
  return serviceIds.reduce(
    (total, id) => total + (services.find((service) => service.id === id)?.duration ?? 0),
    0,
  )
}

export function comboDiscount(comboIds: string[]) {
  return comboIds.reduce((total, id) => {
    const combo = combos.find((item) => item.id === id)
    if (!combo) return total
    const individualPrice = combo.services.reduce(
      (subtotal, serviceId) =>
        subtotal + (services.find((service) => service.id === serviceId)?.price ?? 0),
      0,
    )
    return total + (individualPrice - combo.price)
  }, 0)
}

export function selectionItemCount(
  serviceIds: string[],
  comboIds: string[] = [],
) {
  const selectedCombos = combos.filter((combo) => comboIds.includes(combo.id))
  const comboServiceIds = new Set(selectedCombos.flatMap((combo) => combo.services))
  const serviceCount = serviceIds.filter((id) => !comboServiceIds.has(id)).length
  return serviceCount + selectedCombos.length
}

export function selectionTotal(
  serviceIds: string[],
  comboIds: string[] = [],
) {
  const selectedCombos = combos.filter((combo) => comboIds.includes(combo.id))
  const comboServiceIds = new Set(selectedCombos.flatMap((combo) => combo.services))
  const uniqueStandaloneServices = [...new Set(
    serviceIds.filter((id) => !comboServiceIds.has(id)),
  )]

  const serviceTotal = uniqueStandaloneServices.reduce(
    (total, id) => total + (services.find((service) => service.id === id)?.price ?? 0),
    0,
  )

  return serviceTotal + selectedCombos.reduce((total, combo) => total + combo.price, 0)
}

export function appointmentTotal(appointment: Appointment) {
  return selectionTotal(
    appointment.serviceIds,
    appointment.comboIds ?? [],
  )
}

export function eligibleProfessionals(serviceIds: string[]) {
  return professionals.filter((professional) =>
    serviceIds.length > 0 &&
    serviceIds.every((serviceId) => professional.services.includes(serviceId)),
  )
}

export function hasAppointmentConflict(
  appointments: Appointment[],
  professionalId: string,
  date: string,
  startTime: string,
  duration: number,
  excludedAppointmentId?: string | null,
) {
  const start = timeToMinutes(startTime)
  return appointments.some((appointment) => {
    if (
      appointment.status !== 'Confirmado' ||
      appointment.date !== date ||
      appointment.professionalId !== professionalId ||
      appointment.id === excludedAppointmentId
    ) return false

    const otherStart = timeToMinutes(appointment.time)
    const otherEnd = otherStart + serviceDuration(appointment.serviceIds)
    return start < otherEnd && start + duration > otherStart
  })
}

export function isTimeAvailable(
  appointments: Appointment[],
  candidateProfessionals: Professional[],
  date: string,
  time: string,
  duration: number,
  excludedAppointment?: Appointment,
) {
  if (timeToMinutes(time) + duration > 18 * 60) return false

  return candidateProfessionals.some((professional) =>
    !hasAppointmentConflict(
      appointments,
      professional.id,
      date,
      time,
      duration,
      excludedAppointment?.id,
    ),
  )
}

export function createAppointmentId() {
  return `ORB-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

export function currentTimestamp() {
  return new Date().toISOString()
}
