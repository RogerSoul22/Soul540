import { useCardapiosController } from './hooks/use-cardapios-controller';
import { ConfirmModal } from '@soul540/ui';
import { SOUL540_MENUS } from '../../data/soul540Menus';
import MenuEditorModal from './components/MenuEditorModal';
import CustomMenuList from './components/CustomMenuList';
import CustomMenuPreview from './components/CustomMenuPreview';
import StaticMenuGrid from './components/StaticMenuGrid';
import StaticMenuPreview from './components/StaticMenuPreview';
import StaticMenuEditor from './components/StaticMenuEditor';
import styles from './styles/Cardapios.module.scss';

export default function Cardapios() {
  const controller = useCardapiosController();
  const {
    events,
    filtered,
    eventMap,
    search,
    editorOpen,
    editingId,
    previewMenu,
    previewStatic,
    deleteId,
    editingStatic,
    generatingPdf,
    overrides,
    formName,
    formEventId,
    formHeaderText,
    formFooterText,
    formCategories,
    setSearch,
    setPreviewMenu,
    setPreviewStatic,
    setDeleteId,
    setEditingStatic,
    openCreate,
    openEdit,
    closeEditor,
    submitMenu,
    confirmDelete,
    generatePdf,
    saveStatic,
    addCategory,
    removeCategory,
    updateCategory,
    addItem,
    removeItem,
    updateItem,
    setFormName,
    setFormEventId,
    setFormHeaderText,
    setFormFooterText,
  } = controller;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Cardápios</h1>
          <p className={styles.subtitle}>Menus Soul540 e cardápios personalizados de eventos</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>
          + Novo cardápio
        </button>
      </header>
      <StaticMenuGrid
        menus={SOUL540_MENUS}
        overrides={overrides}
        generatingPdf={generatingPdf}
        onPreview={setPreviewStatic}
        onEdit={setEditingStatic}
        onGeneratePdf={generatePdf}
      />
      <CustomMenuList
        menus={filtered}
        eventMap={eventMap}
        search={search}
        onSearchChange={setSearch}
        onPreview={setPreviewMenu}
        onEdit={openEdit}
        onDelete={setDeleteId}
      />
      {editorOpen && (
        <MenuEditorModal
          editing={Boolean(editingId)}
          name={formName}
          eventId={formEventId}
          headerText={formHeaderText}
          footerText={formFooterText}
          categories={formCategories}
          events={events.map((event) => ({ id: event.id, name: event.name }))}
          onNameChange={setFormName}
          onEventChange={setFormEventId}
          onHeaderChange={setFormHeaderText}
          onFooterChange={setFormFooterText}
          onCategoryAdd={addCategory}
          onCategoryRemove={removeCategory}
          onCategoryChange={updateCategory}
          onItemAdd={addItem}
          onItemRemove={removeItem}
          onItemChange={updateItem}
          onClose={closeEditor}
          onSubmit={submitMenu}
        />
      )}
      {previewMenu && (
        <CustomMenuPreview
          menu={previewMenu}
          eventName={previewMenu.eventId ? eventMap[previewMenu.eventId] : ''}
          onClose={() => setPreviewMenu(null)}
        />
      )}
      {previewStatic && (
        <StaticMenuPreview
          menu={previewStatic}
          generating={generatingPdf === previewStatic.id}
          onGenerate={() => generatePdf(previewStatic)}
          onClose={() => setPreviewStatic(null)}
        />
      )}
      {editingStatic && (
        <StaticMenuEditor menu={editingStatic} onSave={saveStatic} onClose={() => setEditingStatic(null)} />
      )}
      {deleteId && (
        <ConfirmModal
          title="Excluir cardápio"
          message={
            <>
              Tem certeza que deseja excluir{' '}
              <strong>{controller.menus.find((menu) => menu.id === deleteId)?.name}</strong>?
            </>
          }
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={confirmDelete}
          onClose={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
