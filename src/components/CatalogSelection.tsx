import { Check, Clock3, Plus, UserRound, X } from 'lucide-react'
import { professionals, services } from '../data/mockData'
import { useAppStore } from '../hooks/useAppStore'
import type { CatalogItem } from '../types'
import { formatMoney } from '../utils/formatters'

export function DetailDialog({
  entry,
  onClose,
  onAdd,
}: {
  entry: CatalogItem
  onClose: () => void
  onAdd: () => void
}) {
  const { selection } = useAppStore()
  const title = entry.item.name
  const description = entry.kind === 'service' ? entry.item.fullDescription : entry.item.description
  const added = entry.kind === 'service'
    ? selection.serviceIds.includes(entry.item.id)
    : entry.kind === 'combo' && selection.comboIds.includes(entry.item.id)
  const includedServices = entry.kind === 'combo'
    ? entry.item.services.map((id) => services.find((service) => service.id === id)?.name).filter(Boolean)
    : []

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="detail-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <button className="dialog-close" onClick={onClose} aria-label="Fechar"><X size={19} /></button>
        <div className="detail-content">
          <span className="eyebrow">{entry.kind === 'combo' ? 'COMBO ESPECIAL' : entry.item.category}</span>
          <h2 id="detail-title">{title}</h2>
          <p>{description}</p>
          {entry.kind === 'service' && (
            <div className="detail-facts">
              <span><Clock3 size={16} />{entry.item.duration} minutos</span>
              <span><UserRound size={16} />{entry.item.professionals.map((id) => professionals.find((pro) => pro.id === id)?.name.split(' ')[0]).join(', ')}</span>
            </div>
          )}
          {entry.kind === 'combo' && (
            <div className="combo-includes">
              <b>Inclui</b>
              {includedServices.map((name) => <span key={name}><Check size={14} />{name}</span>)}
            </div>
          )}
          <div className="detail-bottom">
            <strong>{formatMoney(entry.item.price)}</strong>
            <button className="button button-primary" onClick={onAdd}>
              {added ? 'Já está na seleção' : 'Adicionar à seleção'}
              {!added && <Plus size={16} />}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
