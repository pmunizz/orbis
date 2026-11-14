export type Service = {
  id: string
  name: string
  category: string
  description: string
  fullDescription: string
  price: number
  duration: number
  professionals: string[]
}

export type Combo = {
  id: string
  name: string
  description: string
  services: string[]
  price: number
}

export type Professional = {
  id: string
  name: string
  specialty: string
  description: string
  services: string[]
  avatar: string
}

export type AppointmentStatus = 'Confirmado' | 'Realizado' | 'Cancelado'

export type Appointment = {
  id: string
  name: string
  phone: string
  email: string
  serviceIds: string[]
  comboIds?: string[]
  professionalId: string
  date: string
  time: string
  status: AppointmentStatus
  createdAt: string
  cancelledAt?: string
  history: { date: string; time: string; changedAt: string }[]
}

export type Selection = {
  serviceIds: string[]
  comboIds: string[]
}

export type CatalogItem =
  | { kind: 'service'; item: Service }
  | { kind: 'combo'; item: Combo }

export type PatientFormData = {
  name: string
  phone: string
  email: string
}

export type PatientFormErrors = Partial<Record<keyof PatientFormData, string>>
