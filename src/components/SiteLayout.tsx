import { ArrowRight, ArrowUpRight, CalendarDays, CheckCircle2, LayoutGrid, Plus, ShoppingBag, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { combos, services } from '../data/mockData'
import { useAppStore } from '../hooks/useAppStore'
import { selectionItemCount, selectionTotal } from '../services/bookingService'
import { formatMoney } from '../utils/formatters'
import AppointmentsPage from '../pages/AppointmentsPage'
import BookingPage from '../pages/BookingPage'
import CatalogPage from '../pages/CatalogPage'
import NotFoundPage from './NotFoundPage'

export function Logo() {
  return (
    <Link className="brand" to="/" aria-label="Orbis — catálogo">
      <span className="brand-mark"><CalendarDays size={20} strokeWidth={2.2} /></span>
      <span className="brand-name">orbis</span>
    </Link>
  )
}

function Header() {
  const { selection } = useAppStore()
  const location = useLocation()
  const count = selectionItemCount(selection.serviceIds, selection.comboIds)
  const selectionSignature = [
    selection.serviceIds.join(','),
    selection.comboIds.join(','),
  ].join('|')
  const [manualPreviewOpen, setManualPreviewOpen] = useState(false)
  const [dismissedSelectionSignature, setDismissedSelectionSignature] = useState<string | null>(selectionSignature)
  const previousSelectionSignature = useRef(selectionSignature)
  useEffect(() => {
    if (previousSelectionSignature.current === selectionSignature) return
    previousSelectionSignature.current = selectionSignature
    setDismissedSelectionSignature(null)
  }, [selectionSignature])
  const previewOpen = location.pathname === '/' && (
      manualPreviewOpen || (count > 0 && selectionSignature !== dismissedSelectionSignature)
  )
  const selectedCombos = combos.filter((item) => selection.comboIds.includes(item.id))
  const comboServiceIds = new Set(selectedCombos.flatMap((item) => item.services))
  const selectedServices = services.filter((item) =>
    selection.serviceIds.includes(item.id) && !comboServiceIds.has(item.id),
  )
  const total = selectionTotal(selection.serviceIds, selection.comboIds)
  const closePreview = () => {
    setManualPreviewOpen(false)
    setDismissedSelectionSignature(selectionSignature)
  }
  const togglePreview = () => {
    if (previewOpen) closePreview()
    else setManualPreviewOpen(true)
  }

  return (
    <>
      <header className={`site-header ${previewOpen ? 'selection-open' : ''}`}>
        <div className="header-inner">
          <Logo />
          <nav className="main-nav" aria-label="Navegação principal">
            <NavLink to="/" end onClick={closePreview}>Catálogo</NavLink>
            <NavLink to="/agendamentos" onClick={closePreview}>Meus agendamentos</NavLink>
            <Link className="button button-primary header-cta" to="/agendar" onClick={closePreview}>
              Agendar horário <ArrowUpRight size={16} />
            </Link>
          </nav>
          <div className="header-controls">
            <div
              className="header-bag-wrap"
              onMouseEnter={() => setManualPreviewOpen(true)}
              onMouseLeave={(event) => {
                const nextTarget = event.relatedTarget
                if (!(nextTarget instanceof Node) || !event.currentTarget.parentElement?.contains(nextTarget)) closePreview()
              }}
              onFocus={() => setManualPreviewOpen(true)}
              onBlur={(event) => {
                const nextTarget = event.relatedTarget
                if (!(nextTarget instanceof Node) || !event.currentTarget.parentElement?.contains(nextTarget)) closePreview()
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') closePreview()
              }}
            >
              <button
                type="button"
                className="header-bag"
                aria-label={`Abrir carrinho, ${count} ${count === 1 ? 'item' : 'itens'}`}
                aria-haspopup="dialog"
                aria-expanded={previewOpen}
                onClick={togglePreview}
              >
                <ShoppingBag size={19} /><span className="header-bag-count">{count}</span>
              </button>
              {previewOpen && (
                <div className="selection-popover" role="dialog" aria-label="Carrinho">
                  <div className="selection-popover-heading">
                    <span><b>Seu carrinho</b><small>{count} {count === 1 ? 'item' : 'itens'}</small></span>
                    <div className="selection-popover-heading-actions">
                      <strong>{formatMoney(total)}</strong>
                      <button type="button" className="selection-popover-close" aria-label="Fechar resumo" onClick={closePreview}><X size={16} /></button>
                    </div>
                  </div>
                  {count ? (
                    <div className="selection-preview-list">
                      {selectedCombos.map((item) => (
                        <div className="selection-preview-item" key={item.id}>
                          <span>{item.name}<small>Combo</small></span><b>{formatMoney(item.price)}</b>
                        </div>
                      ))}
                      {selectedServices.map((item) => (
                        <div className="selection-preview-item" key={item.id}>
                          <span>{item.name}<small>Serviço · {item.duration} min</small></span><b>{formatMoney(item.price)}</b>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="selection-popover-empty">Seu carrinho está vazio. Explore o catálogo para escolher algo.</p>
                  )}
                  {count ? (
                    <Link className="button button-primary selection-preview-continue" to="/agendar" onClick={closePreview}>
                      Continuar <ArrowRight size={15} />
                    </Link>
                  ) : (
                    <Link className="text-link selection-preview-explore" to="/" onClick={closePreview}>
                      Explorar catálogo <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <nav className="mobile-bottom-nav" aria-label="Navegação principal">
        <NavLink to="/" end onClick={closePreview}><LayoutGrid size={19} /><span>Catálogo</span></NavLink>
        <NavLink to="/agendamentos" onClick={closePreview}><CalendarDays size={19} /><span>Agendamentos</span></NavLink>
        <NavLink
          className="mobile-booking-link"
          to="/agendar"
          onClick={closePreview}
          aria-label={count
            ? `Continuar com ${count} ${count === 1 ? 'item selecionado' : 'itens selecionados'}`
            : 'Agendar horário'}
        >
          <span className="mobile-booking-icon">{count ? <ArrowRight size={18} /> : <Plus size={18} />}</span>
          <span>{count ? `Continuar (${count})` : 'Agendar'}</span>
        </NavLink>
      </nav>
    </>
  )
}

export default function SiteLayout() {
  const { notice } = useAppStore()
  return (
    <>
      <Header />
      {notice && <div className="toast" role="status"><CheckCircle2 size={18} />{notice}</div>}
      <main>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/catalogo" element={<Navigate to="/" replace />} />
          <Route path="/agendar" element={<BookingPage />} />
          <Route path="/agendamentos" element={<AppointmentsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  )
}
