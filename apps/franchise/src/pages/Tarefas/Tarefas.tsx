import { ConfirmModal } from '@soul540/ui';
import TaskBoard from './components/TaskBoard';
import TaskCreateModal from './components/TaskCreateModal';
import TaskHistory from './components/TaskHistory';
import TaskInfoModal from './components/TaskInfoModal';
import TasksHeader from './components/TasksHeader';
import { useTarefasController } from './hooks/use-tarefas-controller';
import styles from './styles/Tarefas.module.scss';

export default function Tarefas() {
  const controller = useTarefasController();
  const closeCreate = () => {
    controller.setShowModal(false);
    controller.setForm({
      ...controller.form,
      title: '',
      description: '',
      assignee: '',
      dueDate: '',
      eventId: '',
    });
  };

  return (
    <div className={styles.page}>
      <TasksHeader
        viewMode={controller.viewMode}
        onViewMode={controller.setViewMode}
        onCreate={() => controller.setShowModal(true)}
        onInfo={() => controller.setShowInfo(true)}
      />
      <div className={styles.stats}>
        <Stat value={controller.tasks.length} label="Total" />
        <Stat value={controller.doneCount} label="Concluídas" />
        <Stat value={controller.urgentCount} label="Urgentes" danger={controller.urgentCount > 0} />
      </div>
      <div className={styles.controls}>
        <input
          className={styles.searchInput}
          placeholder="Buscar tarefas..."
          value={controller.search}
          onChange={(event) => controller.setSearch(event.target.value)}
        />
        <select
          className={styles.select}
          value={controller.eventFilter}
          onChange={(event) => controller.setEventFilter(event.target.value)}
        >
          <option value="all">Todos os eventos</option>
          {controller.events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>
      <TaskBoard
        viewMode={controller.viewMode}
        groups={controller.tasksByStatus}
        filtered={controller.filtered}
        eventMap={controller.eventMap}
        columns={controller.columns}
        draggedId={controller.draggedId}
        dragOverColumn={controller.dragOverColumn}
        onDragStart={controller.setDraggedId}
        onDragEnd={() => {
          controller.setDraggedId(null);
          controller.setDragOverColumn(null);
        }}
        onDragOver={controller.setDragOverColumn}
        onDrop={(status) => {
          if (controller.draggedId) controller.moveTask(controller.draggedId, status);
          controller.setDraggedId(null);
          controller.setDragOverColumn(null);
        }}
        onDelete={controller.setDeleteTargetId}
        onMove={controller.moveTask}
        onArchive={controller.archiveTask}
      />
      <TaskHistory
        entries={controller.taskHistory}
        eventMap={controller.eventMap}
        expanded={controller.showHistory}
        onToggle={() => controller.setShowHistory((value) => !value)}
        onReopen={controller.reopenTask}
        onDelete={controller.deleteTaskHistory}
      />
      {controller.showModal && (
        <TaskCreateModal
          form={controller.form}
          events={controller.events}
          onChange={controller.updateForm}
          onCreate={controller.createTask}
          onClose={closeCreate}
        />
      )}
      {controller.showInfo && <TaskInfoModal onClose={() => controller.setShowInfo(false)} />}
      {controller.deleteTargetId && (
        <ConfirmModal
          title="Excluir Tarefa"
          message={
            <>
              Tem certeza que deseja excluir{' '}
              <strong>{controller.tasks.find((task) => task.id === controller.deleteTargetId)?.title}</strong>? Esta
              ação não pode ser desfeita.
            </>
          }
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={controller.confirmDelete}
          onClose={() => controller.setDeleteTargetId(null)}
        />
      )}
    </div>
  );
}

function Stat({ value, label, danger = false }: { value: number; label: string; danger?: boolean }) {
  return (
    <div className={styles.stat + (danger ? ' ' + styles.statDanger : '')}>
      <span className={styles.statVal}>{value}</span>
      <span className={styles.statLbl}>{label}</span>
    </div>
  );
}
