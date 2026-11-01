import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from '../../../../../../packages/pentagono/src/index';
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
                  <Table variant="plain" className={styles.menuTable}>
                    <TableHead>
                      <TableRow>
                        <TableHeadCell>Item</TableHeadCell>
                        <TableHeadCell>Descrição</TableHeadCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cat.items.map((item) => (
                        <TableRow key={item.name}>
                          <TableCell>
                            {item.name}
                            {item.subtitle ? (
                              <>
                                <br />
                                <em style={{ fontSize: '0.85em', color: '#666' }}>{item.subtitle}</em>
                              </>
                            ) : null}
                          </TableCell>
                          <TableCell>{item.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
            <Table variant="plain" className={styles.menuTable}>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Item</TableHeadCell>
                  <TableHeadCell>Descrição</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Crostinis</TableCell>
                  <TableCell>Torradinhas artesanais com azeite</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Pãozinho de Calabresa</TableCell>
                  <TableCell>Massa leve com calabresa</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Maravilha de Queijo</TableCell>
                  <TableCell>Massa recheada com queijo derretido</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p className={styles.annexSection}>Pizzas Salgadas</p>
            <Table variant="plain" className={styles.menuTable}>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Nome</TableHeadCell>
                  <TableHeadCell>Ingredientes</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>ZUCCHINI SPECIALI</TableCell>
                  <TableCell>Massa, molho de tomate, abobrinha, alho frito, parmesão, azeite e orégano</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>BLU AGRIDOCE</TableCell>
                  <TableCell>
                    Massa, molho de tomate, geleia de pimenta, mussarela, gorgonzola, bacon e orégano
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>MARGHERITA BÚFALA</TableCell>
                  <TableCell>
                    Massa, molho de tomate, mussarela de búfala, parmesão, manjericão, azeite e orégano
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>CALABRESA TRADIZIONALE</TableCell>
                  <TableCell>Massa, molho de tomate, mussarela, calabresa, cebola, azeitona e orégano</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>QUATTRO FORAGGIO</TableCell>
                  <TableCell>Massa, molho, mussarela, parmesão, gorgonzola, catupiry e orégano</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>MOZZARELLA SPECIALI</TableCell>
                  <TableCell>
                    Massa, molho de tomate, mussarela, tomate em pedaços, azeitona, parmesão, manjericão, azeite e
                    orégano
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SEM GLUTEN</TableCell>
                  <TableCell>Massa especial sem glúten com recheios disponíveis no mise en place</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>DUO FRANGO E BACON</TableCell>
                  <TableCell>Massa, molho de tomate, mussarela, frango desfiado, Catupiry, bacon e orégano</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p className={styles.annexSection}>Pizzas Doces</p>
            <Table variant="plain" className={styles.menuTable}>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Nome</TableHeadCell>
                  <TableHeadCell>Ingredientes</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Chocolate</TableCell>
                  <TableCell>Massa, Chocolate ao leite, confeitos</TableCell>
                </TableRow>
              </TableBody>
            </Table>
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
