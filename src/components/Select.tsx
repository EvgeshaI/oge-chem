import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export interface SelectOption {
  value: string
  label: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  disabled?: boolean
  'aria-label': string
  /** Классы кнопки (рамка, фон, отступы, размер шрифта) */
  className?: string
}

const LIST_MAX = 256 // px, соответствует max-h-64

/**
 * Собственный выпадающий список (вместо системного <select>), одинаковый во всех браузерах.
 * Паттерн ARIA: combobox + listbox, фокус остаётся на кнопке (aria-activedescendant).
 * Клавиатура: ↑ ↓ Home End — перемещение, Enter / Пробел — выбор, Esc — закрыть, буква — быстрый переход.
 */
export function Select({ value, onChange, options, disabled = false, className = '', 'aria-label': ariaLabel }: Props) {
  const uid = useId()
  const listId = `${uid}-list`
  const btnRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [openRaw, setOpen] = useState(false)
  const open = openRaw && !disabled // заблокированный список всегда закрыт
  const [active, setActive] = useState(0)
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number; minWidth: number } | null>(null)

  const selectedIdx = Math.max(0, options.findIndex((o) => o.value === value))
  const selected = options[selectedIdx]

  const place = useCallback(() => {
    const el = btnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const below = window.innerHeight - r.bottom
    const above = r.top
    const flip = below < Math.min(LIST_MAX, options.length * 36 + 12) && above > below
    const maxLeft = Math.max(8, window.innerWidth - r.width - 8)
    setPos({
      left: Math.min(r.left, maxLeft),
      minWidth: r.width,
      ...(flip ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }),
    })
  }, [options.length])

  const openList = () => {
    if (disabled) return
    setActive(selectedIdx)
    setOpen(true)
  }
  const close = () => setOpen(false)
  const choose = (i: number) => {
    const o = options[i]
    if (o) onChange(o.value)
    close()
  }

  // позиционирование и слежение за прокруткой/ресайзом
  useLayoutEffect(() => {
    if (!open) return
    place()
    // прокрутка самого списка не должна пересчитывать позицию (на телефонах это ломало скролл)
    const onScroll = (e: Event) => {
      if (e.target instanceof Node && listRef.current?.contains(e.target)) return
      place()
    }
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', place)
    }
  }, [open, place])

  // закрытие по клику вне списка
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t) || listRef.current?.contains(t)) return
      close()
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  // активный пункт виден при открытии списка и при переходе с клавиатуры.
  // При наведении мыши и прокрутке пальцем не двигаем список — иначе он «отскакивает».
  const byKeyboard = useRef(false)
  const placed = pos !== null
  useEffect(() => {
    if (!open || !placed) return
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
    byKeyboard.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, placed])
  useEffect(() => {
    if (!open || !byKeyboard.current) return
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
    byKeyboard.current = false
  }, [open, active])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    const last = options.length - 1
    byKeyboard.current = true
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        openList()
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setActive((a) => Math.min(last, a + 1)); break
      case 'ArrowUp': e.preventDefault(); setActive((a) => Math.max(0, a - 1)); break
      case 'Home': e.preventDefault(); setActive(0); break
      case 'End': e.preventDefault(); setActive(last); break
      case 'Enter':
      case ' ': e.preventDefault(); choose(active); break
      case 'Escape': e.preventDefault(); close(); break
      case 'Tab': close(); break
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const ch = e.key.toLowerCase()
          const from = active + 1
          const order = [...options.keys()].map((_, k) => (from + k) % options.length)
          const hit = order.find((i) => options[i].label.toLowerCase().startsWith(ch))
          if (hit !== undefined) setActive(hit)
        }
    }
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${uid}-opt-${active}` : undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        className={`inline-flex items-center gap-2 text-left font-semibold text-navy transition-[border-color,box-shadow] enabled:hover:border-purple focus-visible:border-purple focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple/25 disabled:opacity-90 ${open ? 'border-purple ring-4 ring-purple/25' : ''} ${className}`}
      >
        {/* невидимые подписи всех пунктов — ширина кнопки по самому длинному, без «прыжков» */}
        <span className="grid">
          {options.map((o) => (
            <span key={o.value} aria-hidden className="invisible col-start-1 row-start-1 whitespace-nowrap">{o.label}</span>
          ))}
          <span className="col-start-1 row-start-1 whitespace-nowrap">{selected?.label}</span>
        </span>
        {!disabled && (
          <svg aria-hidden width="12" height="8" viewBox="0 0 12 8" fill="none" className={`shrink-0 text-purple transition-transform ${open ? 'rotate-180' : ''}`}>
            <path d="M1 1.5l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      {open && pos &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            // не забираем фокус у кнопки
            onMouseDown={(e) => e.preventDefault()}
            style={{ touchAction: 'pan-y', position: 'fixed', left: pos.left, top: pos.top, bottom: pos.bottom, minWidth: pos.minWidth, maxHeight: LIST_MAX }}
            className="z-50 overflow-auto overscroll-contain [-webkit-overflow-scrolling:touch] rounded-xl border-2 border-navy/15 bg-white p-1 text-base shadow-[0_12px_28px_-8px_rgb(27_36_69/0.3)]"
          >
            {options.map((o, i) => {
              const isSel = o.value === value
              return (
                <li
                  key={o.value}
                  id={`${uid}-opt-${i}`}
                  role="option"
                  aria-selected={isSel}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(i)}
                  className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 ${
                    isSel ? 'bg-purple font-semibold text-white' : i === active ? 'bg-purple/10 text-ink' : 'text-ink'
                  }`}
                >
                  {o.label}
                </li>
              )
            })}
          </ul>,
          document.body,
        )}
    </>
  )
}
