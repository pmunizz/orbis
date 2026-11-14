import { Trash2, X } from 'lucide-react'
import { professionals, services } from '../data/mockData'
import type { Appointment } from '../types'
import { formatDate } from '../utils/formatters'

type Props = {
  appointment: Appointment
  onClose: () => void
  onConfirm: () => void
}

export default function CancelAppointmentDialog({ appointment, onClose, onConfirm }: Props) {
  const serviceNames = appointment.serviceIds
    .map((id) => services.find((item) => item.id === id)?.name)
    .filter(Boolean)

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="cancel-dialog" role="alertdialog" aria-modal="true" aria-labelledby="cancel-title">
        <button className="dialog-close" onClick={onClose} aria-label="Fechar"><X size={19} /></button>
        <span className="cancel-icon"><Trash2 size={21} /></span>
        <span className="eyebrow">CANCELAR RESERVA {appointment.id}</span>
        <h2 id="cancel-title">Tem certeza de que deseja cancelar?</h2>
        <p>Este horário será liberado para outras pessoas.</p>
        <div className="cancel-summary">
          <span>{formatDate(appointment.date)} às {appointment.time}</span>
          <b>{professionals.find((item) => item.id === appointment.professionalId)?.name}</b>
          <span>{serviceNames.join(', ')}</span>
        </div>
        <div className="dialog-actions">
          <button className="button button-quiet" onClick={onClose}>Manter agendamento</button>
          <button className="button button-danger" onClick={onConfirm}>Confirmar cancelamento</button>
        </div>
      </section>
    </div>
  )
}
