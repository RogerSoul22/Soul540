import { ContractDocumentField as EF } from './ContractDocumentField';
import type { ContractDocumentModel } from '../types/contract-document-types';
import styles from '../styles/ContractDocument.module.scss';

export function ContractDocumentMenu({ model }: { model: ContractDocumentModel }) {
  return (
    <div className={styles.annex}>
      <div className={styles.annexTitle}>Anexo I – Cardápio do Evento</div>

      {(model.menuName || model.editing) && (
        <p className={styles.annexSection} style={{ fontWeight: 700, fontSize: '1em', marginBottom: 8 }}>
          <EF
            value={model.menuName}
            onChange={model.setMenuName}
            editing={model.editing}
            placeholder="Nome do cardápio"
          />
        </p>
      )}

      {model.menuCategories.map((cat, ci) => (
        <div key={ci}>
          <p className={styles.annexSection}>
            <EF value={cat.name} onChange={(v) => model.updateCatName(ci, v)} editing={model.editing} />
          </p>
          <table className={styles.menuTable}>
            <thead>
              <tr>
                <th>{cat.headers[0]}</th>
                <th>{cat.headers[1]}</th>
              </tr>
            </thead>
            <tbody>
              {cat.items.map((item, ii) => (
                <tr key={ii}>
                  <td>
                    <EF
                      value={item.name}
                      onChange={(v) => model.updateItemField(ci, ii, 'name', v)}
                      editing={model.editing}
                      placeholder="Item"
                    />
                    {(item.subtitle || model.editing) && (
                      <>
                        <br />
                        <em style={{ fontSize: '0.85em', color: '#666' }}>
                          <EF
                            value={item.subtitle}
                            onChange={(v) => model.updateItemField(ci, ii, 'subtitle', v)}
                            editing={model.editing}
                            placeholder="subtítulo..."
                          />
                        </em>
                      </>
                    )}
                  </td>
                  <td>
                    <EF
                      value={item.description}
                      onChange={(v) => model.updateItemField(ci, ii, 'description', v)}
                      editing={model.editing}
                      placeholder="—"
                    />
                    {model.editing && (
                      <button
                        className={styles.menuRemoveBtn}
                        onClick={() => model.removeItem(ci, ii)}
                        title="Remover linha"
                      >
                        ×
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {model.editing && (
            <button className={styles.menuAddBtn} onClick={() => model.addItem(ci)}>
              + Adicionar item
            </button>
          )}
        </div>
      ))}

      {model.editing && (
        <button className={styles.menuAddBtn} style={{ marginTop: 12 }} onClick={model.addCategory}>
          + Adicionar categoria
        </button>
      )}

      {(model.menuObs || model.editing) && (
        <p className={styles.annexObs}>
          <strong>Observação:</strong>{' '}
          <EF
            value={model.menuObs}
            onChange={model.setMenuObs}
            editing={model.editing}
            multiline
            placeholder="Observações sobre o cardápio..."
          />
        </p>
      )}
    </div>
  );
}
