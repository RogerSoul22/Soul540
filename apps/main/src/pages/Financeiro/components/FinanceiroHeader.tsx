import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import { Button } from '@soul540/ui';
import styles from '../styles/Financeiro.module.scss';

const infoTitle =
  'Como usar esta página: registre receitas e despesas, acompanhe indicadores e ' + 'consulte os lançamentos.';
const factoryTitle = 'Exibir apenas dados da fábrica';
const combinedTitle = 'Exibir dados consolidados: principal, franquias e fábrica';
const ofxTitle = 'Importar extrato bancário OFX';
const newFinanceLabel = 'Novo Lançamento';

export default function FinanceiroHeader({ controller }: { controller: FinanceiroController }) {
  const {
    dataScope,
    setDataScope,
    setShowForm,
    setShowInfo,
    handleXmlFile,
    handleOfxFile,
    xmlInputRef,
    ofxInputRef,
    resetForm,
  } = controller;

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Financeiro</h1>
          <button className={styles.btnInfo} onClick={() => setShowInfo(true)} title={infoTitle}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        </div>
        <p className={styles.subtitle}>Controle completo de receitas, despesas e indicadores</p>
      </div>

      <div className={styles.headerActions}>
        <div className={styles.scopeToggle}>
          <button
            className={`${styles.scopeBtn} ${dataScope === 'main' ? styles.scopeBtnActive : ''}`}
            onClick={() => setDataScope('main')}
            title="Exibir apenas dados do sistema principal"
          >
            Sorocaba
          </button>
          <button
            className={`${styles.scopeBtn} ${dataScope === 'franchise' ? styles.scopeBtnActive : ''}`}
            onClick={() => setDataScope('franchise')}
            title="Exibir dados de todas as franquias"
          >
            Franquias
          </button>
          <button
            className={`${styles.scopeBtn} ${dataScope === 'factory' ? styles.scopeBtnActive : ''}`}
            onClick={() => setDataScope('factory')}
            title={factoryTitle}
          >
            Fábrica
          </button>
          <button
            className={`${styles.scopeBtn} ${dataScope === 'combined' ? styles.scopeBtnActive : ''}`}
            onClick={() => setDataScope('combined')}
            title={combinedTitle}
          >
            Consolidado
          </button>
        </div>

        <input ref={xmlInputRef} type="file" accept=".xml" hidden onChange={handleXmlFile} />
        <button className={styles.btnXml} onClick={() => xmlInputRef.current?.click()}>
          Importar XML
        </button>

        <input ref={ofxInputRef} type="file" accept=".ofx,application/x-ofx" hidden onChange={handleOfxFile} />
        <button className={styles.btnXml} onClick={() => ofxInputRef.current?.click()} title={ofxTitle}>
          Importar OFX
        </button>

        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          {newFinanceLabel}
        </Button>
      </div>
    </div>
  );
}
