import { ArrowRight, CalendarDays, Check, Sparkles, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { professionals, services } from '../data/mockData'
import type { Appointment } from '../types'
import { formatDate } from '../utils/formatters'

export default function Confirmation({ appointment, reschedule }: { appointment: Appointment; reschedule: boolean }) {
  const professional = professionals.find((item) => item.id === appointment.professionalId)
  const serviceNames = appointment.serviceIds
    .map((id) => services.find((item) => item.id === id)?.name)
    .filter(Boolean)

  return (
    <div className="confirmation-page content-width">
      <div className="confirmation-card">
        <span className="confirmation-mark"><Check size={29} /></span>
        <span className="eyebrow">{reschedule ? 'HORÁRIO ATUALIZADO' : 'TUDO PRONTO'}</span>
        <h1>{reschedule ? 'Seu novo momento está confirmado.' : 'Seu momento está reservado.'}</h1>
        <p>{reschedule ? 'Atualizamos sua reserva. Esperamos você no novo horário.' : 'Que bom que você escolheu cuidar de si. Esperamos você em breve.'}</p>
        <div className="confirmation-id">RESERVA <b>{appointment.id}</b></div>
        <div className="confirmation-details">
          <div><CalendarDays size={18} /><span><small>Data e horário</small><b>{formatDate(appointment.date)} · {appointment.time}</b></span></div>
          <div><UserRound size={18} /><span><small>Profissional</small><b>{professional?.name}</b></span></div>
          <div><Sparkles size={18} /><span><small>Seu cuidado</small><b>{serviceNames.join(', ')}</b></span></div>
        </div>
        <div className="confirmation-actions">
          <Link className="button button-primary" to="/agendamentos">Ver meus agendamentos <ArrowRight size={16} /></Link>
          <Link className="button button-quiet" to="/">Voltar ao início</Link>
        </div>
      </div>
    </div>
  )
}
