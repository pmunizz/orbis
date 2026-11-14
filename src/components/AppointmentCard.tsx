import { Clock3, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { combos, professionals, services } from '../data/mockData'
import type { Appointment } from '../types'
import { formatDate, formatMoney } from '../utils/formatters'
import { appointmentTotal, serviceDuration } from '../services/bookingService'

type Props = {
  appointment: Appointment
  onCancel: (appointment: Appointment) => void
  onOpen: (appointment: Appointment) => void
}

export default function AppointmentCard({ appointment, onCancel, onOpen }: Props) {
  const date = new Date(`${appointment.date}T12:00:00`)
  const names = appointment.serviceIds.map((id) => services.find((item) => item.id === id)?.name).filter(Boolean)
  const appointmentCombos = (appointment.comboIds ?? [])
    .map((id) => combos.find((item) => item.id === id))
    .filter(Boolean)
  const title = appointmentCombos.length > 0
    ? appointmentCombos.length === 1 ? appointmentCombos[0]?.name ?? 'Combo' : 'Múltiplos combos'
    : names.length > 1 ? 'Múltiplos serviços'
      : names[0] ?? 'Agendamento'
  const statusClass = appointment.status === 'Confirmado'
    ? 'status-confirmed'
    : appointment.status === 'Realizado'
      ? 'status-done'
      : 'status-cancelled'
  const canManage = appointment.status === 'Confirmado'

  return (
    <article className="appointment-card">
      <button
        type="button"
        className="appointment-card-open"
        aria-label={`Ver detalhes do agendamento ${appointment.id}`}
        onClick={() => onOpen(appointment)}
      />
      <div className="appointment-date">
        <span>{date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
        <b>{date.getDate()}</b>
        <small>{date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</small>
      </div>
      <div className="appointment-info">
        <div className="appointment-title-row">
          <div><span className="booking-code">{appointment.id}</span><h2>{title}</h2></div>
          <span className={`status-pill ${statusClass}`}><i />{appointment.status}</span>
        </div>
        <div className="appointment-facts">
          <span><Clock3 size={14} />{appointment.time} · {serviceDuration(appointment.serviceIds)} min</span>
          <span><UserRound size={14} />{professionals.find((item) => item.id === appointment.professionalId)?.name ?? 'Profissional'}</span>
          <span><UserRound size={14} />{appointment.name}</span>
        </div>
        <div className="appointment-card-bottom">
          <span>{appointment.id} <i /> {formatDate(appointment.date)}</span>
          <div className="appointment-actions">
            {canManage && (
              <>
                <Link className="button button-small button-quiet" to={`/agendar?reagendar=${appointment.id}`}>Reagendar</Link>
                <button className="button button-small cancel-button" onClick={() => onCancel(appointment)}>Cancelar</button>
              </>
            )}
            <b>{formatMoney(appointmentTotal(appointment))}</b>
          </div>
        </div>
      </div>
    </article>
  )
}
