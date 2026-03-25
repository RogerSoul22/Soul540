import { useState, useMemo, useEffect, useCallback } from 'react';

type Franchise = {
  id: string;
  name: string;
  owner: string;
  city: string;
  state: string;
  monthlyFee: number;
  status: 'ativa' | 'em_implantacao' | 'suspensa' | 'encerrada';
  openDate: string;
  createdAt: string;
};
import Badge from '@frontend/components/Badge/Badge';
import styles from './Franquias.module.scss';
import ConfirmModal from '@frontend/components/ConfirmModal/ConfirmModal';

const statusConfig: Record<Franchise['status'], { label: string; color: 'green' | 'blue' | 'amber' | 'gray' }> = {
  ativa: { label: 'Ativa', color: 'green' },
  em_implantacao: { label: 'Em Implantacao', color: 'blue' },
  suspensa: { label: 'Suspensa', color: 'amber' },
  encerrada: { label: 'Encerrada', color: 'gray' },
};

type FormData = {
  name: string;
  owner: string;
  city: string;
  state: string;
  monthlyFee: string;
  status: Franchise['status'];
  openDate: string;
};

const emptyForm: FormData = {
  name: '', owner: '', city: '', state: 'SP', monthlyFee: '', status: 'em_implantacao', openDate: '',
};

type PortalStats = {
  events: number;
  tasks: number;
  employees: number;
  revenue: number;
};

type PortalSystem = 'franchise' | 'factory';

function PortalCard({ system, defaultUrl }: { system: PortalSystem; defaultUrl: string }) {
  const storageKey = `soul540_${system}_url`;
  const [url, setUrl] = useState(() => localStorage.getItem(storageKey) || defaultUrl);
  const [editingUrl, setEditingUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState(url);
  const [online, setOnline] = useState<boolean | null>(null);
  const [stats, setStats] = useState<PortalStats | null>(null);
  const [loading, setLoading] = useState(true);

  const label = system === 'franchise' ? 'Franquia' : 'Fábrica';
  const color = system === 'franchise' ? styles.portalAmber : styles.portalBlue;

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json', 'X-System': system };
      const [evR, tkR, emR, fiR] = await Promise.all([
        fetch('/api/events', { headers }),
        fetch('/api/tasks', { headers }),
        fetch('/api/employees', { headers }),
        fetch('/api/finances', { headers }),
      ]);
      if (!evR.ok) throw new Error('offline');
      const [events, tasks, employees, finances] = await Promise.all([
        evR.json(), tkR.json(), emR.json(), fiR.json(),
      ]);
      const revenue = Array.isArray(finances)
        ? finances.filter((f: any) => f.type === 'income').reduce((acc: number, f: any) => acc + (f.amount || 0), 0)
        : 0;
      setStats({
        events: Array.isArray(events) ? events.length : 0,
        tasks: Array.isArray(tasks) ? tasks.length : 0,
        employees: Array.isArray(employees) ? employees.length : 0,
        revenue,
      });
      setOnline(true);
    } catch {
      setOnline(false);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [system]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const saveUrl = () => {
    setUrl(urlDraft);
    localStorage.setItem(storageKey, urlDraft);
    setEditingUrl(false);
  };

  return (
    <div className={`${styles.portalCard} ${color}`}>
      <div className={styles.portalTop}>
        <div className={styles.portalIcon}>
          {system === 'franchise' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          )}
        </div>
        <div>
          <div className={styles.portalLabel}>Portal {label}</div>
          <div className={styles.portalSub}>Sistema {system}</div>
        </div>
        <div className={styles.portalStatus}>
          <span className={`${styles.statusDot} ${online === true ? styles.statusOnline : online === false ? styles.statusOffline : ''}`} />
          <span className={styles.statusLabel}>
            {online === null ? 'Verificando...' : online ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <div className={styles.portalStats}>
        {loading ? (
          <div className={styles.portalLoading}>Carregando dados...</div>
        ) : stats ? (
          <>
            <div className={styles.portalStat}>
              <span className={styles.portalStatValue}>{stats.events}</span>
              <span className={styles.portalStatLabel}>Eventos</span>
            </div>
            <div className={styles.portalStat}>
              <span className={styles.portalStatValue}>{stats.tasks}</span>
              <span className={styles.portalStatLabel}>Tarefas</span>
            </div>
            <div className={styles.portalStat}>
              <span className={styles.portalStatValue}>{stats.employees}</span>
              <span className={styles.portalStatLabel}>Funcionários</span>
            </div>
            <div className={styles.portalStat}>
              <span className={styles.portalStatValue}>R$ {stats.revenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
              <span className={styles.portalStatLabel}>Receita</span>
            </div>
          </>
        ) : (
          <div className={styles.portalOfflineMsg}>Sistema inacessível</div>
        )}
      </div>

      <div className={styles.portalFooter}>
        {editingUrl ? (
          <div className={styles.urlRow}>
            <input
              className={styles.urlInput}
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://meu-portal.up.railway.app"
              onKeyDown={(e) => { if (e.key === 'Enter') saveUrl(); if (e.key === 'Escape') setEditingUrl(false); }}
              autoFocus
            />
            <button className={styles.urlSave} onClick={saveUrl}>OK</button>
            <button className={styles.urlCancel} onClick={() => setEditingUrl(false)}>✕</button>
          </div>
        ) : (
          <div className={styles.urlDisplay} onClick={() => { setUrlDraft(url); setEditingUrl(true); }} title="Clique para editar URL">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            {url}
          </div>
        )}
        <div className={styles.portalActions}>
          <button className={styles.btnRefresh} onClick={fetchStats} title="Atualizar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          </button>
          <a className={styles.btnAccess} href={url} target="_blank" rel="noopener noreferrer">
            Acessar
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Franquias() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);

  useEffect(() => {
    fetch('/api/franchises').then(r => r.json()).then(setFranchises).catch(() => {});
  }, []);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      franchises.filter((f) => {
        if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.owner.toLowerCase().includes(search.toLowerCase()) && !f.city.toLowerCase().includes(search.toLowerCase())) return false;
        if (statusFilter !== 'all' && f.status !== statusFilter) return false;
        return true;
      }),
    [franchises, search, statusFilter],
  );

  const activeCount = franchises.filter((f) => f.status === 'ativa').length;
  const monthlyRevenue = franchises.filter((f) => f.status === 'ativa').reduce((acc, f) => acc + f.monthlyFee, 0);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };
  const openEdit = (f: Franchise) => {
    setForm({ name: f.name, owner: f.owner, city: f.city, state: f.state, monthlyFee: String(f.monthlyFee), status: f.status, openDate: f.openDate });
    setEditingId(f.id);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); setForm(emptyForm); };

  const handleSubmit = async () => {
    if (!form.name || !form.owner) return;
    const data = {
      name: form.name, owner: form.owner, city: form.city, state: form.state,
      monthlyFee: Number(form.monthlyFee) || 0, status: form.status, openDate: form.openDate,
    };
    if (editingId) {
      const res = await fetch(`/api/franchises/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const updated: Franchise = await res.json();
      setFranchises((prev) => prev.map((f) => f.id === editingId ? updated : f));
    } else {
      const res = await fetch('/api/franchises', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const created: Franchise = await res.json();
      setFranchises((prev) => [created, ...prev]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => { setDeleteTargetId(id); };
  const confirmDelete = async () => {
    if (deleteTargetId) {
      await fetch(`/api/franchises/${deleteTargetId}`, { method: 'DELETE' });
      setFranchises((prev) => prev.filter((f) => f.id !== deleteTargetId));
    }
    setDeleteTargetId(null);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        const payload = {
          name: data.name || 'Nova Franquia',
          owner: data.owner || '',
          city: data.city || '',
          state: data.state || 'SP',
          monthlyFee: Number(data.monthlyFee) || 0,
          status: data.status || 'em_implantacao',
          openDate: data.openDate || new Date().toISOString().split('T')[0],
        };
        const res = await fetch('/api/franchises', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const created: Franchise = await res.json();
        setFranchises((prev) => [created, ...prev]);
        alert('Franquia importada com sucesso!');
      } catch {
        alert('Erro ao importar JSON. Verifique o formato do arquivo.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Franquias</h1>
          <p className={styles.subtitle}>Gerencie unidades franqueadas da Soul540</p>
        </div>
        <div className={styles.headerActions}>
        </div>
      </div>

      {/* Portais Conectados */}
      <div className={styles.sectionLabel}>Portais Conectados</div>
      <div className={styles.portalsGrid}>
        <PortalCard system="franchise" defaultUrl={import.meta.env.VITE_FRANCHISE_URL || `${window.location.origin}/franquia`} />
        <PortalCard system="factory" defaultUrl={import.meta.env.VITE_FACTORY_URL || `${window.location.origin}/fabrica`} />
      </div>


      {showModal && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editingId ? 'Editar Franquia' : 'Nova Franquia'}</h2>
              <button className={styles.modalClose} onClick={closeModal}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nome da Unidade *</label>
                  <input className={styles.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Soul540 Cidade" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Franqueado *</label>
                  <input className={styles.input} value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="Nome do franqueado" />
                </div>
              </div>
              <div className={styles.formGrid3}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Cidade</label>
                  <input className={styles.input} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Cidade" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Estado</label>
                  <input className={styles.input} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="SP" maxLength={2} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Status</label>
                  <select className={styles.input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Franchise['status'] })}>
                    <option value="ativa">Ativa</option>
                    <option value="em_implantacao">Em Implantacao</option>
                    <option value="suspensa">Suspensa</option>
                    <option value="encerrada">Encerrada</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGrid2}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Royalties Mensais (R$)</label>
                  <input className={styles.input} type="number" value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })} placeholder="0" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Data de Abertura</label>
                  <input className={styles.input} type="date" value={form.openDate} onChange={(e) => setForm({ ...form, openDate: e.target.value })} />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={closeModal}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleSubmit} disabled={!form.name || !form.owner}>
                {editingId ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteTargetId && (
        <ConfirmModal
          title="Excluir Franquia"
          message={<>Tem certeza que deseja excluir <strong>{franchises.find((f) => f.id === deleteTargetId)?.name}</strong>? Esta ação não pode ser desfeita.</>}
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={confirmDelete}
          onClose={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  );
}
