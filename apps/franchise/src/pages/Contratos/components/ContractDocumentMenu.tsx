import { SOUL540_MENUS, type StaticMenu } from '../../../data/soul540Menus/index';
import type { ContractDocumentModel } from '../types/contract-document-types';
import styles from '../styles/ContractDocument.module.scss';

export function ContractDocumentMenu({ model }: { model: ContractDocumentModel }) {
  return (
    <div className={styles.annex}>
      <div className={styles.annexTitle}>Anexo I – Cardápio do Evento</div>
      {(() => {
        const selectedMenu: StaticMenu | undefined = model.contract.menuId
          ? SOUL540_MENUS.find((m) => m.id === model.contract.menuId)
          : undefined;

        if (selectedMenu) {
          return (
            <>
              <p className={styles.annexSection} style={{ fontWeight: 700, fontSize: '1em', marginBottom: 8 }}>
                {selectedMenu.name}
              </p>
              {selectedMenu.categories.map((cat) => (
                <div key={cat.name}>
                  <p className={styles.annexSection}>{cat.name}</p>
                  <table className={styles.menuTable}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.items.map((item) => (
                        <tr key={item.name}>
                          <td>
                            {item.name}
                            {item.subtitle ? (
                              <>
                                <br />
                                <em style={{ fontSize: '0.85em', color: '#666' }}>{item.subtitle}</em>
                              </>
                            ) : null}
                          </td>
                          <td>{item.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              {selectedMenu.obs && (
                <p className={styles.annexObs}>
                  <strong>Observação:</strong> {selectedMenu.obs}
                </p>
              )}
            </>
          );
        }

        // Cardápio genérico padrão
        return (
          <>
            <p className={styles.annexSection}>Entradas</p>
            <table className={styles.menuTable}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Descrição</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Crostinis</td>
                  <td>Torradinhas artesanais com azeite</td>
                </tr>
                <tr>
                  <td>Pãozinho de Calabresa</td>
                  <td>Massa leve com calabresa</td>
                </tr>
                <tr>
                  <td>Maravilha de Queijo</td>
                  <td>Massa recheada com queijo derretido</td>
                </tr>
              </tbody>
            </table>
            <p className={styles.annexSection}>Pizzas Salgadas</p>
            <table className={styles.menuTable}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Ingredientes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ZUCCHINI SPECIALI</td>
                  <td>Massa, molho de tomate, abobrinha, alho frito, parmesão, azeite e orégano</td>
                </tr>
                <tr>
                  <td>BLU AGRIDOCE</td>
                  <td>Massa, molho de tomate, geleia de pimenta, mussarela, gorgonzola, bacon e orégano</td>
                </tr>
                <tr>
                  <td>MARGHERITA BÚFALA</td>
                  <td>Massa, molho de tomate, mussarela de búfala, parmesão, manjericão, azeite e orégano</td>
                </tr>
                <tr>
                  <td>CALABRESA TRADIZIONALE</td>
                  <td>Massa, molho de tomate, mussarela, calabresa, cebola, azeitona e orégano</td>
                </tr>
                <tr>
                  <td>QUATTRO FORAGGIO</td>
                  <td>Massa, molho, mussarela, parmesão, gorgonzola, catupiry e orégano</td>
                </tr>
                <tr>
                  <td>MOZZARELLA SPECIALI</td>
                  <td>
                    Massa, molho de tomate, mussarela, tomate em pedaços, azeitona, parmesão, manjericão, azeite e
                    orégano
                  </td>
                </tr>
                <tr>
                  <td>SEM GLUTEN</td>
                  <td>Massa especial sem glúten com recheios disponíveis no mise en place</td>
                </tr>
                <tr>
                  <td>DUO FRANGO E BACON</td>
                  <td>Massa, molho de tomate, mussarela, frango desfiado, Catupiry, bacon e orégano</td>
                </tr>
              </tbody>
            </table>
            <p className={styles.annexSection}>Pizzas Doces</p>
            <table className={styles.menuTable}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Ingredientes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Chocolate</td>
                  <td>Massa, Chocolate ao leite, confeitos</td>
                </tr>
              </tbody>
            </table>
            <p className={styles.annexObs}>
              <strong>Observação:</strong> O serviço será realizado em formato coquetel e rodízio, com garçons servindo
              fatias aos convidados e mesa de apoio disponível para autoatendimento.
            </p>
          </>
        );
      })()}
    </div>
  );
}
