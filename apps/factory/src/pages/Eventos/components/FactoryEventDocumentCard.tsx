import { Card } from '../../../../../../packages/pentagono/src/index';
type Props = {
  data?: string;
  downloadName?: string;
  label: string;
  name?: string;
  styles: Record<string, string>;
};

export default function FactoryEventDocumentCard({ data, downloadName, label, name, styles }: Props) {
  return (
    <Card className={styles.docCard}>
      <div className={styles.docCardHeader}>
        <span className={styles.detailLabel}>{label}</span>
        {data && (
          <a
            className={styles.docDownloadBtn}
            href={data}
            download={downloadName || label}
            onClick={(event) => event.stopPropagation()}
            title="Baixar"
          >
            Baixar
          </a>
        )}
      </div>
      {data?.startsWith('data:image') ? (
        <img src={data} alt={label} className={styles.docPreviewImage} />
      ) : data?.startsWith('data:application/pdf') ? (
        <iframe src={data} className={styles.docPreviewPdf} title={`${label} PDF`} />
      ) : (
        <div className={styles.docNoPreview}>
          <span>{name || 'Arquivo'}</span>
        </div>
      )}
    </Card>
  );
}
