import { useState, useMemo } from 'react';
import {
  Plus, Search, SlidersHorizontal, ArrowLeft,
  Pencil, Eye, ToggleLeft, ToggleRight, ChevronUp, ChevronDown,
  ChevronsUpDown, X,
} from 'lucide-react';
import { Parceiro, StatusParceiro, Endereco } from './types';
import { MOCK_PARCEIROS } from './mockData';

// ─── helpers ───────────────────────────────────────────────────────
const fmtCPF_CNPJ = (v: string) => {
  const clean = v.replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (clean.length === 14) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return v;
};

const fmtPhone = (v: string) => {
  const clean = v.replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  if (clean.length === 8) {
    return clean.replace(/(\d{4})(\d{4})/, '$1-$2');
  }
  return v;
};

const inp = 'w-full rounded-lg px-3 py-2.5 text-sm border outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-[#f0f4fb] border-[#d0daef] text-[#1a2744]';
const inpRO = 'w-full rounded-lg px-3 py-2.5 text-sm border bg-[#f8f9fc] border-[#e4e9f4] text-[#3d4f72] cursor-not-allowed';
const lbl = 'block text-sm font-medium text-[#3d4f72] mb-1';

function StatusBadge({ status }: { status: StatusParceiro }) {
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

const blankParceiro = (): Omit<Parceiro, 'id'> => ({
  nome: '',
  email: '',
  status: 'ativo',
  cpfCnpj: '',
  telefone: '',
  observacoes: '',
  endereco: { cep: '', bairro: '', rua: '', cidade: 'Caxias do Sul', estadoUF: 'RS', numero: '', complemento: '' }
});

// ════════════════════════════════════════════════════════════════
//  PARCEIRO FORM
// ════════════════════════════════════════════════════════════════
function ParceiroForm({
  parceiro, mode, onBack, onSave,
}: {
  parceiro: Parceiro | null;
  mode: 'new' | 'edit' | 'view';
  onBack: () => void;
  onSave: (p: Parceiro) => void;
}) {
  const ro = mode === 'view';
  const [form, setForm] = useState<Parceiro>(
    parceiro ?? { id: Date.now(), ...blankParceiro() }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState(mode);

  const f = <K extends keyof Parceiro>(k: K) => (v: Parceiro[K]) => setForm(prev => ({ ...prev, [k]: v }));
  const addr = (k: keyof Endereco) => (v: string) => {
    setForm(prev => ({
      ...prev,
      endereco: { ...prev.endereco, [k]: v }
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nome.trim()) errs.nome = 'Obrigatório';
    if (!form.email.trim()) errs.email = 'Obrigatório';
    if (!form.cpfCnpj.trim()) errs.cpfCnpj = 'Obrigatório';
    if (!form.telefone.trim()) errs.telefone = 'Obrigatório';
    if (!form.endereco.cep.trim()) errs.cep = 'Obrigatório';
    if (!form.endereco.rua.trim()) errs.rua = 'Obrigatório';
    if (!form.endereco.numero.trim()) errs.numero = 'Obrigatório';
    if (!form.endereco.bairro.trim()) errs.bairro = 'Obrigatório';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (ro) return;
    if (validate()) {
      onSave(form);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col h-full bg-[#f8fafd]">
      {/* Form header */}
      <div className="px-8 py-5 bg-white border-b border-[#e4e9f4] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="p-2 rounded-lg text-[#6b7a9e] hover:bg-[#f0f4fb] hover:text-[#1a2744] transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-[#1a2744]">
              {viewMode === 'new' ? 'Novo Parceiro' : viewMode === 'edit' ? 'Editar Parceiro' : 'Visualizar Parceiro'}
            </h2>
            <p className="text-xs text-[#6b7a9e] mt-1">Formulário de dados cadastrais do parceiro</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onBack} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-[#d0daef] text-[#3d4f72] hover:bg-[#f0f4fb] transition-colors">
            {ro ? 'Voltar' : 'Cancelar'}
          </button>
          {!ro && (
            <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors" style={{ background: '#2b65bf' }}>
              Salvar Parceiro
            </button>
          )}
          {ro && (
            <button type="button" onClick={() => setViewMode('edit')} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors" style={{ background: '#2b65bf' }}>
              Editar
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafd]">
          <Section title="Informações do Parceiro">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Nome Completo / Razão Social *</label>
                <input type="text" disabled={ro} className={ro ? inpRO : inp} value={form.nome} onChange={e => f('nome')(e.target.value)} />
                {errors.nome && <span className="text-xs text-red-500 font-medium mt-1 inline-block">{errors.nome}</span>}
              </div>

              <div>
                <label className={lbl}>CPF / CNPJ *</label>
                <input type="text" disabled={ro} placeholder="Apenas números..." className={ro ? inpRO : inp} value={form.cpfCnpj} onChange={e => f('cpfCnpj')(e.target.value.replace(/\D/g, ''))} />
                {form.cpfCnpj && <span className="text-xs text-[#6b7a9e] mt-1 block">Formatado: {fmtCPF_CNPJ(form.cpfCnpj)}</span>}
                {errors.cpfCnpj && <span className="text-xs text-red-500 font-medium mt-1 inline-block">{errors.cpfCnpj}</span>}
              </div>

              <div>
                <label className={lbl}>E-mail *</label>
                <input type="email" disabled={ro} className={ro ? inpRO : inp} value={form.email} onChange={e => f('email')(e.target.value)} />
                {errors.email && <span className="text-xs text-red-500 font-medium mt-1 inline-block">{errors.email}</span>}
              </div>

              <div>
                <label className={lbl}>Telefone *</label>
                <input type="text" disabled={ro} placeholder="Apenas números..." className={ro ? inpRO : inp} value={form.telefone} onChange={e => f('telefone')(e.target.value.replace(/\D/g, ''))} />
                {form.telefone && <span className="text-xs text-[#6b7a9e] mt-1 block">Formatado: {fmtPhone(form.telefone)}</span>}
                {errors.telefone && <span className="text-xs text-red-500 font-medium mt-1 inline-block">{errors.telefone}</span>}
              </div>

              <div className="md:col-span-2">
                <label className={lbl}>Situação do Cadastro</label>
                <select disabled={ro} className={ro ? inpRO : inp} value={form.status} onChange={e => f('status')(e.target.value as StatusParceiro)}>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={lbl}>Observações</label>
                <textarea disabled={ro} rows={3} className={ro ? inpRO : inp} style={{ resize: 'none' }} value={form.observacoes} onChange={e => f('observacoes')(e.target.value)} />
              </div>
            </div>
          </Section>

          <Section title="Endereço">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>CEP *</label>
                <input className={errors.cep ? inp.replace('border-[#d0daef]','border-red-400') : (ro ? inpRO : inp)} disabled={ro}
                  value={form.endereco.cep} onChange={ev => addr('cep')(ev.target.value.replace(/\D/g,'').slice(0,8))} placeholder="8 dígitos" />
                {errors.cep && <p className="text-xs text-red-500 mt-1">{errors.cep}</p>}
              </div>
              <div className="col-span-2">
                <label className={lbl}>Rua / Logradouro *</label>
                <input className={errors.rua ? inp.replace('border-[#d0daef]','border-red-400') : (ro ? inpRO : inp)} disabled={ro}
                  value={form.endereco.rua} onChange={ev => addr('rua')(ev.target.value)} />
                {errors.rua && <p className="text-xs text-red-500 mt-1">{errors.rua}</p>}
              </div>
              <div>
                <label className={lbl}>Número *</label>
                <input className={errors.numero ? inp.replace('border-[#d0daef]','border-red-400') : (ro ? inpRO : inp)} disabled={ro}
                  value={form.endereco.numero} onChange={ev => addr('numero')(ev.target.value)} />
                {errors.numero && <p className="text-xs text-red-500 mt-1">{errors.numero}</p>}
              </div>
              <div>
                <label className={lbl}>Bairro *</label>
                <input className={errors.bairro ? inp.replace('border-[#d0daef]','border-red-400') : (ro ? inpRO : inp)} disabled={ro}
                  value={form.endereco.bairro} onChange={ev => addr('bairro')(ev.target.value)} />
                {errors.bairro && <p className="text-xs text-red-500 mt-1">{errors.bairro}</p>}
              </div>
              <div>
                <label className={lbl}>Complemento</label>
                <input className={ro ? inpRO : inp} disabled={ro} value={form.endereco.complemento} onChange={ev => addr('complemento')(ev.target.value)} />
              </div>
              <div>
                <label className={lbl}>Cidade</label>
                <input className={ro ? inpRO : inp} disabled={ro} value={form.endereco.cidade} onChange={ev => addr('cidade')(ev.target.value)} />
              </div>
              <div>
                <label className={lbl}>Estado</label>
                <input className={ro ? inpRO : inp} disabled={ro} value={form.endereco.stateUF || form.endereco.estadoUF} maxLength={2}
                  onChange={ev => addr('estadoUF')(ev.target.value.toUpperCase().slice(0,2))} />
              </div>
            </div>
          </Section>
      </div>
    </form>
  );
}

// ════════════════════════════════════════════════════════════════
//  PARCEIROS PAGE (LIST)
// ════════════════════════════════════════════════════════════════
export function ParceirosPage({ initialView }: { initialView?: 'list' | 'form' }) {
  const [parceiros, setParceiros] = useState<Parceiro[]>(MOCK_PARCEIROS);
  const [view, setView] = useState<'list' | 'form'>(initialView ?? 'list');
  const [selected, setSelected] = useState<Parceiro | null>(null);
  const [formMode, setFormMode] = useState<'new' | 'edit' | 'view'>(initialView === 'form' ? 'new' : 'new');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusParceiro | 'ALL'>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('nome');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<'inativar' | 'ativar'>('inativar');

  const filtered = useMemo(() => {
    let r = parceiros.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.nome.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.cpfCnpj.includes(q);
      const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
    r.sort((a, b) => {
      const av = (a as any)[sortField] ?? '';
      const bv = (b as any)[sortField] ?? '';
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return r;
  }, [parceiros, search, filterStatus, sortField, sortDir]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safeP = Math.min(page, totalPages - 1);
  const pageData = filtered.slice(safeP * perPage, safeP * perPage + perPage);

  const handleSort = (field: string) => {
    if (field === sortField) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const openForm = (mode: 'new' | 'edit' | 'view', p?: Parceiro) => {
    setSelected(p ?? null); setFormMode(mode); setView('form');
  };

  const handleSave = (p: Parceiro) => {
    setParceiros(prev => {
      const idx = prev.findIndex(x => x.id === p.id);
      return idx >= 0 ? prev.map(x => x.id === p.id ? p : x) : [p, ...prev];
    });
    setView('list');
    setSelected(null);
  };

  const handleToggleStatus = (id: number, currentStatus: StatusParceiro) => {
    setConfirmId(id);
    setConfirmAction(currentStatus === 'ativo' ? 'inativar' : 'ativar');
  };

  const executeToggleStatus = () => {
    if (confirmId === null) return;
    setParceiros(prev => prev.map(p => p.id === confirmId ? { ...p, status: confirmAction === 'inativar' ? 'inativo' : 'ativo' } : p));
    setConfirmId(null);
  };

  if (view === 'form') {
    return <ParceiroForm parceiro={selected} mode={formMode} onBack={() => { setView('list'); setSelected(null); }} onSave={handleSave} />;
  }

  const thCls = 'px-4 py-3 text-left text-xs font-semibold text-[#6b7a9e] uppercase tracking-wide cursor-pointer select-none hover:text-[#2b65bf] whitespace-nowrap';
  const tdCls = 'px-4 py-3 text-sm text-[#3d4f72]';

  return (
    <div className="flex flex-col h-full bg-[#f8fafd]">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#e4e9f4] shrink-0">
        <div>
          <h1 className="text-lg font-bold text-[#1a2744]">Parceiros</h1>
          <p className="text-sm text-[#6b7a9e] mt-0.5">{total} {total === 1 ? 'parceiro encontrado' : 'parceiros encontrados'}</p>
        </div>
        <button onClick={() => openForm('new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors cursor-pointer"
          style={{ background: '#2b65bf' }}>
          <Plus size={16} /> Cadastrar Parceiro
        </button>
      </div>

      {/* Controls */}
      <div className="px-8 py-4 bg-white border-b border-[#e4e9f4] flex flex-wrap gap-4 items-center justify-between shrink-0">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a9e]" />
          <input type="text" placeholder="Buscar por nome, e-mail ou CPF/CNPJ..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm outline-none transition-all bg-[#f0f4fb] border-[#d0daef] focus:border-[#2b65bf] focus:bg-white text-[#1a2744]"
            value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a9e] hover:text-red-500 transition-colors">
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={() => setShowFilters(s => !s)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-all hover:bg-[#f0f4fb]"
            style={{
              background: showFilters || filterStatus !== 'ALL' ? '#e1ecf7' : 'white',
              borderColor: showFilters || filterStatus !== 'ALL' ? '#2b65bf' : '#d0daef',
              color: showFilters || filterStatus !== 'ALL' ? '#2b65bf' : '#3d4f72',
            }}>
            <SlidersHorizontal size={15} /> Filtros
          </button>
        </div>
      </div>

      {/* Filters expand block */}
      {showFilters && (
        <div className="px-8 py-4 bg-[#f8fafc] border-b border-[#e4e9f4] flex gap-4 shrink-0">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#6b7a9e] uppercase tracking-wide">Situação do Cadastro</label>
            <select className="rounded-lg border border-[#d0daef] bg-white px-3 py-1.5 text-xs text-[#3d4f72] outline-none focus:border-[#2b65bf]"
              value={filterStatus} onChange={e => { setFilterStatus(e.target.value as StatusParceiro | 'ALL'); setPage(0); }}>
              <option value="ALL">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="bg-white rounded-2xl border border-[#d0daef] shadow-sm overflow-hidden flex flex-col max-h-full">
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#e4e9f4] bg-[#f8fafc] sticky top-0 z-10">
                  <th onClick={() => handleSort('nome')} className={thCls}>Nome {sortField === 'nome' && <SortIcon field="nome" sortField={sortField} sortDir={sortDir} />}</th>
                  <th onClick={() => handleSort('email')} className={thCls}>E-mail {sortField === 'email' && <SortIcon field="email" sortField={sortField} sortDir={sortDir} />}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a9e] uppercase tracking-wide">CPF / CNPJ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a9e] uppercase tracking-wide">Telefone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6b7a9e] uppercase tracking-wide">Situação</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6b7a9e] uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e9f4]">
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm font-medium text-[#6b7a9e]">Nenhum parceiro encontrado.</td>
                  </tr>
                ) : (
                  pageData.map(p => (
                    <tr key={p.id} className="hover:bg-[#f8fafc]/50 transition-colors">
                      <td className={`${tdCls} font-bold`}>{p.nome}</td>
                      <td className={tdCls}>{p.email}</td>
                      <td className={tdCls}>{fmtCPF_CNPJ(p.cpfCnpj)}</td>
                      <td className={tdCls}>{fmtPhone(p.telefone)}</td>
                      <td className={tdCls}><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => openForm('view', p)} title="Visualizar" className="p-1.5 rounded text-[#6b7a9e] hover:text-[#2b65bf] hover:bg-[#f0f4fb] transition-colors"><Eye size={16} /></button>
                          <button onClick={() => openForm('edit', p)} title="Editar" className="p-1.5 rounded text-[#6b7a9e] hover:text-[#2b65bf] hover:bg-[#f0f4fb] transition-colors"><Pencil size={16} /></button>
                          <button onClick={() => handleToggleStatus(p.id, p.status)} title={p.status === 'ativo' ? 'Inativar' : 'Ativar'}
                            className={`p-1.5 rounded transition-colors ${p.status === 'ativo' ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                            {p.status === 'ativo' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-[#e4e9f4] bg-[#f8fafc] flex justify-between items-center shrink-0">
              <span className="text-xs font-semibold text-[#6b7a9e]">Página {safeP + 1} de {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={safeP === 0} onClick={() => setPage(p => p - 1)}
                  className="px-3.5 py-1.5 rounded-lg border text-xs font-bold border-[#d0daef] bg-white text-[#3d4f72] hover:bg-[#f0f4fb] disabled:opacity-50 disabled:pointer-events-none transition-colors">Anterior</button>
                <button disabled={safeP === totalPages - 1} onClick={() => setPage(p => p + 1)}
                  className="px-3.5 py-1.5 rounded-lg border text-xs font-bold border-[#d0daef] bg-white text-[#3d4f72] hover:bg-[#f0f4fb] disabled:opacity-50 disabled:pointer-events-none transition-colors">Próxima</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmId !== null && (
        <ConfirmDialog
          message={`Tem certeza que deseja ${confirmAction} este parceiro?`}
          confirmLabel={confirmAction === 'inativar' ? 'Inativar' : 'Ativar'}
          danger={confirmAction === 'inativar'}
          onConfirm={executeToggleStatus}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
