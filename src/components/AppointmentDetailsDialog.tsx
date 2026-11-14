import { CalendarDays, Clock3, Sparkles, UserRound, X } from 'lucide-react'
import { combos, professionals, services } from '../data/mockData'
import type { Appointment } from '../types'
import { appointmentTotal, serviceDuration } from '../services/bookingService'
import { formatDate, formatMoney } from '../utils/formatters'

type Props = {
  appointment: Appointment
  onClose: () => void
}

export default function AppointmentDetailsDialog({ appointment, onClose }: Props) {
  const comboItems = (appointment.comboIds ?? [])
    .map((id) => combos.find((item) => item.id === id))
    .filter((item) => item !== undefined)
  const comboServiceIds = new Set(comboItems.flatMap((item) => item.services))
  const serviceItems = appointment.serviceIds
    .map((id) => services.find((item) => item.id === id))
    .filter((item) => item !== undefined)
    .filter((item) => !comboServiceIds.has(item.id))
  const professional = professionals.find((item) => item.id === appointment.professionalId)
  const statusClass = appointment.status === 'Confirmado'
    ? 'status-confirmed'
    : appointment.status === 'Realizado'
      ? 'status-done'
      : 'status-cancelled'

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="appointment-details-dialog" role="dialog" aria-modal="true" aria-labelledby="appointment-details-title">
        <button className="dialog-close" onClick={onClose} aria-label="Fechar"><X size={19} /></button>
        <div className="appointment-details-header">
          <span className="eyebrow">RESERVA {appointment.id}</span>
          <span className={`status-pill ${statusClass}`}><i />{appointment.status}</span>
        </div>
        <h2 id="appointment-details-title">Detalhes do agendamento</h2>
        <div className="appointment-details-facts">
          <div><CalendarDays size={18} /><span><small>Data</small><b>{formatDate(appointment.date)}</b></span></div>
          <div><Clock3 size={18} /><span><small>Horário e duração</small><b>{appointment.time} · {serviceDuration(appointment.serviceIds)} min</b></span></div>
          <div><UserRound size={18} /><span><small>Profissional</small><b>{professional?.name ?? 'Profissional não informado'}</b></span></div>
        </div>
        <div className="appointment-details-items">
          <h3>Serviços e combos</h3>
          {comboItems.map((item) => (
            <div className="appointment-detail-item" key={item.id}>
              <Sparkles size={16} /><span>Combo: {item.name}</span><b>{formatMoney(item.price)}</b>
            </div>
          ))}
          {serviceItems.map((item) => (
            <div className="appointment-detail-item" key={item.id}>
              <Sparkles size={16} /><span>{item.name}</span><b>{item.duration} min</b>
            </div>
          ))}
        </div>
        <div className="appointment-details-client">
          <span>Cliente</span>
          <b>{appointment.name}</b>
          <span>{appointment.phone}</span>
        </div>
        <div className="appointment-details-total">
          <span>Total</span><strong>{formatMoney(appointmentTotal(appointment))}</strong>
        </div>
      </section>
    </div>
  )
}
