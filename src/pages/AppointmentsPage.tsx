import { CalendarDays, Plus, Search, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { demoAppointments } from '../data/mockData'
import { useAppStore } from '../hooks/useAppStore'
import type { Appointment } from '../types'
import { currentTimestamp } from '../services/bookingService'
import { dateOffset } from '../utils/formatters'
import AppointmentCard from '../components/AppointmentCard'
import CancelAppointmentDialog from '../components/CancelAppointmentDialog'
import AppointmentDetailsDialog from '../components/AppointmentDetailsDialog'

const filters = ['Todos', 'Próximos', 'Realizados', 'Cancelados']

export default function AppointmentsPage() {
  const { appointments, setAppointments, notify } = useAppStore()
  const [filter, setFilter] = useState('Todos')
  const [query, setQuery] = useState('')
  const [canceling, setCanceling] = useState<Appointment | null>(null)
  const [details, setDetails] = useState<Appointment | null>(null)

  const filtered = appointments
    .filter((appointment) => {
      const text = `${appointment.id} ${appointment.name} ${appointment.phone}`.toLocaleLowerCase('pt-BR')
      const matchesText = text.includes(query.toLocaleLowerCase('pt-BR'))
      const matchesFilter = filter === 'Todos' ||
        (filter === 'Próximos' && appointment.status === 'Confirmado' && appointment.date >= dateOffset(0)) ||
        (filter === 'Realizados' && appointment.status === 'Realizado') ||
        (filter === 'Cancelados' && appointment.status === 'Cancelado')
      return matchesText && matchesFilter
    })
    .sort((a, b) => {
      const aUpcoming = a.status === 'Confirmado' && a.date >= dateOffset(0)
      const bUpcoming = b.status === 'Confirmado' && b.date >= dateOffset(0)
      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1
      return a.date.localeCompare(b.date)
    })

  const confirmCancel = () => {
    if (!canceling) return
    setAppointments(appointments.map((item) =>
      item.id === canceling.id
        ? { ...item, status: 'Cancelado', cancelledAt: currentTimestamp() }
        : item,
    ))
    notify('Agendamento cancelado. O horário foi liberado.')
    setCanceling(null)
  }

  const restoreDemo = () => {
    setAppointments(demoAppointments)
    setFilter('Todos')
    setQuery('')
    notify('Dados de demonstração restaurados.')
  }

  return (
    <div className="appointments-page content-width">
      <div className="page-intro appointment-intro">
        <div><span className="eyebrow">SEU TEMPO, SEMPRE ORGANIZADO</span><h1>Meus agendamentos</h1><p>Confira seus próximos momentos de cuidado e gerencie suas reservas.</p></div>
      </div>
      <div className="appointment-tools">
        <div className="filter-tabs">
          {filters.map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}
        </div>
        <div className="appointment-search-row">
          <label className="search-field appointment-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, telefone ou reserva" aria-label="Buscar agendamentos" /></label>
          <Link className="appointment-add" to="/agendar" aria-label="Novo agendamento"><Plus size={20} /></Link>
        </div>
      </div>
      <div className="demo-hint">
        <Sparkles size={16} />
        <span>Para testar, busque por <b>Ana Beatriz</b> ou pelo código <b>ORB-2841</b>. Os dados ficam salvos neste dispositivo.</span>
        <button onClick={restoreDemo}>Restaurar demonstração</button>
      </div>
      <div className="appointment-list">
        {filtered.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onCancel={setCanceling}
            onOpen={setDetails}
          />
        ))}
        {filtered.length === 0 && (
          <div className="empty-state appointments-empty">
            <CalendarDays size={27} /><h3>Nenhum agendamento encontrado</h3>
            <p>Tente alterar os filtros ou faça uma nova reserva.</p>
            <Link className="button button-primary" to="/agendar">Agendar horário</Link>
          </div>
        )}
      </div>
      {details && <AppointmentDetailsDialog appointment={details} onClose={() => setDetails(null)} />}
      {canceling && <CancelAppointmentDialog appointment={canceling} onClose={() => setCanceling(null)} onConfirm={confirmCancel} />}
    </div>
  )
}
