import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import menu from './Select.menu.module.css';
import { readSelectItems, type SelectItem } from './select-items';

interface SelectMenuProps {
  native: HTMLSelectElement;
  anchor: HTMLElement;
  onPick: (value: string) => void;
  onClose: () => void;
}

const MAX_HEIGHT = 280;

function enabledIndexes(items: SelectItem[]): number[] {
  return items.flatMap((item, index) => (item.kind === 'option' && !item.disabled ? [index] : []));
}

function optionClass(item: Extract<SelectItem, { kind: 'option' }>) {
  return [menu.option, item.selected && menu.selected, item.disabled && menu.disabled].filter(Boolean).join(' ');
}

export function SelectMenu({ native, anchor, onPick, onClose }: SelectMenuProps) {
  const items = useMemo(() => readSelectItems(native), [native]);
  const [active, setActive] = useState(() => {
    const selected = items.findIndex((item) => item.kind === 'option' && item.selected);
    return selected >= 0 ? selected : (enabledIndexes(items)[0] ?? -1);
  });
  const [style, setStyle] = useState<CSSProperties>({ visibility: 'hidden' });
  const listRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const rect = anchor.getBoundingClientRect();
    const room = window.innerHeight - rect.bottom;
    const above = room < Math.min(MAX_HEIGHT, 44 * items.length) && rect.top > room;
    setStyle({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)),
      minWidth: rect.width,
      maxHeight: Math.min(MAX_HEIGHT, (above ? rect.top : room) - 12),
      ...(above ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
    });
  }, [anchor, items.length]);

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active, style]);

  useEffect(() => {
    const move = (step: 1 | -1) => {
      const enabled = enabledIndexes(items);
      if (!enabled.length) return;
      const position = enabled.indexOf(active);
      setActive(enabled[(position + step + enabled.length) % enabled.length]);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        move(event.key === 'ArrowDown' ? 1 : -1);
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const item = items[active];
        if (item?.kind === 'option') onPick(item.value);
      } else if (event.key === 'Tab') {
        onClose();
      }
    };
    const outside = (event: Event) => {
      const target = event.target as Node;
      if (!listRef.current?.contains(target) && !anchor.contains(target)) onClose();
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('mousedown', outside);
    window.addEventListener('scroll', outside, true);
    window.addEventListener('resize', onClose);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('mousedown', outside);
      window.removeEventListener('scroll', outside, true);
      window.removeEventListener('resize', onClose);
    };
  }, [active, anchor, items, onClose, onPick]);

  return createPortal(
    <div ref={listRef} className={menu.menu} style={style} role="listbox">
      {items.map((item, index) =>
        item.kind === 'group' ? (
          <div key={`g-${index}`} className={menu.group}>
            {item.label}
          </div>
        ) : (
          <div
            key={`o-${index}`}
            role="option"
            aria-selected={item.selected}
            aria-disabled={item.disabled || undefined}
            data-active={index === active}
            className={optionClass(item)}
            onMouseEnter={() => !item.disabled && setActive(index)}
            onClick={() => !item.disabled && onPick(item.value)}
          >
            <span>{item.label}</span>
            {item.selected && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ),
      )}
    </div>,
    document.body,
  );
}
