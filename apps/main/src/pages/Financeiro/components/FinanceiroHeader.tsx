import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import { Button, InfoButton, Input, PageHeader } from '../../../../../../packages/pentagono/src/index';
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
    <PageHeader
      title="Financeiro"
      subtitle="Controle completo de receitas, despesas e indicadores"
      titleExtra={
        <>
          <InfoButton label={infoTitle} onClick={() => setShowInfo(true)} />
        </>
      }
      actions={
        <>
          {controller.canAccessConsolidatedData && (
            <div className={styles.scopeToggle}>
              <Button
                variant="chip"
                active={dataScope === 'main'}
                className={`${styles.scopeBtn} ${dataScope === 'main' ? styles.scopeBtnActive : ''}`}
                onClick={() => setDataScope('main')}
                title="Exibir apenas dados do sistema principal"
              >
                Sorocaba
              </Button>
              <Button
                variant="chip"
                active={dataScope === 'franchise'}
                className={`${styles.scopeBtn} ${dataScope === 'franchise' ? styles.scopeBtnActive : ''}`}
                onClick={() => setDataScope('franchise')}
                title="Exibir dados de todas as franquias"
              >
                Franquias
              </Button>
              <Button
                variant="chip"
                active={dataScope === 'factory'}
                className={`${styles.scopeBtn} ${dataScope === 'factory' ? styles.scopeBtnActive : ''}`}
                onClick={() => setDataScope('factory')}
                title={factoryTitle}
              >
                Fábrica
              </Button>
              <Button
                variant="chip"
                active={dataScope === 'combined'}
                className={`${styles.scopeBtn} ${dataScope === 'combined' ? styles.scopeBtnActive : ''}`}
                onClick={() => setDataScope('combined')}
                title={combinedTitle}
              >
                Consolidado
              </Button>
            </div>
          )}

          {controller.canEditEntries && (
            <>
              <Input ref={xmlInputRef} type="file" accept=".xml" hidden onChange={handleXmlFile} />
              <Button
                variant="secondary"
                size="sm"
                className={styles.btnXml}
                onClick={() => xmlInputRef.current?.click()}
              >
                Importar XML
              </Button>

              <Input
                ref={ofxInputRef}
                type="file"
                accept=".ofx,application/x-ofx"
                hidden
                onChange={handleOfxFile}
              />
              <Button
                variant="secondary"
                size="sm"
                className={styles.btnXml}
                onClick={() => ofxInputRef.current?.click()}
                title={ofxTitle}
              >
                Importar OFX
              </Button>

              <Button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                {newFinanceLabel}
              </Button>
            </>
          )}
        </>
      }
    />
  );
}
