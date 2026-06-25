import { useState, useMemo } from 'react';
import {
  Plus, Search, SlidersHorizontal, ArrowLeft,
  Pencil, Eye, ToggleLeft, ToggleRight, ChevronUp, ChevronDown,
  ChevronsUpDown, X,
} from 'lucide-react';
import { Instituicao, TipoInstituicao, SituacaoCadastro } from './types';
import { MOCK_INSTITUICOES } from './mockData';

// ─── helpers ───────────────────────────────────────────────────────
const fmtCNPJ  = (v: string) => v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
const fmtPhone = (v: string) => v.length >= 10 ? v.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3') : v;
const fmtDate  = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/');

const inp  = 'w-full rounded-lg px-3 py-2.5 text-sm border outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-[#f0f4fb] border-[#d0daef] text-[#1a2744]';
const inpRO= 'w-full rounded-lg px-3 py-2.5 text-sm border bg-[#f8f9fc] border-[#e4e9f4] text-[#3d4f72] cursor-not-allowed';
const lbl  = 'block text-sm font-medium text-[#3d4f72] mb-1';

function TipoBadge({ t }: { t: TipoInstituicao }) {
  const cfg = { CENTRAL: { bg: '#f5f3ff', color: '#7c3aed' }, FILIAL: { bg: '#eff6ff', color: '#2b65bf' } };
  const { bg, color } = cfg[t];
  return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: bg, color }}>{t}</span>;
}

function StatusBadge({ s }: { s: SituacaoCadastro }) {
  const cfg: Record<SituacaoCadastro, { bg: string; color: string }> = {
    ATIVO: { bg: '#f0fdf4', color: '#16a34a' },
    INATIVO: { bg: '#f3f4f6', color: '#6b7280' },
    PENDENTE_ATUALIZACAO: { bg: '#fffbeb', color: '#d97706' },
  };
  const { bg, color } = cfg[s];
  const label = { ATIVO: 'Ativo', INATIVO: 'Inativo', PENDENTE_ATUALIZACAO: 'Pendente' }[s];
  return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: bg, color }}>{label}</span>;
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

const blankInst = (): Omit<Instituicao, 'id'> => ({
  nome: '', cnpj: '', nomeResponsavel: '', telefoneResponsavel: '', emailResponsavel: '',
  tipo: 'FILIAL', telefoneInstituicao: '', emailInstituicao: '',
  centralId: undefined, situacaoCadastro: 'ATIVO',
  endereco: { cep: '', bairro: '', rua: '', cidade: 'Caxias do Sul', estadoUF: 'RS', numero: '', complemento: '' },
});

// ════════════════════════════════════════════════════════════════
//  INSTITUTION FORM
// ════════════════════════════════════════════════════════════════
function InstituicaoForm({
  inst, centrais, mode, onBack, onSave,
}: {
  inst: Instituicao | null;
  centrais: Instituicao[];
  mode: 'new' | 'edit' | 'view';
  onBack: () => void;
  onSave: (i: Instituicao) => void;
}) {
  const ro = mode === 'view';
  const [form, setForm] = useState<Instituicao>(inst ?? { id: Date.now(), ...blankInst() });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState(mode);

  const f = <K extends keyof Instituicao>(k: K) => (v: Instituicao[K]) => setForm(prev => ({ ...prev, [k]: v }));
  const addr = (k: keyof Instituicao['endereco']) => (v: string) => setForm(prev => ({ ...prev, endereco: { ...prev.endereco, [k]: v } }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nome.trim()) errs.nome = 'Obrigatório';
    if (!form.cnpj.trim() || form.cnpj.length < 14) errs.cnpj = 'CNPJ inválido (14 dígitos)';
    if (!form.nomeResponsavel.trim()) errs.nomeResponsavel = 'Obrigatório';
    if (!form.endereco.rua.trim()) errs.rua = 'Obrigatório';
    if (!form.endereco.numero.trim()) errs.numero = 'Obrigatório';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => { if (validate()) onSave(form); };

  const c = (field: keyof Instituicao) => errors[field] ? inp.replace('border-[#d0daef]', 'border-red-400') : (viewMode === 'view' ? inpRO : inp);
  const titleMap = { new: 'Nova Instituição', edit: 'Editar Instituição', view: 'Detalhes da Instituição' };

  return (
    <div className="flex flex-col h-full">
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

      <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafd]">

        <Section title="Dados da Instituição">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={lbl}>Nome da Instituição *</label>
              <input className={c('nome')} disabled={viewMode === 'view'} value={form.nome}
                onChange={e => f('nome')(e.target.value)} placeholder="Nome completo" />
              {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
            </div>
            <div>
              <label className={lbl}>CNPJ *</label>
              <input className={c('cnpj')} disabled={viewMode === 'view'} value={form.cnpj}
                onChange={e => f('cnpj')(e.target.value.replace(/\D/g, '').slice(0, 14))} placeholder="14 dígitos" />
              {errors.cnpj && <p className="text-xs text-red-500 mt-1">{errors.cnpj}</p>}
            </div>
            <div>
              <label className={lbl}>Tipo *</label>
              <select className={viewMode === 'view' ? inpRO : inp} disabled={viewMode === 'view'} value={form.tipo}
                onChange={e => f('tipo')(e.target.value as TipoInstituicao)}>
                <option value="CENTRAL">Central</option>
                <option value="FILIAL">Filial</option>
              </select>
            </div>
            {form.tipo === 'FILIAL' && (
              <div>
                <label className={lbl}>Instituição Central</label>
                <select className={viewMode === 'view' ? inpRO : inp} disabled={viewMode === 'view'}
                  value={form.centralId ?? ''}
                  onChange={e => f('centralId')(e.target.value ? Number(e.target.value) : undefined as any)}>
                  <option value="">Selecionar...</option>
                  {centrais.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className={lbl}>Telefone da Instituição</label>
              <input className={viewMode === 'view' ? inpRO : inp} disabled={viewMode === 'view'} value={form.telefoneInstituicao}
                onChange={e => f('telefoneInstituicao')(e.target.value.replace(/\D/g,'').slice(0,11))} placeholder="DDD + número" />
            </div>
            <div>
              <label className={lbl}>E-mail da Instituição</label>
              <input type="email" className={viewMode === 'view' ? inpRO : inp} disabled={viewMode === 'view'} value={form.emailInstituicao}
                onChange={e => f('emailInstituicao')(e.target.value)} />
            </div>
            {viewMode !== 'new' && (
              <div>
                <label className={lbl}>Situação</label>
                <select className={viewMode === 'view' ? inpRO : inp} disabled={viewMode === 'view'} value={form.situacaoCadastro}
                  onChange={e => f('situacaoCadastro')(e.target.value as SituacaoCadastro)}>
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                </select>
              </div>
            )}
          </div>
        </Section>

        <Section title="Dados do Responsável">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={lbl}>Nome do Responsável *</label>
              <input className={c('nomeResponsavel')} disabled={viewMode === 'view'} value={form.nomeResponsavel}
                onChange={e => f('nomeResponsavel')(e.target.value)} />
              {errors.nomeResponsavel && <p className="text-xs text-red-500 mt-1">{errors.nomeResponsavel}</p>}
            </div>
            <div>
              <label className={lbl}>Telefone do Responsável</label>
              <input className={viewMode === 'view' ? inpRO : inp} disabled={viewMode === 'view'} value={form.telefoneResponsavel}
                onChange={e => f('telefoneResponsavel')(e.target.value.replace(/\D/g,'').slice(0,11))} placeholder="DDD + número" />
            </div>
            <div>
              <label className={lbl}>E-mail do Responsável</label>
              <input type="email" className={viewMode === 'view' ? inpRO : inp} disabled={viewMode === 'view'} value={form.emailResponsavel}
                onChange={e => f('emailResponsavel')(e.target.value)} />
            </div>
          </div>
        </Section>

        <Section title="Endereço">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={lbl}>CEP</label>
              <input className={viewMode === 'view' ? inpRO : inp} disabled={viewMode === 'view'} value={form.endereco.cep}
                onChange={e => addr('cep')(e.target.value.replace(/\D/g,'').slice(0,8))} placeholder="8 dígitos" />
            </div>
            <div className="col-span-2">
              <label className={lbl}>Rua / Logradouro *</label>
              <input className={errors.rua ? inp.replace('border-[#d0daef]','border-red-400') : (viewMode==='view'?inpRO:inp)} disabled={viewMode==='view'}
                value={form.endereco.rua} onChange={e => addr('rua')(e.target.value)} />
              {errors.rua && <p className="text-xs text-red-500 mt-1">{errors.rua}</p>}
            </div>
            <div>
              <label className={lbl}>Número *</label>
              <input className={errors.numero ? inp.replace('border-[#d0daef]','border-red-400') : (viewMode==='view'?inpRO:inp)} disabled={viewMode==='view'}
                value={form.endereco.numero} onChange={e => addr('numero')(e.target.value)} />
              {errors.numero && <p className="text-xs text-red-500 mt-1">{errors.numero}</p>}
            </div>
            <div>
              <label className={lbl}>Bairro</label>
              <input className={viewMode==='view'?inpRO:inp} disabled={viewMode==='view'} value={form.endereco.bairro} onChange={e => addr('bairro')(e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Complemento</label>
              <input className={viewMode==='view'?inpRO:inp} disabled={viewMode==='view'} value={form.endereco.complemento} onChange={e => addr('complemento')(e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Cidade</label>
              <input className={viewMode==='view'?inpRO:inp} disabled={viewMode==='view'} value={form.endereco.cidade} onChange={e => addr('cidade')(e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Estado</label>
              <input className={viewMode==='view'?inpRO:inp} disabled={viewMode==='view'} value={form.endereco.estadoUF} maxLength={2} onChange={e => addr('estadoUF')(e.target.value.toUpperCase().slice(0,2))} />
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  INSTITUICOES PAGE (LIST)
// ════════════════════════════════════════════════════════════════
export function InstituicoesPage() {
  const [instits, setInstits] = useState<Instituicao[]>(MOCK_INSTITUICOES);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selected, setSelected] = useState<Instituicao | null>(null);
  const [formMode, setFormMode] = useState<'new' | 'edit' | 'view'>('new');
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState<TipoInstituicao | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<SituacaoCadastro | 'ALL'>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('nome');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<'inativar' | 'ativar'>('inativar');

  const centrais = instits.filter(i => i.tipo === 'CENTRAL');

  const filtered = useMemo(() => {
    let r = instits.filter(i => {
      const q = search.toLowerCase();
      const matchSearch = !q || i.nome.toLowerCase().includes(q) || i.cnpj.includes(q) || i.nomeResponsavel.toLowerCase().includes(q);
      const matchTipo = filterTipo === 'ALL' || i.tipo === filterTipo;
      const matchStatus = filterStatus === 'ALL' || i.situacaoCadastro === filterStatus;
      return matchSearch && matchTipo && matchStatus;
    });
    r.sort((a, b) => {
      const av = (a as any)[sortField] ?? '';
      const bv = (b as any)[sortField] ?? '';
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return r;
  }, [instits, search, filterTipo, filterStatus, sortField, sortDir]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safeP = Math.min(page, totalPages - 1);
  const pageData = filtered.slice(safeP * perPage, safeP * perPage + perPage);

  const handleSort = (field: string) => {
    if (field === sortField) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const openForm = (mode: 'new' | 'edit' | 'view', i?: Instituicao) => {
    setSelected(i ?? null); setFormMode(mode); setView('form');
  };

  const handleSave = (i: Instituicao) => {
    setInstits(prev => {
      const idx = prev.findIndex(x => x.id === i.id);
      return idx >= 0 ? prev.map(x => x.id === i.id ? i : x) : [...prev, { ...i, id: Date.now() }];
    });
    setView('list');
  };

  const doToggle = (id: number, action: 'inativar' | 'ativar') => {
    setInstits(prev => prev.map(i => i.id === id ? { ...i, situacaoCadastro: action === 'inativar' ? 'INATIVO' : 'ATIVO' } : i));
    setConfirmId(null);
  };

  if (view === 'form') {
    return <InstituicaoForm inst={selected} centrais={centrais} mode={formMode} onBack={() => setView('list')} onSave={handleSave} />;
  }

  const thCls = 'px-4 py-3 text-left text-xs font-semibold text-[#6b7a9e] uppercase tracking-wide cursor-pointer select-none hover:text-[#2b65bf] whitespace-nowrap';
  const tdCls = 'px-4 py-3 text-sm text-[#3d4f72]';

  return (
    <div className="flex flex-col h-full bg-[#f8fafd]">
      <div className="px-6 py-5 bg-white border-b border-[#e4e9f4] flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold text-[#1a2744]">Instituições</h1>
          <p className="text-sm text-[#6b7a9e] mt-0.5">{total} {total === 1 ? 'instituição encontrada' : 'instituições encontradas'}</p>
        </div>
        <button onClick={() => openForm('new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: '#2b65bf', boxShadow: '0 2px 8px rgba(43,101,191,0.3)' }}>
          <Plus size={16} /> Nova Instituição
        </button>
      </div>

      <div className="px-6 py-3 bg-white border-b border-[#e4e9f4] space-y-3 shrink-0">
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a9e]" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Buscar por nome, CNPJ ou responsável..."
              className="w-full pl-9 pr-8 py-2 rounded-lg text-sm border border-[#d0daef] bg-[#f0f4fb] text-[#1a2744] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b7a9e] hover:text-[#1a2744]"><X size={14} /></button>}
          </div>
          <button onClick={() => setShowFilters(s => !s)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${showFilters ? 'border-[#2b65bf] text-[#2b65bf] bg-blue-50' : 'border-[#d0daef] text-[#6b7a9e] hover:bg-[#f0f4fb]'}`}>
            <SlidersHorizontal size={15} /> Filtros {(filterTipo !== 'ALL' || filterStatus !== 'ALL') && <span className="w-2 h-2 rounded-full bg-[#2b65bf] inline-block" />}
          </button>
        </div>
        {showFilters && (
          <div className="flex items-center gap-6 pt-1 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#6b7a9e]">Tipo:</span>
              {(['ALL', 'CENTRAL', 'FILIAL'] as const).map(t => (
                <button key={t} onClick={() => { setFilterTipo(t); setPage(0); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterTipo === t ? 'bg-[#2b65bf] text-white border-[#2b65bf]' : 'border-[#d0daef] text-[#6b7a9e] hover:bg-[#f0f4fb]'}`}>
                  {t === 'ALL' ? 'Todos' : t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#6b7a9e]">Situação:</span>
              {(['ALL', 'ATIVO', 'INATIVO'] as const).map(s => (
                <button key={s} onClick={() => { setFilterStatus(s); setPage(0); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterStatus === s ? 'bg-[#2b65bf] text-white border-[#2b65bf]' : 'border-[#d0daef] text-[#6b7a9e] hover:bg-[#f0f4fb]'}`}>
                  {s === 'ALL' ? 'Todos' : s === 'ATIVO' ? 'Ativo' : 'Inativo'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid List */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="bg-white rounded-2xl border border-[#d0daef] shadow-sm overflow-hidden flex flex-col max-h-full">
          <div className="overflow-y-auto flex-1">
            <table className="w-full border-collapse min-w-[700px]">
              <thead className="sticky top-0 z-10" style={{ background: '#f8f9fc' }}>
                <tr className="border-b border-[#e4e9f4]">
                  {([['nome','Nome'], ['cnpj','CNPJ'], ['tipo','Tipo'], ['nomeResponsavel','Responsável'], ['situacaoCadastro','Situação']] as [string,string][]).map(([f, label]) => (
                    <th key={f} className={thCls} onClick={() => handleSort(f)}>
                      {label}<SortIcon field={f} sortField={sortField} sortDir={sortDir} />
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-semibold text-[#6b7a9e] uppercase tracking-wide text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-[#6b7a9e]">Nenhuma instituição encontrada.</td></tr>
                ) : pageData.map((i, idx) => (
                  <tr key={i.id} className="border-b border-[#f0f4fb] transition-colors hover:bg-[#f8f9fc]"
                    style={{ background: idx % 2 === 0 ? 'white' : '#fafbfd' }}>
                    <td className={tdCls + ' font-medium text-[#1a2744]'}>{i.nome}</td>
                    <td className={tdCls}>{fmtCNPJ(i.cnpj)}</td>
                    <td className={tdCls}><TipoBadge t={i.tipo} /></td>
                    <td className={tdCls}>{i.nomeResponsavel}</td>
                    <td className={tdCls}><StatusBadge s={i.situacaoCadastro} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openForm('view', i)} title="Visualizar"
                          className="p-1.5 rounded-lg text-[#6b7a9e] hover:text-[#2b65bf] hover:bg-blue-50 transition-colors"><Eye size={15} /></button>
                        <button onClick={() => openForm('edit', i)} title="Editar"
                          className="p-1.5 rounded-lg text-[#6b7a9e] hover:text-[#2b65bf] hover:bg-blue-50 transition-colors"><Pencil size={15} /></button>
                        {i.situacaoCadastro !== 'INATIVO' ? (
                          <button onClick={() => { setConfirmId(i.id); setConfirmAction('inativar'); }} title="Inativar"
                            className="p-1.5 rounded-lg text-[#6b7a9e] hover:text-red-500 hover:bg-red-50 transition-colors"><ToggleLeft size={16} /></button>
                        ) : (
                          <button onClick={() => { setConfirmId(i.id); setConfirmAction('ativar'); }} title="Ativar"
                            className="p-1.5 rounded-lg text-[#6b7a9e] hover:text-green-600 hover:bg-green-50 transition-colors"><ToggleRight size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 bg-white border-t border-[#e4e9f4] flex items-center justify-between shrink-0 text-sm text-[#6b7a9e]">
            <div className="flex items-center gap-3">
              <span>Exibindo {total === 0 ? 0 : safeP * perPage + 1}–{Math.min(safeP * perPage + perPage, total)} de {total}</span>
              <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(0); }}
                className="border border-[#d0daef] rounded-lg px-2 py-1 text-xs bg-white outline-none">
                {[10, 25, 50].map(n => <option key={n} value={n}>{n} por página</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button disabled={safeP === 0} onClick={() => setPage(safeP - 1)}
                className="px-3 py-1.5 rounded-lg border border-[#d0daef] text-xs disabled:opacity-40 hover:bg-[#f0f4fb] transition-colors flex items-center gap-1">
                <ChevronDown className="rotate-90" size={12} /> Anterior
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className="w-8 h-8 rounded-lg text-xs font-medium transition-colors"
                  style={safeP === i ? { background: '#2b65bf', color: 'white' } : { border: '1px solid #d0daef', color: '#6b7a9e', background: 'white' }}>
                  {i + 1}
                </button>
              ))}
              <button disabled={safeP >= totalPages - 1} onClick={() => setPage(safeP + 1)}
                className="px-3 py-1.5 rounded-lg border border-[#d0daef] text-xs disabled:opacity-40 hover:bg-[#f0f4fb] transition-colors flex items-center gap-1">
                Próxima <ChevronDown className="-rotate-90" size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirmId !== null && (
        <ConfirmDialog
          message={`Deseja ${confirmAction} a instituição "${instits.find(i => i.id === confirmId)?.nome}"?`}
          confirmLabel={confirmAction === 'inativar' ? 'Inativar' : 'Ativar'}
          danger={confirmAction === 'inativar'}
          onConfirm={() => doToggle(confirmId, confirmAction)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
