export type SelectItem =
  | { kind: 'group'; label: string }
  | { kind: 'option'; value: string; label: string; disabled: boolean; selected: boolean };

// A lista é lida do <select> nativo, que continua sendo a fonte de verdade (valor, onChange, ref).
export function readSelectItems(native: HTMLSelectElement): SelectItem[] {
  const items: SelectItem[] = [];
  let group = '';

  native.querySelectorAll('option').forEach((option) => {
    const parent = option.parentElement;
    const inGroup = parent instanceof HTMLOptGroupElement;
    const groupLabel = inGroup ? parent.label : '';
    if (groupLabel !== group) {
      group = groupLabel;
      if (groupLabel) items.push({ kind: 'group', label: groupLabel });
    }
    items.push({
      kind: 'option',
      value: option.value,
      label: option.text,
      disabled: option.disabled || (inGroup && parent.disabled),
      selected: option.selected,
    });
  });

  return items;
}

// Troca o valor do <select> nativo e dispara o change que o React escuta.
export function commitSelectValue(native: HTMLSelectElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
  setter?.call(native, value);
  native.dispatchEvent(new Event('change', { bubbles: true }));
}
