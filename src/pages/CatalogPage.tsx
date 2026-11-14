import { ArrowRight, CalendarDays, ChevronRight, Leaf, Scissors, Search, Sparkles, X, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
import { combos, services } from '../data/mockData'
import { useAppStore } from '../hooks/useAppStore'
import type { CatalogItem } from '../types'
import { selectionItemCount } from '../services/bookingService'
import { formatMoney } from '../utils/formatters'

type CatalogTab = 'servicos' | 'combos'

export default function CatalogPage() {
  const [tab, setTab] = useState<CatalogTab>('servicos')
  const [query, setQuery] = useState('')
  const { addService, addCombo, setSelection, notify, selection } = useAppStore()

  const visible = useMemo((): CatalogItem[] => {
    const list: CatalogItem[] = tab === 'servicos'
      ? services.map((item) => ({ kind: 'service', item }))
      : combos.map((item) => ({ kind: 'combo', item }))
    const searchTerm = query.toLocaleLowerCase('pt-BR')
    return list.filter(({ item }) =>
      `${item.name} ${item.description}`.toLocaleLowerCase('pt-BR').includes(searchTerm),
    )
  }, [tab, query])
  const selectedCount = selectionItemCount(selection.serviceIds, selection.comboIds)
  const selectionOrder = useMemo(() => {
    const selectedCombos = combos.filter((item) => selection.comboIds.includes(item.id))
    const comboByService = new Map(
      selectedCombos.flatMap((combo) => combo.services.map((serviceId) => [serviceId, combo.id] as const)),
    )
    const orderByItem = new Map<string, number>()
    let order = 0

    for (const serviceId of selection.serviceIds) {
      const comboId = comboByService.get(serviceId)
      if (!comboId) {
        order += 1
        orderByItem.set(`service:${serviceId}`, order)
        continue
      }

      const comboKey = `combo:${comboId}`
      let comboOrder = orderByItem.get(comboKey)
      if (comboOrder === undefined) {
        comboOrder = ++order
        orderByItem.set(comboKey, comboOrder)
      }
      orderByItem.set(`service:${serviceId}`, comboOrder)
    }

    selectedCombos.forEach((combo) => {
      const comboKey = `combo:${combo.id}`
      if (orderByItem.has(comboKey)) return
      orderByItem.set(comboKey, ++order)
    })
    return orderByItem
  }, [selection.serviceIds, selection.comboIds])

  const changeTab = (next: CatalogTab) => {
    setTab(next)
  }

  const toggleItem = (entry: CatalogItem) => {
    if (entry.kind === 'service') {
      if (!selection.serviceIds.includes(entry.item.id)) {
        addService(entry.item.id)
        return
      }

      const selectedCombos = combos.filter((combo) =>
        selection.comboIds.includes(combo.id) && combo.services.includes(entry.item.id),
      )
      const comboServiceIds = new Set(selectedCombos.flatMap((combo) => combo.services))
      setSelection({
        ...selection,
        serviceIds: selection.serviceIds.filter((id) =>
          id !== entry.item.id && !comboServiceIds.has(id),
        ),
        comboIds: selection.comboIds.filter((id) =>
          !selectedCombos.some((combo) => combo.id === id),
        ),
      })
      notify('Serviço removido da seleção.')
      return
    }

    if (!selection.comboIds.includes(entry.item.id)) {
      addCombo(entry.item.id)
      return
    }

    const comboServiceIds = new Set(entry.item.services)
    setSelection({
      ...selection,
      serviceIds: selection.serviceIds.filter((id) => !comboServiceIds.has(id)),
      comboIds: selection.comboIds.filter((id) => id !== entry.item.id),
    })
    notify('Combo removido da seleção.')
  }

  return (
    <div className="catalog-page content-width">
      <div className="page-intro">
        <div><span className="eyebrow">ORBIS</span><h1>Catálogo</h1><p>Escolha serviços e combos para você.</p></div>
      </div>
      <div className="catalog-toolbar">
        <div className="catalog-tabs" role="tablist" aria-label="Tipo de item">
          <button className={tab === 'servicos' ? 'active' : ''} onClick={() => changeTab('servicos')} role="tab" aria-selected={tab === 'servicos'}>Serviços <span>{services.length}</span></button>
          <button className={tab === 'combos' ? 'active' : ''} onClick={() => changeTab('combos')} role="tab" aria-selected={tab === 'combos'}>Combos <span>{combos.length}</span></button>
        </div>
        <div className="catalog-filters">
          <label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar no catálogo" aria-label="Buscar no catálogo" />{query && <button onClick={() => setQuery('')} aria-label="Limpar busca"><X size={14} /></button>}</label>
        </div>
      </div>
      <div className="catalog-result-line">
        <span><b>{visible.length}</b> {visible.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}</span>
        <div className="catalog-result-actions">
          <span>{selectedCount} {selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}</span>
        </div>
      </div>
      {visible.length ? (
        <div className="catalog-list" role="region" aria-label="Itens do catálogo">
          {visible.map((entry) => {
            const { item } = entry
            const CardIcon = entry.kind === 'combo'
              ? Sparkles
              : entry.item.category === 'Consultas'
                ? CalendarDays
                : entry.item.category === 'Bem-estar'
                  ? Leaf
                  : entry.item.category === 'Beleza'
                    ? Scissors
                    : entry.item.category === 'Tecnologia'
                      ? Zap
                      : Sparkles
            const meta = entry.kind === 'service'
              ? `${entry.item.duration} min`
              : `${entry.item.services.length} serviços`
            const added = entry.kind === 'service'
              ? selection.serviceIds.includes(entry.item.id)
              : selection.comboIds.includes(entry.item.id)
            const selectedOrder = selectionOrder.get(`${entry.kind}:${item.id}`)
            return (
              <button
                type="button"
                className={`catalog-list-item ${added ? 'selected' : ''}`}
                key={`${entry.kind}-${item.id}`}
                aria-pressed={added}
                onClick={() => toggleItem(entry)}
              >
                <span className="catalog-list-icon" aria-hidden="true">
                  <CardIcon size={20} />
                </span>
                <span className="catalog-list-copy">
                  <span className="catalog-list-name">{item.name}</span>
                  <span className="catalog-list-meta">{meta}</span>
                </span>
                <strong className="catalog-list-price">{formatMoney(item.price)}</strong>
                <span className="catalog-list-state" aria-hidden="true">
                  {added ? <span className="catalog-list-count">{selectedOrder ?? 1}</span> : <ChevronRight size={18} />}
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="empty-state"><Search size={25} /><h3>Nenhum resultado por aqui</h3><p>Tente buscar por outro termo.</p><button className="text-link" onClick={() => setQuery('')}>Limpar busca <ArrowRight size={15} /></button></div>
      )}
    </div>
  )
}
