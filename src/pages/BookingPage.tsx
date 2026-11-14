import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Plus, Sparkles, UserRound, X } from 'lucide-react'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { combos, professionals, services } from '../data/mockData'
import { useAppStore } from '../hooks/useAppStore'
import type { Appointment, PatientFormData, PatientFormErrors, Professional } from '../types'
import {
  calendarDays,
  createAppointmentId,
  currentTimestamp,
  dateKey,
  eligibleProfessionals,
  hasAppointmentConflict,
  selectionItemCount,
  isTimeAvailable,
  selectionTotal,
  serviceDuration,
} from '../services/bookingService'
import { dateOffset, formatDate, formatMoney, nextBusinessDate } from '../utils/formatters'
import Confirmation from '../components/Confirmation'

const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']
const steps = ['Minha seleção', 'Profissional', 'Data e horário', 'Seus dados', 'Revisão']

export default function BookingPage() {
  const [searchParams] = useSearchParams()
  const rescheduleId = searchParams.get('reagendar')
  const { appointments, selection, setSelection, setAppointments, notify, addService } = useAppStore()
  const reschedule = appointments.find((item) => item.id === rescheduleId)
  const [step, setStep] = useState(reschedule ? 2 : 1)
  const [professionalId, setProfessionalId] = useState(reschedule?.professionalId ?? '')
  const [date, setDate] = useState(reschedule?.date ?? nextBusinessDate())
  const [time, setTime] = useState('')
  const [month, setMonth] = useState(() => new Date(`${reschedule?.date ?? nextBusinessDate()}T12:00:00`))
  const [patient, setPatient] = useState<PatientFormData>({
    name: reschedule?.name ?? '',
    phone: reschedule?.phone ?? '',
    email: reschedule?.email ?? '',
  })
  const [errors, setErrors] = useState<PatientFormErrors>({})
  const [confirmed, setConfirmed] = useState<Appointment | null>(null)
  const bookingMainRef = useRef<HTMLDivElement>(null)
  const confirmationRef = useRef<HTMLDivElement>(null)
  const previousStep = useRef(step)

  useLayoutEffect(() => {
    if (previousStep.current === step) return
    previousStep.current = step

    const target = step === 6
      ? confirmationRef.current
      : bookingMainRef.current?.querySelector<HTMLElement>('.booking-panel')
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [step])

  const serviceIds = reschedule ? reschedule.serviceIds : selection.serviceIds
  const selectedCombos = reschedule
    ? combos.filter((item) => reschedule.comboIds?.includes(item.id))
    : combos.filter((item) => selection.comboIds.includes(item.id))
  const comboServiceIds = new Set(selectedCombos.flatMap((item) => item.services))
  const selectedServices = services.filter((item) =>
    serviceIds.includes(item.id) && !comboServiceIds.has(item.id),
  )
  const duration = serviceDuration(serviceIds)
  const itemCount = selectionItemCount(serviceIds, selectedCombos.map((item) => item.id))
  const total = selectionTotal(serviceIds, selectedCombos.map((item) => item.id))
  const eligible = eligibleProfessionals(serviceIds)
  const visibleCalendarDays = useMemo(() => calendarDays(month), [month])

  const availableProfessionals = professionalId === 'any'
    ? eligible
    : eligible.filter((item) => item.id === professionalId)

  const canBookSlot = (slot: string) => isTimeAvailable(
    appointments,
    availableProfessionals,
    date,
    slot,
    duration,
    reschedule,
  )

  const continueFromStep = (next: number) => {
    if (step === 1 && serviceIds.length === 0) {
      notify('Escolha pelo menos um serviço para continuar.')
      return
    }
    if (step === 2 && !professionalId) {
      notify('Selecione um profissional para continuar.')
      return
    }
    if (step === 3 && (!date || !time)) {
      notify('Escolha uma data e um horário disponíveis.')
      return
    }
    if (step === 4) {
      const nextErrors: PatientFormErrors = {}
      if (patient.name.trim().length < 3) nextErrors.name = 'Informe seu nome completo.'
      if (patient.phone.replace(/\D/g, '').length < 10) nextErrors.phone = 'Informe um telefone válido.'
      if (patient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email)) nextErrors.email = 'Confira o formato do e-mail.'
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length) return
    }
    setStep(next)
  }

  const confirmBooking = () => {
    const assigned = professionalId === 'any'
      ? eligible.find((candidate) =>
        !hasAppointmentConflict(appointments, candidate.id, date, time, duration, rescheduleId),
      )
      : professionals.find((candidate) => candidate.id === professionalId)
    if (!assigned || !canBookSlot(time)) {
      notify('Este horário acabou de ficar indisponível. Escolha outro.')
      setStep(3)
      return
    }

    const now = currentTimestamp()
    if (reschedule) {
      const updated: Appointment = {
        ...reschedule,
        professionalId: assigned.id,
        date,
        time,
        status: 'Confirmado',
        history: [...reschedule.history, { date: reschedule.date, time: reschedule.time, changedAt: now }],
      }
      setAppointments(appointments.map((item) => item.id === reschedule.id ? updated : item))
      setConfirmed(updated)
    } else {
      const appointment: Appointment = {
        id: createAppointmentId(),
        name: patient.name.trim(),
        phone: patient.phone.trim(),
        email: patient.email.trim(),
        serviceIds,
        comboIds: selectedCombos.map((item) => item.id),
        professionalId: assigned.id,
        date,
        time,
        status: 'Confirmado',
        createdAt: now,
        history: [],
      }
      setAppointments([appointment, ...appointments])
      setConfirmed(appointment)
      setSelection({ serviceIds: [], comboIds: [] })
    }
    setStep(6)
  }

  if (step === 6 && confirmed) {
    return (
      <div ref={confirmationRef}>
        <Confirmation appointment={confirmed} reschedule={Boolean(reschedule)} />
      </div>
    )
  }

  return (
    <div className={`booking-page content-width ${reschedule ? 'booking-reschedule' : ''}`}>
      {reschedule && <div className="booking-heading booking-heading-reschedule"><h1>Reagendar horário</h1><p>Escolha uma nova data e horário para sua reserva.</p></div>}
      <div className="booking-layout">
        <div className="booking-main" ref={bookingMainRef}>
          <div className="stepper">
            {steps.map((label, index) => (
              <button
                key={label}
                className={`stepper-item ${step === index + 1 ? 'current' : ''} ${step > index + 1 ? 'done' : ''}`}
                onClick={() => { if (index + 1 < step) setStep(index + 1) }}
                disabled={index + 1 > step || Boolean(reschedule && index === 0)}
              >
                <span>{step > index + 1 ? <Check size={14} /> : index + 1}</span><small>{label}</small>
              </button>
            ))}
          </div>
          {step === 1 && (
            <div className="booking-selection-step">
              <SelectionStep
                serviceIds={serviceIds}
                selectedServices={selectedServices}
                selectedCombos={selectedCombos}
                onRemoveService={(serviceId) => setSelection({
                  ...selection,
                  serviceIds: selection.serviceIds.filter((id) => id !== serviceId),
                  comboIds: selection.comboIds.filter((id) =>
                    !combos.find((combo) => combo.id === id)?.services.includes(serviceId),
                  ),
                })}
                onRemoveCombo={(comboId) => {
                  const combo = combos.find((item) => item.id === comboId)
                  setSelection({
                    ...selection,
                    serviceIds: selection.serviceIds.filter((id) => !combo?.services.includes(id)),
                    comboIds: selection.comboIds.filter((id) => id !== comboId),
                  })
                }}
                onAddService={addService}
                onContinue={() => continueFromStep(2)}
              />
            </div>
          )}
          {step === 2 && (
            <ProfessionalStep
              professionalId={professionalId}
              eligible={eligible}
              onSelect={setProfessionalId}
              onBack={() => setStep(1)}
              onContinue={() => continueFromStep(3)}
            />
          )}
          {step === 3 && (
            <CalendarStep
              date={date}
              month={month}
              duration={duration}
              days={visibleCalendarDays}
              available={canBookSlot}
              time={time}
              onMonthChange={setMonth}
              onDateSelect={(value) => { setDate(value); setTime('') }}
              onTimeSelect={setTime}
              onBack={() => setStep(2)}
              onContinue={() => continueFromStep(4)}
            />
          )}
          {step === 4 && (
            <PatientStep
              patient={patient}
              errors={errors}
              onChange={setPatient}
              onBack={() => setStep(3)}
              onContinue={() => continueFromStep(5)}
            />
          )}
          {step === 5 && (
            <ReviewStep
              selectedServices={selectedServices}
              selectedCombos={selectedCombos}
              total={total}
              duration={duration}
              professionalId={professionalId}
              patient={patient}
              date={date}
              time={time}
              reschedule={reschedule}
              itemCount={itemCount}
              onStepChange={setStep}
              onConfirm={confirmBooking}
            />
          )}
        </div>
        <BookingSummary
          selectedServices={selectedServices}
          selectedCombos={selectedCombos}
          itemCount={itemCount}
          duration={duration}
          total={total}
        />
      </div>
    </div>
  )
}

function SelectionStep({
  serviceIds,
  selectedServices,
  selectedCombos,
  onRemoveService,
  onRemoveCombo,
  onAddService,
  onContinue,
}: {
  serviceIds: string[]
  selectedServices: typeof services
  selectedCombos: typeof combos
  onRemoveService: (serviceId: string) => void
  onRemoveCombo: (comboId: string) => void
  onAddService: (serviceId: string) => void
  onContinue: () => void
}) {
  const { selection } = useAppStore()
  const suggestedServices = services.filter((item) => !serviceIds.includes(item.id)).slice(0, 2)
  return (
    <section className="booking-panel">
      <PanelHeading step="01" title="Seu agendamento" text="Confira os serviços e combos escolhidos." />
      {selectedServices.length > 0 || selectedCombos.length > 0 ? (
        <div className="booking-service-list">
          {selectedCombos.map((item) => (
            <div className="booking-service-row" key={item.id}>
              <span className="booking-service-icon" aria-hidden="true"><Sparkles size={17} /></span>
              <div><b>{item.name}</b><small>{item.services.length} serviços</small></div>
              <strong>{formatMoney(item.price)}</strong>
              <button aria-label={`Remover combo ${item.name}`} onClick={() => onRemoveCombo(item.id)}><X size={16} /></button>
            </div>
          ))}
          {selectedServices.map((item) => (
            <div className="booking-service-row" key={item.id}>
              <span className="booking-service-icon" aria-hidden="true"><Sparkles size={17} /></span>
              <div><b>{item.name}</b><small><Clock3 size={13} /> {item.duration} min</small></div>
              <strong>{formatMoney(item.price)}</strong>
              <button aria-label={`Remover ${item.name}`} onClick={() => onRemoveService(item.id)}><X size={16} /></button>
            </div>
          ))}
        </div>
      ) : (
        <div className="booking-empty"><Sparkles size={22} /><p>Ainda não há serviços na sua seleção.</p><Link className="text-link" to="/catalogo">Explorar catálogo <ArrowRight size={15} /></Link></div>
      )}
      <div className="booking-add-more">
        <div className="booking-add-more-heading">
          <b>Quer incluir mais algum cuidado?</b>
          <p>Adicione outro serviço à sua seleção com um toque.</p>
        </div>
        <div className="booking-upsell-grid">
          {suggestedServices.map((item) => (
            <button className="booking-upsell-card" key={item.id} onClick={() => onAddService(item.id)}>
              <span className="booking-upsell-icon"><Sparkles size={16} /></span>
              <span className="booking-upsell-copy"><b>{item.name}</b><small>{item.duration} min · {formatMoney(item.price)}</small></span>
              <Plus size={16} />
            </button>
          ))}
        </div>
        <Link className="text-link" to="/catalogo"><Plus size={14} /> Adicionar serviço ou combo</Link>
      </div>
      <div className="panel-actions">
        <Link className="button button-quiet" to="/catalogo">Voltar ao catálogo</Link>
        <button className="button button-primary" disabled={!serviceIds.length} onClick={onContinue}>Continuar <ArrowRight size={16} /></button>
      </div>
      {selection.comboIds.length > 0 && <span className="sr-only">{selection.comboIds.length} combos selecionados</span>}
    </section>
  )
}

function ProfessionalStep({
  professionalId,
  eligible,
  onSelect,
  onBack,
  onContinue,
}: {
  professionalId: string
  eligible: Professional[]
  onSelect: (id: string) => void
  onBack: () => void
  onContinue: () => void
}) {
  return (
    <section className="booking-panel">
      <PanelHeading step="02" title="Com quem você quer se cuidar?" text="Profissionais que realizam todos os serviços da sua seleção." />
      <div className="professional-options">
        <button className={`professional-card any-pro ${professionalId === 'any' ? 'selected' : ''}`} onClick={() => onSelect('any')}>
          <span className="pro-avatar any-avatar"><Sparkles size={21} /></span>
          <span><b>Qualquer profissional</b><small>Encontre o primeiro horário disponível</small></span>
          {professionalId === 'any' && <CheckCircle2 size={19} />}
        </button>
        {eligible.map((professional) => (
          <button key={professional.id} className={`professional-card ${professionalId === professional.id ? 'selected' : ''}`} onClick={() => onSelect(professional.id)}>
            <span className="pro-avatar">{professional.avatar}</span>
            <span><b>{professional.name}</b><small>{professional.specialty}</small><small className="pro-description">{professional.description}</small></span>
            {professionalId === professional.id && <CheckCircle2 size={19} />}
          </button>
        ))}
      </div>
      {!eligible.length && <div className="inline-warning">Não encontramos um profissional para todos os serviços. Ajuste sua seleção no passo anterior.</div>}
      <div className="panel-actions"><button className="button button-quiet" onClick={onBack}><ArrowLeft size={16} /> Voltar</button><button className="button button-primary" disabled={!professionalId || !eligible.length} onClick={onContinue}>Escolher horário <ArrowRight size={16} /></button></div>
    </section>
  )
}

function CalendarStep({
  date,
  month,
  duration,
  days,
  available,
  time,
  onMonthChange,
  onDateSelect,
  onTimeSelect,
  onBack,
  onContinue,
}: {
  date: string
  month: Date
  duration: number
  days: ReturnType<typeof calendarDays>
  available: (time: string) => boolean
  time: string
  onMonthChange: (month: Date) => void
  onDateSelect: (date: string) => void
  onTimeSelect: (time: string) => void
  onBack: () => void
  onContinue: () => void
}) {
  return (
    <section className="booking-panel">
      <PanelHeading step="03" title="Qual o melhor dia para você?" text="Horários de segunda a sábado, das 9h às 18h." />
      <div className="calendar-toolbar">
        <button aria-label="Mês anterior" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={19} /></button>
        <b>{month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</b>
        <button aria-label="Próximo mês" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={19} /></button>
      </div>
      <div className="calendar-grid">
        <div className="calendar-weekdays">{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
        <div className="calendar-days">
          {days.map((day, index) => {
            const key = day ? dateKey(day) : ''
            const disabled = !day || key <= dateOffset(0) || day.getDay() === 0
            return day
              ? <button key={key} className={`${date === key ? 'selected' : ''} ${disabled ? 'disabled' : ''}`} disabled={disabled} onClick={() => onDateSelect(key)} aria-label={day.toLocaleDateString('pt-BR', { dateStyle: 'full' })}>{day.getDate()}</button>
              : <span className="calendar-blank" key={`blank-${index}`} />
          })}
        </div>
      </div>
      <div className="calendar-legend"><span><i className="legend-dot available-dot" />Disponível</span><span><i className="legend-dot selected-dot" />Selecionado</span><span><i className="legend-dot unavailable-dot" />Indisponível</span></div>
      <div className="slot-heading"><div><h3>Horários disponíveis</h3><span>{formatDate(date)}</span></div><span><Clock3 size={14} /> Duração: {duration} min</span></div>
      <div className="slot-grid">
        {timeSlots.map((slot) => <button key={slot} className={`time-slot ${time === slot ? 'selected' : ''}`} disabled={!available(slot)} onClick={() => onTimeSelect(slot)}>{slot}</button>)}
      </div>
      <div className="panel-actions"><button className="button button-quiet" onClick={onBack}><ArrowLeft size={16} /> Voltar</button><button className="button button-primary" disabled={!time} onClick={onContinue}>Continuar <ArrowRight size={16} /></button></div>
    </section>
  )
}

function PatientStep({
  patient,
  errors,
  onChange,
  onBack,
  onContinue,
}: {
  patient: PatientFormData
  errors: PatientFormErrors
  onChange: (patient: PatientFormData) => void
  onBack: () => void
  onContinue: () => void
}) {
  return (
    <section className="booking-panel">
      <PanelHeading step="04" title="Como podemos te chamar?" text="Seus dados são usados apenas para confirmar o agendamento." />
      <div className="patient-form">
        <label>Nome completo <span>*</span><input value={patient.name} onChange={(event) => onChange({ ...patient, name: event.target.value })} placeholder="Ex.: Ana Beatriz Oliveira" autoComplete="name" />{errors.name && <small className="field-error">{errors.name}</small>}</label>
        <label>Telefone <span>*</span><input type="tel" value={patient.phone} onChange={(event) => onChange({ ...patient, phone: event.target.value })} placeholder="(11) 99999-9999" autoComplete="tel" />{errors.phone && <small className="field-error">{errors.phone}</small>}</label>
        <label>E-mail <small className="optional">(opcional)</small><input type="email" value={patient.email} onChange={(event) => onChange({ ...patient, email: event.target.value })} placeholder="voce@email.com" autoComplete="email" />{errors.email && <small className="field-error">{errors.email}</small>}</label>
        <div className="privacy-note"><CheckCircle2 size={17} /><span>Seus dados ficam protegidos e não serão compartilhados.</span></div>
      </div>
      <div className="panel-actions"><button className="button button-quiet" onClick={onBack}><ArrowLeft size={16} /> Voltar</button><button className="button button-primary" onClick={onContinue}>Revisar agendamento <ArrowRight size={16} /></button></div>
    </section>
  )
}

function ReviewStep({
  selectedServices,
  selectedCombos,
  total,
  duration,
  professionalId,
  patient,
  date,
  time,
  reschedule,
  itemCount,
  onStepChange,
  onConfirm,
}: {
  selectedServices: typeof services
  selectedCombos: typeof combos
  total: number
  duration: number
  professionalId: string
  patient: PatientFormData
  date: string
  time: string
  reschedule?: Appointment
  itemCount: number
  onStepChange: (step: number) => void
  onConfirm: () => void
}) {
  return (
    <section className="booking-panel">
      <PanelHeading step="05" title="Confira seu momento." text="Está tudo certo? Você pode voltar para ajustar qualquer detalhe." />
      <div className="review-block">
        <div className="review-section-title"><Sparkles size={16} /><b>Seu cuidado</b><button onClick={() => onStepChange(1)}>Editar</button></div>
        {selectedCombos.map((item) => <div className="review-line" key={item.id}><span>Combo: {item.name} <small>{item.services.length} serviços</small></span><b>{formatMoney(item.price)}</b></div>)}
        {selectedServices.map((item) => <div className="review-line" key={item.id}><span>{item.name} <small>{item.duration} min</small></span><b>{formatMoney(item.price)}</b></div>)}
        <div className="review-section-title border-top"><UserRound size={16} /><b>Seu profissional</b><button onClick={() => onStepChange(2)}>Editar</button></div>
        <div className="review-line"><span>{professionalId === 'any' ? 'Qualquer profissional disponível' : professionals.find((item) => item.id === professionalId)?.name}</span></div>
        <div className="review-section-title border-top"><CalendarDays size={16} /><b>Data e horário</b><button onClick={() => onStepChange(3)}>Editar</button></div>
        {reschedule && <div className="review-line"><span>Data anterior</span><b>{formatDate(reschedule.date)} às {reschedule.time}</b></div>}
        <div className="review-line"><span>{reschedule ? 'Nova data' : 'Data selecionada'} · {formatDate(date)} às {time}</span><span>{duration} min</span></div>
        {!reschedule && <><div className="review-section-title border-top"><UserRound size={16} /><b>Seus dados</b><button onClick={() => onStepChange(4)}>Editar</button></div><div className="review-line"><span>{patient.name} · {patient.phone}</span></div></>}
        <div className="review-total"><span>Total</span><strong>{formatMoney(total)}</strong></div>
      </div>
      <div className="panel-actions"><button className="button button-quiet" onClick={() => onStepChange(reschedule ? 3 : 4)}><ArrowLeft size={16} /> Voltar</button><button className="button button-primary" onClick={onConfirm}>{reschedule ? 'Confirmar reagendamento' : 'Confirmar agendamento'} <Check size={16} /></button></div>
      <span className="sr-only">
        {itemCount === 1 ? '1 item selecionado' : `${itemCount} itens selecionados`}
      </span>
    </section>
  )
}

function BookingSummary({
  selectedServices,
  selectedCombos,
  itemCount,
  duration,
  total,
}: {
  selectedServices: typeof services
  selectedCombos: typeof combos
  itemCount: number
  duration: number
  total: number
}) {
  return (
    <aside className="booking-summary">
      <div className="booking-summary-heading"><h3>Sua seleção</h3><span>{itemCount} {itemCount === 1 ? 'item' : 'itens'}</span></div>
      <div className="booking-summary-meta"><Clock3 size={15} /> {duration} min</div>
      <div className="summary-total"><span>Total estimado</span><strong>{formatMoney(total)}</strong></div>
      <details className="booking-summary-details">
        <summary>Ver itens</summary>
        {selectedCombos.map((item) => <div className="summary-service" key={item.id}><span>{item.name}<small>Combo · {item.services.length} serviços</small></span><b>{formatMoney(item.price)}</b></div>)}
        {selectedServices.map((item) => <div className="summary-service" key={item.id}><span>{item.name}<small>{item.duration} min</small></span><b>{formatMoney(item.price)}</b></div>)}
      </details>
    </aside>
  )
}

function PanelHeading({ step, title, text }: { step: string; title: string; text: string }) {
  return <div className="panel-heading"><span>ETAPA {step}</span><h2>{title}</h2><p>{text}</p></div>
}
