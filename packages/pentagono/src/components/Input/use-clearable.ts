import { useCallback, useEffect, useLayoutEffect, useState, type RefObject } from 'react';

// Tipos de campo em que "limpar" faz sentido: texto digitado. Números, datas, arquivos e escolhas ficam de fora.
const CLEARABLE_TYPES = new Set(['text', 'search', 'email', 'tel', 'url', 'password']);

export const isClearableType = (type: string) => CLEARABLE_TYPES.has(type);

// Diz se o campo tem texto e limpa pelo caminho normal: grava o valor vazio e dispara o evento `input`,
// que é o que o React escuta (campos controlados e não controlados funcionam igual).
// `value` só é passado em campos controlados: aí a resposta sai direto da prop, sem efeito a cada render.
export function useClearable(
  ref: RefObject<HTMLInputElement | null>,
  enabled: boolean,
  value: string | number | readonly string[] | undefined,
) {
  const controlled = value !== undefined;
  const [typed, setTyped] = useState(false);

  // Campo não controlado: acompanha o que o usuário digita (e o valor inicial).
  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled || controlled) return;
    const sync = () => setTyped(element.value !== '');
    sync();
    element.addEventListener('input', sync);
    return () => element.removeEventListener('input', sync);
  }, [controlled, enabled, ref]);

  const clear = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(element, '');
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.focus();
  }, [ref]);

  const hasValue = controlled ? String(value) !== '' : typed;
  return { hasValue: enabled && hasValue, clear };
}

interface Position {
  left: number;
  top: number;
  height: number;
}

// Posição do campo dentro do mesmo elemento de referência do botão (o botão é irmão do campo), para
// o X acompanhar o campo sem envolvê-lo em outro elemento e sem mexer no layout da tela.
export function useAnchorPosition(target: HTMLElement | null, active: boolean): Position | null {
  const [position, setPosition] = useState<Position | null>(null);

  useLayoutEffect(() => {
    if (!target || !active) return;
    const update = () => {
      const next = target.offsetParent
        ? { left: target.offsetLeft + target.offsetWidth, top: target.offsetTop, height: target.offsetHeight }
        : null;
      // Só troca o estado quando a posição mudou: evita renderizar à toa a cada aviso do observador.
      setPosition((current) =>
        current === next ||
        (current && next && current.left === next.left && current.top === next.top && current.height === next.height)
          ? current
          : next,
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(target);
    window.addEventListener('resize', update);
    target.addEventListener('focus', update);
    // Modais animam a entrada: confere de novo quando a animação termina.
    const settle = window.setTimeout(update, 350);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      target.removeEventListener('focus', update);
      window.clearTimeout(settle);
    };
  }, [target, active]);

  return position;
}
