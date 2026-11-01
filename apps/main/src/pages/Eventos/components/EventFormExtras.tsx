import { Input, Label, Textarea } from '../../../../../../packages/pentagono/src/index';
import type { EventFormController } from '../types/event-form-controller';
import styles from '../styles/Eventos.module.scss';

export default function EventFormExtras({ controller }: { controller: EventFormController }) {
  const { form, setForm, availableMenus, showMenuDropdown, setShowMenuDropdown } = controller;
  return (
    <>
      <div className={styles.formSection}>
        <p className={styles.formSectionTitle}>Extras</p>
        <div className={styles.formGroup}>
          <Label className={styles.label}>Cardápio</Label>
          <div style={{ position: 'relative' }}>
            <div
              className={styles.input}
              style={{
                cursor: 'pointer',
                userSelect: 'none',
                minHeight: 38,
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 4,
              }}
              onClick={() => setShowMenuDropdown((v) => !v)}
            >
              {form.menu ? (
                form.menu
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((name) => (
                    <span
                      key={name}
                      style={{
                        background: 'rgba(255,193,7,0.15)',
                        color: '#ffc107',
                        fontSize: 12,
                        borderRadius: 4,
                        padding: '2px 7px',
                      }}
                    >
                      {name}
                    </span>
                  ))
              ) : (
                <span style={{ color: 'var(--text-muted, #666)', fontSize: 13 }}>Selecionar cardápios...</span>
              )}
            </div>
            {showMenuDropdown && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowMenuDropdown(false)} />
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    background: '#131929',
                    border: '1px solid #2a3352',
                    borderRadius: 8,
                    padding: 8,
                    marginTop: 4,
                    maxHeight: 200,
                    overflowY: 'auto',
                  }}
                >
                  {availableMenus.map((name) => {
                    const selected = form.menu
                      .split(',')
                      .map((s) => s.trim())
                      .includes(name);
                    return (
                      <Label
                        key={name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          cursor: 'pointer',
                          borderRadius: 4,
                          background: selected ? 'rgba(255,193,7,0.08)' : 'transparent',
                        }}
                      >
                        <Input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            const current = form.menu
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean);
                            const next = selected ? current.filter((n) => n !== name) : [...current, name];
                            setForm({ ...form, menu: next.join(', ') });
                          }}
                        />
                        <span style={{ fontSize: 13, color: '#e2e8f0' }}>{name}</span>
                      </Label>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
        <div className={styles.formGroup}>
          <Textarea
            label="Observacoes"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Detalhes adicionais..."
          />
        </div>
      </div>
    </>
  );
}
