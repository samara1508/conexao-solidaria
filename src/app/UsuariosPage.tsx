import { useState, useMemo } from 'react';
import {
  Plus, Search, SlidersHorizontal, ArrowLeft,
  Pencil, Eye, EyeOff, ToggleLeft, ToggleRight, ChevronUp, ChevronDown,
  ChevronsUpDown, X,
} from 'lucide-react';
import { Usuario, StatusUsuario } from './types';
import { MOCK_USUARIOS } from './mockData';

// ─── helpers ───────────────────────────────────────────────────────
const fmtCPF = (v: string) => v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

const inp = 'w-full rounded-lg px-3 py-2.5 text-sm border outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-[#f0f4fb] border-[#d0daef] text-[#1a2744]';
const inpRO = 'w-full rounded-lg px-3 py-2.5 text-sm border bg-[#f8f9fc] border-[#e4e9f4] text-[#3d4f72] cursor-not-allowed';
const lbl = 'block text-sm font-medium text-[#3d4f72] mb-1';

function StatusBadge({ status }: { status: StatusUsuario }) {
  const active = status === 'ativo';
  const bg = active ? '#f0fdf4' : '#f3f4f6';
  const color = active ? '#16a34a' : '#6b7280';
  const label = active ? 'Ativo' : 'Inativo';
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: bg, color }}>
      {label}
    </span>
  );
}

function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: 'asc' | 'desc' }) {
  if (field !== sortField) return <ChevronsUpDown size={13} className="text-gray-400 inline ml-1" />;
  return sortDir === 'asc' ? <ChevronUp size={13} className="inline ml-1" style={{ color: '#2b65bf' }} /> : <ChevronDown size={13} className="inline ml-1" style={{ color: '#2b65bf' }} />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#d0daef] p-6 mb-4">
      <h3 className="text-sm font-semibold text-[#1a2744] uppercase tracking-wide mb-4 pb-3 border-b border-[#e4e9f4]">{title}</h3>
      {children}
    </div>
  );
}

function ConfirmDialog({ message, confirmLabel, danger, onConfirm, onCancel }:
  { message: string; confirmLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <p className="text-sm text-[#3d4f72] mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#d0daef] text-[#3d4f72] hover:bg-[#f0f4fb] transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: danger ? '#dc2626' : '#2b65bf' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

const blankUser = (): Omit<Usuario, 'id'> => ({
  nome: '',
  nomeUsuario: '',
  senha: '',
  dominio: 'caritas',
  email: '',
  status: 'ativo',
  cpf: '',
  isAdmin: false,
});

// ════════════════════════════════════════════════════════════════
//  USUARIO FORM
// ════════════════════════════════════════════════════════════════
function UsuarioForm({
  user, mode, onBack, onSave,
}: {
  user: Usuario | null;
  mode: 'new' | 'edit' | 'view';
  onBack: () => void;
  onSave: (us: Usuario) => void;
}) {
  const ro = mode === 'view';
  const [form, setForm] = useState<Usuario>(
    user ?? { id: Date.now(), ...blankUser() }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [viewMode, setViewMode] = useState(mode);

  const f = <K extends keyof Usuario>(k: K) => (v: Usuario[K]) => setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nome.trim()) errs.nome = 'Obrigatório';
    if (!form.nomeUsuario.trim()) errs.nomeUsuario = 'Obrigatório';
    if (viewMode === 'new' && (!form.senha || !form.senha.trim())) errs.senha = 'Obrigatório';
    if (!form.email.trim()) errs.email = 'Obrigatório';
    if (!form.cpf.trim() || form.cpf.length < 11) errs.cpf = 'CPF inválido (11 dígitos)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => { if (validate()) onSave(form); };

  const c = (field: keyof Usuario) => errors[field] ? inp.replace('border-[#d0daef]', 'border-red-400') : (viewMode === 'view' ? inpRO : inp);
  const titleMap = { new: 'Novo Usuário', edit: 'Editar Usuário', view: 'Detalhes do Usuário' };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-white border-b border-[#e4e9f4] shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6b7a9e] hover:text-[#2b65bf] transition-colors">
          <ArrowLeft size={16} /> Voltar
        </button>
        <span className="text-[#d0daef]">|</span>
        <h2 className="text-base font-semibold text-[#1a2744] flex-1">{titleMap[viewMode]}</h2>
        <div className="flex gap-2">
          {viewMode === 'view' && (
            <button onClick={() => setViewMode('edit')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#2b65bf' }}>
              <Pencil size={14} /> Editar
            </button>
          )}
          {viewMode !== 'view' && (
            <>
              <button onClick={onBack} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#d0daef] text-[#3d4f72] hover:bg-[#f0f4fb] transition-colors">Cancelar</button>
              <button onClick={handleSubmit} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#2b65bf' }}>Salvar</button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafd]">
        <Section title="Dados do Usuário">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={lbl}>Nome Completo *</label>
              <input className={c('nome')} disabled={viewMode === 'view'} value={form.nome}
                onChange={e => f('nome')(e.target.value)} placeholder="Nome completo" />
              {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
            </div>

            <div>
              <label className={lbl}>Nome de Usuário (Login) *</label>
              <input className={c('nomeUsuario')} disabled={viewMode === 'view'} value={form.nomeUsuario}
                onChange={e => f('nomeUsuario')(e.target.value)} placeholder="Ex: joao.silva" />
              {errors.nomeUsuario && <p className="text-xs text-red-500 mt-1">{errors.nomeUsuario}</p>}
            </div>

            <div>
              <label className={lbl}>Senha *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className={c('senha')} disabled={viewMode === 'view'} value={form.senha || ''}
                  onChange={e => f('senha')(e.target.value)} placeholder="Digite a senha" />
                {viewMode !== 'view' && (
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
              {errors.senha && <p className="text-xs text-red-500 mt-1">{errors.senha}</p>}
            </div>

            <div>
              <label className={lbl}>Domínio (Instituição) *</label>
              {/* O campo dominio deve vir ja preenchido e desabilitado com o valor implicito "caritas" */}
              <input className={inpRO} disabled={true} value="caritas" />
            </div>

            <div>
              <label className={lbl}>CPF *</label>
              <input className={c('cpf')} disabled={viewMode === 'view'} value={form.cpf}
                onChange={e => f('cpf')(e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="Somente 11 números" maxLength={11} />
              {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf}</p>}
            </div>

            <div className="col-span-2">
              <label className={lbl}>E-mail *</label>
              <input type="email" className={c('email')} disabled={viewMode === 'view'} value={form.email}
                onChange={e => f('email')(e.target.value)} placeholder="email@exemplo.com" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div className="flex items-center gap-3 mt-4 select-none">
              <button type="button"
                onClick={() => viewMode !== 'view' && f('isAdmin')(!form.isAdmin)}
                className="flex items-center justify-center w-5 h-5 rounded border-2 transition-all shrink-0"
                style={{ borderColor: form.isAdmin ? '#2b65bf' : '#d0daef', background: form.isAdmin ? '#2b65bf' : 'white', cursor: viewMode === 'view' ? 'not-allowed' : 'pointer' }}>
                {form.isAdmin && <svg viewBox="0 0 10 8" className="w-3 h-3 text-white"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </button>
              <span className="text-sm text-[#3d4f72]">Administrador (Acesso total)</span>
            </div>

            {viewMode !== 'new' && (
              <div>
                <label className={lbl}>Situação</label>
                <select className={viewMode === 'view' ? inpRO : inp} disabled={viewMode === 'view'} value={form.status}
                  onChange={e => f('status')(e.target.value as StatusUsuario)}>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  USUARIOS PAGE (LIST)
// ════════════════════════════════════════════════════════════════
export function UsuariosPage() {
  const [users, setUsers] = useState<Usuario[]>(MOCK_USUARIOS);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selected, setSelected] = useState<Usuario | null>(null);
  const [formMode, setFormMode] = useState<'new' | 'edit' | 'view'>('new');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusUsuario | 'ALL'>('ALL');
  const [filterAdmin, setFilterAdmin] = useState<'ALL' | 'true' | 'false'>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('nome');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<'inativar' | 'ativar'>('inativar');

  const filtered = useMemo(() => {
    let r = users.filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q || u.nome.toLowerCase().includes(q) || u.nomeUsuario.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.cpf.includes(q);
      const matchStatus = filterStatus === 'ALL' || u.status === filterStatus;
      const matchAdmin = filterAdmin === 'ALL' || (filterAdmin === 'true' ? u.isAdmin : !u.isAdmin);
      return matchSearch && matchStatus && matchAdmin;
    });
    r.sort((a, b) => {
      const av = (a as any)[sortField] ?? '';
      const bv = (b as any)[sortField] ?? '';
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return r;
  }, [users, search, filterStatus, filterAdmin, sortField, sortDir]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safeP = Math.min(page, totalPages - 1);
  const pageData = filtered.slice(safeP * perPage, safeP * perPage + perPage);

  const handleSort = (field: string) => {
    if (field === sortField) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleToggleStatus = (id: number, currentStatus: StatusUsuario) => {
    setConfirmId(id);
    setConfirmAction(currentStatus === 'ativo' ? 'inativar' : 'ativar');
  };

  const executeToggleStatus = () => {
    if (confirmId === null) return;
    setUsers(prev => prev.map(u => u.id === confirmId ? { ...u, status: u.status === 'ativo' ? 'inativo' : 'ativo' } : u));
    setConfirmId(null);
  };

  const handleSave = (usuarioSalvo: Usuario) => {
    if (formMode === 'new') {
      setUsers(prev => [usuarioSalvo, ...prev]);
    } else {
      setUsers(prev => prev.map(u => u.id === usuarioSalvo.id ? usuarioSalvo : u));
    }
    setView('list');
    setSelected(null);
  };

  if (view === 'form') {
    return <UsuarioForm user={selected} mode={formMode} onBack={() => { setView('list'); setSelected(null); }} onSave={handleSave} />;
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fafd]">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#e4e9f4] shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[#1a2744]">Cadastro de Usuários</h2>
          <p className="text-xs text-[#6b7a9e] mt-1">Gerencie as permissões e contas de usuários do sistema</p>
        </div>
        <button onClick={() => { setFormMode('new'); setSelected(null); setView('form'); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg active:scale-95"
          style={{ background: `linear-gradient(135deg, #3b7dd8 0%, #2b65bf 100%)` }}>
          <Plus size={16} strokeWidth={2.5} /> Novo Usuário
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col gap-4 px-8 py-4 bg-white border-b border-[#e4e9f4] shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Pesquisar por nome, usuário, e-mail ou CPF..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-[#f0f4fb] border-[#d0daef] text-[#1a2744]" />
          </div>
          <button onClick={() => setShowFilters(s => !s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-[#2b65bf]' : 'border-[#d0daef] text-[#3d4f72] hover:bg-[#f0f4fb]'}`}>
            <SlidersHorizontal size={15} /> Filtros
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-4 p-4 rounded-xl border border-[#d0daef] bg-[#f8fafc] animate-fadeIn">
            <div className="w-40">
              <label className="block text-xs font-semibold text-[#3d4f72] mb-1.5">Perfil Administrador</label>
              <select value={filterAdmin} onChange={e => { setFilterAdmin(e.target.value as any); setPage(0); }}
                className="w-full rounded-lg px-2.5 py-1.5 text-xs border outline-none bg-white border-[#d0daef] text-[#1a2744]">
                <option value="ALL">Todos</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
            <div className="w-40">
              <label className="block text-xs font-semibold text-[#3d4f72] mb-1.5">Situação</label>
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value as any); setPage(0); }}
                className="w-full rounded-lg px-2.5 py-1.5 text-xs border outline-none bg-white border-[#d0daef] text-[#1a2744]">
                <option value="ALL">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Grid List */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="bg-white rounded-2xl border border-[#d0daef] shadow-sm overflow-hidden flex flex-col max-h-full">
          <div className="overflow-y-auto flex-1">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#e4e9f4] bg-[#f8fafc] sticky top-0 z-10">
                  <th onClick={() => handleSort('nome')} className="cursor-pointer px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Nome <SortIcon field="nome" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th onClick={() => handleSort('nomeUsuario')} className="cursor-pointer px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Usuário <SortIcon field="nomeUsuario" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    E-mail
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    CPF
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Domínio
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none text-center">
                    Admin
                  </th>
                  <th onClick={() => handleSort('status')} className="cursor-pointer px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Status <SortIcon field="status" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e9f4]">
                {pageData.map(u => (
                  <tr key={u.id} className="hover:bg-[#f8fafc]/60 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-[#1a2744]">{u.nome}</td>
                    <td className="px-6 py-4 text-sm text-[#3d4f72] font-mono">{u.nomeUsuario}</td>
                    <td className="px-6 py-4 text-sm text-[#3d4f72]">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-[#3d4f72]">{u.cpf ? fmtCPF(u.cpf) : '-'}</td>
                    <td className="px-6 py-4 text-sm text-[#3d4f72]">{u.dominio}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${u.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.isAdmin ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => { setSelected(u); setFormMode('view'); setView('form'); }}
                          className="p-2 rounded-lg hover:bg-gray-100 text-[#6b7a9e] hover:text-[#1a2744] transition-colors" title="Visualizar">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => { setSelected(u); setFormMode('edit'); setView('form'); }}
                          className="p-2 rounded-lg hover:bg-gray-100 text-[#6b7a9e] hover:text-[#2b65bf] transition-colors" title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleToggleStatus(u.id, u.status)}
                          className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${u.status === 'ativo' ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-500'}`}
                          title={u.status === 'ativo' ? 'Inativar' : 'Ativar'}>
                          {u.status === 'ativo' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pageData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-[#6b7a9e]">Nenhum usuário encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#e4e9f4] bg-[#f8fafc] shrink-0">
            <div className="text-xs font-medium text-[#6b7a9e]">
              Mostrando {pageData.length} de {total} usuários
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safeP === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#d0daef] bg-white text-[#3d4f72] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Anterior
              </button>
              <span className="text-xs font-semibold text-[#1a2744] px-2">Página {safeP + 1} de {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safeP >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#d0daef] bg-white text-[#3d4f72] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Próxima
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmId !== null && (
        <ConfirmDialog
          message={`Tem certeza que deseja ${confirmAction} este usuário?`}
          confirmLabel={confirmAction === 'inativar' ? 'Inativar' : 'Ativar'}
          danger={confirmAction === 'inativar'}
          onConfirm={executeToggleStatus}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
