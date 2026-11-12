import type { FinanceiroController } from '../hooks/use-financeiro-controller';
import { Button, InfoButton, Input, PageHeader } from '../../../../../../packages/pentagono/src/index';
import styles from '../styles/Financeiro.module.scss';

const infoTitle =
  'Como usar esta página: registre receitas e despesas, acompanhe indicadores e ' + 'consulte os lançamentos.';
const factoryTitle = 'Exibir apenas dados da fábrica';
const combinedTitle = 'Exibir dados consolidados: principal, franquias e fábrica';
const ofxTitle = 'Importar extrato bancário OFX';
const newFinanceLabel = 'Novo Lançamento';
const readOnlyTitle = 'Selecione Sorocaba para criar ou importar lançamentos.';

export default function FinanceiroHeader({ controller }: { controller: FinanceiroController }) {
  const {
    dataScope,
    setDataScope,
    franchiseFilter,
    setFranchiseFilter,
    franchises,
    setShowForm,
    setShowInfo,
    handleXmlFile,
    handleOfxFile,
    xmlInputRef,
    ofxInputRef,
    resetForm,
  } = controller;

  const showFranchisePicker =
    controller.canAccessConsolidatedData && (dataScope === 'main' || dataScope === 'franchise');

  return (
    <>
      <PageHeader
        title="Financeiro"
        subtitle="Controle completo de receitas, despesas e indicadores"
        titleExtra={
          <>
            <InfoButton label={infoTitle} onClick={() => setShowInfo(true)} />
          </>
        }
        actions={
          <div className={styles.headerActions}>
            {controller.canAccessConsolidatedData && (
              <div className={styles.scopeToggle}>
                <Button
                  variant="chip"
                  active={dataScope === 'combined'}
                  className={`${styles.scopeBtn} ${dataScope === 'combined' ? styles.scopeBtnActive : ''}`}
                  onClick={() => setDataScope('combined')}
                  title={combinedTitle}
                >
                  Consolidado
                </Button>
                <Button
                  variant="chip"
                  active={dataScope === 'franchise' || dataScope === 'main'}
                  className={`${styles.scopeBtn} ${
                    dataScope === 'franchise' || dataScope === 'main' ? styles.scopeBtnActive : ''
                  }`}
                  onClick={() => setDataScope('franchise')}
                  title="Exibir Sorocaba e as franquias"
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
              </div>
            )}

            <Input ref={xmlInputRef} type="file" accept=".xml" hidden onChange={handleXmlFile} />
            <Button
              variant="secondary"
              size="sm"
              className={styles.btnXml}
              disabled={!controller.canEditEntries}
              onClick={() => xmlInputRef.current?.click()}
              title={controller.canEditEntries ? undefined : readOnlyTitle}
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
              disabled={!controller.canEditEntries}
              onClick={() => ofxInputRef.current?.click()}
              title={controller.canEditEntries ? ofxTitle : readOnlyTitle}
            >
              Importar OFX
            </Button>

            <Button
              disabled={!controller.canEditEntries}
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              title={controller.canEditEntries ? undefined : readOnlyTitle}
            >
              {newFinanceLabel}
            </Button>
          </div>
        }
      />
      {showFranchisePicker && (
        <div className={styles.scopeToggle}>
          <Button
            variant="chip"
            active={dataScope === 'franchise' && franchiseFilter === 'all'}
            className={`${styles.scopeBtn} ${
              dataScope === 'franchise' && franchiseFilter === 'all' ? styles.scopeBtnActive : ''
            }`}
            onClick={() => {
              if (dataScope !== 'franchise') setDataScope('franchise');
              setFranchiseFilter('all');
            }}
            title="Exibir todas as franquias juntas"
          >
            Todas as franquias
          </Button>
          <Button
            variant="chip"
            active={dataScope === 'main'}
            className={`${styles.scopeBtn} ${dataScope === 'main' ? styles.scopeBtnActive : ''}`}
            onClick={() => setDataScope('main')}
            title="Exibir somente os dados de Sorocaba"
          >
            Sorocaba
          </Button>
          {franchises.map((franchise) => (
            <Button
              key={franchise.id}
              variant="chip"
              active={dataScope === 'franchise' && franchiseFilter === franchise.id}
              className={`${styles.scopeBtn} ${
                dataScope === 'franchise' && franchiseFilter === franchise.id ? styles.scopeBtnActive : ''
              }`}
              onClick={() => {
                if (dataScope !== 'franchise') setDataScope('franchise');
                setFranchiseFilter(franchise.id);
              }}
              title={`Exibir somente dados da franquia ${franchise.name}`}
            >
              {franchise.name}
            </Button>
          ))}
        </div>
      )}
    </>
  );
}
