import { useState, useMemo } from 'react';
import {
  Plus, Search, SlidersHorizontal, ArrowLeft,
  Pencil, Eye, ToggleLeft, ToggleRight, ChevronUp, ChevronDown,
  ChevronsUpDown, X,
} from 'lucide-react';
import { Item, CategoriaItem, UnidadeMedida } from './types';
import { MOCK_ITENS } from './mockData';

// ─── helpers ───────────────────────────────────────────────────────
const fmtDate = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/');

const inp = 'w-full rounded-lg px-3 py-2.5 text-sm border outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-[#f0f4fb] border-[#d0daef] text-[#1a2744]';
const inpRO = 'w-full rounded-lg px-3 py-2.5 text-sm border bg-[#f8f9fc] border-[#e4e9f4] text-[#3d4f72] cursor-not-allowed';
const lbl = 'block text-sm font-medium text-[#3d4f72] mb-1';

const CATEGORIA_LABEL: Record<CategoriaItem, string> = {
  ALIMENTO: 'Alimento',
  HIGIENE_PESSOAL: 'Higiene Pessoal',
  LIMPEZA: 'Limpeza',
  VESTUARIO: 'Vestuário',
  MEDICAMENTO: 'Medicamento',
  ESCOLAR: 'Escolar',
  MOVEIS_UTENSILIOS: 'Móveis e Utensílios',
};

const UNIDADE_LABEL: Record<UnidadeMedida, string> = {
  KG: 'Kg',
  LITRO: 'Litro',
  UNIDADE: 'Unidade',
  PACOTE: 'Pacote',
  PAR: 'Par',
  KIT: 'Kit',
};

function StatusBadge({ active }: { active: boolean }) {
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

const blankItem = (): Omit<Item, 'id' | 'dataCadastro'> => ({
  nome: '',
  descricao: '',
  codigoBarras: '',
  categoria: 'ALIMENTO',
  unidadeMedida: 'KG',
  ativo: true,
  exigeControleValidade: false,
  estoque: 0,
  tamanho: '',
});

// ════════════════════════════════════════════════════════════════
//  ITEM FORM
// ════════════════════════════════════════════════════════════════
function ItemForm({
  item, mode, onBack, onSave,
}: {
  item: Item | null;
  mode: 'new' | 'edit' | 'view';
  onBack: () => void;
  onSave: (it: Item) => void;
}) {
  const ro = mode === 'view';
  const [form, setForm] = useState<Item>(
    item ?? { id: Date.now(), dataCadastro: new Date().toISOString().split('T')[0], ...blankItem() }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState(mode);

  const f = <K extends keyof Item>(k: K) => (v: Item[K]) => setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nome.trim()) errs.nome = 'Obrigatório';
    if (!form.categoria) errs.categoria = 'Obrigatório';
    if (!form.unidadeMedida) errs.unidadeMedida = 'Obrigatório';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => { if (validate()) onSave(form); };

  const c = (field: keyof Item) => errors[field] ? inp.replace('border-[#d0daef]', 'border-red-400') : (viewMode === 'view' ? inpRO : inp);
  const titleMap = { new: 'Novo Item', edit: 'Editar Item', view: 'Detalhes do Item' };

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
        <Section title="Dados do Item">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={lbl}>Nome do Item *</label>
              <input className={c('nome')} disabled={viewMode === 'view'} value={form.nome}
                onChange={e => f('nome')(e.target.value)} placeholder="Ex: Arroz Branco Tio Juca Tipo 1 (1kg)" />
              {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
            </div>

            <div className="col-span-2">
              <label className={lbl}>Descrição</label>
              <textarea className={viewMode === 'view' ? inpRO : inp} disabled={viewMode === 'view'} value={form.descricao}
                onChange={e => f('descricao')(e.target.value)} placeholder="Descrição detalhada do item..." rows={3} />
            </div>

            <div>
              <label className={lbl}>Código de Barras</label>
              <input className={viewMode === 'view' ? inpRO : inp} disabled={viewMode === 'view'} value={form.codigoBarras}
                onChange={e => f('codigoBarras')(e.target.value.replace(/\D/g, ''))} placeholder="Somente números" />
            </div>

            <div>
              <label className={lbl}>Tamanho (Opcional)</label>
              <input className={viewMode === 'view' ? inpRO : inp} disabled={viewMode === 'view'} value={form.tamanho || ''}
                onChange={e => f('tamanho')(e.target.value)} placeholder="Ex: M, G, 42, 14" />
            </div>

            <div>
              <label className={lbl}>Categoria *</label>
              <select className={viewMode === 'view' ? inpRO : inp} disabled={viewMode === 'view'} value={form.categoria}
                onChange={e => f('categoria')(e.target.value as CategoriaItem)}>
                {Object.entries(CATEGORIA_LABEL).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={lbl}>Unidade de Medida *</label>
              <select className={viewMode === 'view' ? inpRO : inp} disabled={viewMode === 'view'} value={form.unidadeMedida}
                onChange={e => f('unidadeMedida')(e.target.value as UnidadeMedida)}>
                {Object.entries(UNIDADE_LABEL).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 mt-4 select-none col-span-2">
              <button type="button"
                onClick={() => viewMode !== 'view' && f('exigeControleValidade')(!form.exigeControleValidade)}
                className="flex items-center justify-center w-5 h-5 rounded border-2 transition-all shrink-0"
                style={{ borderColor: form.exigeControleValidade ? '#2b65bf' : '#d0daef', background: form.exigeControleValidade ? '#2b65bf' : 'white', cursor: viewMode === 'view' ? 'not-allowed' : 'pointer' }}>
                {form.exigeControleValidade && <svg viewBox="0 0 10 8" className="w-3 h-3 text-white"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </button>
              <span className="text-sm text-[#3d4f72]">Exige Controle de Validade</span>
            </div>

            {viewMode !== 'new' && (
              <div>
                <label className={lbl}>Situação</label>
                <select className={viewMode === 'view' ? inpRO : inp} disabled={viewMode === 'view'} value={form.ativo ? 'true' : 'false'}
                  onChange={e => f('ativo')(e.target.value === 'true')}>
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
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
//  ITENS PAGE (LIST)
// ════════════════════════════════════════════════════════════════
export function ItensPage({ initialView }: { initialView?: 'list' | 'form' }) {
  const [itens, setItens] = useState<Item[]>(MOCK_ITENS);
  const [view, setView] = useState<'list' | 'form'>(initialView ?? 'list');
  const [selected, setSelected] = useState<Item | null>(null);
  const [formMode, setFormMode] = useState<'new' | 'edit' | 'view'>(initialView === 'form' ? 'new' : 'new');
  const [search, setSearch] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<CategoriaItem | 'ALL'>('ALL');
  const [filterAtivo, setFilterAtivo] = useState<'ALL' | 'true' | 'false'>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('nome');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<'inativar' | 'ativar'>('inativar');

  const filtered = useMemo(() => {
    let r = itens.filter(i => {
      const q = search.toLowerCase();
      const matchSearch = !q || i.nome.toLowerCase().includes(q) || (i.descricao && i.descricao.toLowerCase().includes(q)) || i.codigoBarras.includes(q);
      const matchCategoria = filterCategoria === 'ALL' || i.categoria === filterCategoria;
      const matchAtivo = filterAtivo === 'ALL' || (filterAtivo === 'true' ? i.ativo : !i.ativo);
      return matchSearch && matchCategoria && matchAtivo;
    });
    r.sort((a, b) => {
      const av = (a as any)[sortField] ?? '';
      const bv = (b as any)[sortField] ?? '';
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return r;
  }, [itens, search, filterCategoria, filterAtivo, sortField, sortDir]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safeP = Math.min(page, totalPages - 1);
  const pageData = filtered.slice(safeP * perPage, safeP * perPage + perPage);

  const handleSort = (field: string) => {
    if (field === sortField) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    setConfirmId(id);
    setConfirmAction(currentStatus ? 'inativar' : 'ativar');
  };

  const executeToggleStatus = () => {
    if (confirmId === null) return;
    setItens(prev => prev.map(i => i.id === confirmId ? { ...i, ativo: !i.ativo } : i));
    setConfirmId(null);
  };

  const handleSave = (itemSalvo: Item) => {
    if (formMode === 'new') {
      setItens(prev => [itemSalvo, ...prev]);
    } else {
      setItens(prev => prev.map(i => i.id === itemSalvo.id ? itemSalvo : i));
    }
    setView('list');
    setSelected(null);
  };

  if (view === 'form') {
    return <ItemForm item={selected} mode={formMode} onBack={() => { setView('list'); setSelected(null); }} onSave={handleSave} />;
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fafd]">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#e4e9f4] shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[#1a2744]">Cadastro de Itens</h2>
          <p className="text-xs text-[#6b7a9e] mt-1">Gerencie os itens disponíveis para doação no estoque</p>
        </div>
        <button onClick={() => { setFormMode('new'); setSelected(null); setView('form'); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg active:scale-95"
          style={{ background: `linear-gradient(135deg, #3b7dd8 0%, #2b65bf 100%)` }}>
          <Plus size={16} strokeWidth={2.5} /> Novo Item
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col gap-4 px-8 py-4 bg-white border-b border-[#e4e9f4] shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Pesquisar por nome, descrição ou código de barras..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-[#f0f4fb] border-[#d0daef] text-[#1a2744]" />
          </div>
          <button onClick={() => setShowFilters(s => !s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-[#2b65bf]' : 'border-[#d0daef] text-[#3d4f72] hover:bg-[#f0f4fb]'}`}>
            <SlidersHorizontal size={15} /> Filtros
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-4 p-4 rounded-xl border border-[#d0daef] bg-[#f8fafc] animate-fadeIn">
            <div className="w-48">
              <label className="block text-xs font-semibold text-[#3d4f72] mb-1.5">Categoria</label>
              <select value={filterCategoria} onChange={e => { setFilterCategoria(e.target.value as any); setPage(0); }}
                className="w-full rounded-lg px-2.5 py-1.5 text-xs border outline-none bg-white border-[#d0daef] text-[#1a2744]">
                <option value="ALL">Todas</option>
                {Object.entries(CATEGORIA_LABEL).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div className="w-40">
              <label className="block text-xs font-semibold text-[#3d4f72] mb-1.5">Situação</label>
              <select value={filterAtivo} onChange={e => { setFilterAtivo(e.target.value as any); setPage(0); }}
                className="w-full rounded-lg px-2.5 py-1.5 text-xs border outline-none bg-white border-[#d0daef] text-[#1a2744]">
                <option value="ALL">Todos</option>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
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
                  <th onClick={() => handleSort('categoria')} className="cursor-pointer px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Categoria <SortIcon field="categoria" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Unidade de Medida
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none text-center">
                    Exige Validade
                  </th>
                  <th onClick={() => handleSort('ativo')} className="cursor-pointer px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Status <SortIcon field="ativo" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e9f4]">
                {pageData.map(i => (
                  <tr key={i.id} className="hover:bg-[#f8fafc]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-[#1a2744]">
                        {i.nome} {i.tamanho && <span className="text-xs font-normal text-gray-500 ml-1.5">(Tam: {i.tamanho})</span>}
                      </div>
                      {i.codigoBarras && <div className="text-xs text-[#6b7a9e] mt-0.5">EAN: {i.codigoBarras}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#3d4f72]">{CATEGORIA_LABEL[i.categoria]}</td>
                    <td className="px-6 py-4 text-sm text-[#3d4f72]">{UNIDADE_LABEL[i.unidadeMedida]}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${i.exigeControleValidade ? 'bg-amber-400' : 'bg-gray-200'}`} title={i.exigeControleValidade ? 'Exige' : 'Não exige'} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge active={i.ativo} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => { setSelected(i); setFormMode('view'); setView('form'); }}
                          className="p-2 rounded-lg hover:bg-gray-100 text-[#6b7a9e] hover:text-[#1a2744] transition-colors" title="Visualizar">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => { setSelected(i); setFormMode('edit'); setView('form'); }}
                          className="p-2 rounded-lg hover:bg-gray-100 text-[#6b7a9e] hover:text-[#2b65bf] transition-colors" title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleToggleStatus(i.id, i.ativo)}
                          className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${i.ativo ? 'text-green-500 hover:text-green-600' : 'text-gray-400 hover:text-gray-500'}`}
                          title={i.ativo ? 'Inativar' : 'Ativar'}>
                          {i.ativo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pageData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#6b7a9e]">Nenhum item encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#e4e9f4] bg-[#f8fafc] shrink-0">
            <div className="text-xs font-medium text-[#6b7a9e]">
              Mostrando {pageData.length} de {total} itens
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
          message={`Tem certeza que deseja ${confirmAction} este item?`}
          confirmLabel={confirmAction === 'inativar' ? 'Inativar' : 'Ativar'}
          danger={confirmAction === 'inativar'}
          onConfirm={executeToggleStatus}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
