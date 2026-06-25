import { useState, useMemo } from 'react';
import {
  Search, SlidersHorizontal, ChevronUp, ChevronDown,
  ChevronsUpDown, Pencil, Eye, Trash2, Plus, ArrowLeft,
  Calendar, Check, X, Building, User
} from 'lucide-react';
import { MOCK_ATENDIMENTOS, MOCK_DOADORES, MOCK_PARCEIROS } from './mockData';
import { Atendimento, TipoDoadorParceiro } from './types';

// ─── CSS classes (figma standard) ───────────────────────────────────
const inp = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all bg-[#f0f4fb] border border-[#d0daef] text-[#1a2744] focus:border-[#2b65bf] focus:ring-2 focus:ring-blue-100 disabled:opacity-60 disabled:cursor-not-allowed";
const inpRO = "w-full rounded-xl px-4 py-3 text-sm outline-none bg-[#f0f4fb] border border-transparent text-[#3d4f72] font-semibold cursor-not-allowed";
const lbl = "block text-xs font-semibold text-[#3d4f72] mb-1.5 uppercase tracking-wider";

const fmtDateTime = (iso: string) => {
  if (!iso) return '-';
  const parts = iso.split('T');
  const dateStr = parts[0].split('-').reverse().join('/');
  const timeStr = parts[1] ? parts[1].slice(0, 5) : '00:00';
  return `${dateStr} às ${timeStr}`;
};

function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: 'asc' | 'desc' }) {
  if (field !== sortField) return <ChevronsUpDown size={13} className="text-gray-400 inline ml-1" />;
  return sortDir === 'asc' ? <ChevronUp size={13} className="inline ml-1" style={{ color: '#2b65bf' }} /> : <ChevronDown size={13} className="inline ml-1" style={{ color: '#2b65bf' }} />;
}

// Resolução de nomes
const getDoadorParceiroNome = (tipo: TipoDoadorParceiro, id: number) => {
  if (tipo === 'Doador') {
    return MOCK_DOADORES.find(d => d.id === id)?.nome || `Doador (ID: ${id})`;
  } else {
    return MOCK_PARCEIROS.find(p => p.id === id)?.nome || `Parceiro (ID: ${id})`;
  }
};

// ════════════════════════════════════════════════════════════════
//  DELETE CONFIRMATION MODAL
// ════════════════════════════════════════════════════════════════
function DeleteModal({ onClose, onConfirm, item }: { onClose: () => void; onConfirm: () => void; item: Atendimento }) {
  const resolvedName = getDoadorParceiroNome(item.tipoDoador, item.doadorParceiroId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1a2744]/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-[#d0daef] animate-fadeIn">
        <h3 className="text-lg font-bold text-[#1a2744]">Excluir Atendimento</h3>
        <p className="text-sm text-[#6b7a9e] mt-2">
          Tem certeza de que deseja excluir o atendimento realizado para <strong className="text-[#1a2744]">{resolvedName}</strong> em <strong className="text-[#1a2744]">{fmtDateTime(item.dataHora)}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold border border-[#d0daef] text-[#3d4f72] hover:bg-[#f0f4fb] transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors">
            Confirmar Exclusão
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  FORM COMPONENT
// ════════════════════════════════════════════════════════════════
function AtendimentoForm({
  atendimento,
  viewMode,
  onBack,
  onSave
}: {
  atendimento: Atendimento;
  viewMode: 'view' | 'edit' | 'new';
  onBack: () => void;
  onSave: (form: Atendimento) => void;
}) {
  const [form, setForm] = useState<Atendimento>({ ...atendimento });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const ro = viewMode === 'view';

  // Opções dinâmicas para doadores e parceiros ativos
  const doadoresOptions = useMemo(() => MOCK_DOADORES.filter(d => d.status === 'ativo'), []);
  const parceirosOptions = useMemo(() => MOCK_PARCEIROS.filter(p => p.status === 'ativo'), []);

  const handleFieldChange = (field: keyof Atendimento, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      // Se mudar o tipo de doador, limpa a seleção do ID
      if (field === 'tipoDoador') {
        updated.doadorParceiroId = 0;
      }
      return updated;
    });
    if (errors[field]) {
      setErrors(prev => {
        const u = { ...prev };
        delete u[field];
        return u;
      });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.dataHora) errs.dataHora = 'Data e hora é obrigatória.';
    if (!form.tipoDoador) errs.tipoDoador = 'Tipo de cadastro é obrigatório.';
    if (!form.doadorParceiroId || form.doadorParceiroId === 0) errs.doadorParceiroId = 'Selecione o doador ou parceiro.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  const options = form.tipoDoador === 'Doador' ? doadoresOptions : parceirosOptions;

  return (
    <div className="flex flex-col h-full bg-[#f8fafd]">
      {/* Header Form */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#e4e9f4] shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl text-[#3d4f72] hover:bg-[#f0f4fb] transition-colors border border-transparent hover:border-[#d0daef]">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-[#1a2744]">
              {viewMode === 'new' && 'Novo Atendimento'}
              {viewMode === 'edit' && 'Editar Atendimento'}
              {viewMode === 'view' && 'Visualizar Atendimento'}
            </h2>
            <p className="text-xs text-[#6b7a9e] mt-1">
              {viewMode === 'new' && 'Registre um novo atendimento técnico ou triagem'}
              {viewMode === 'edit' && 'Altere os campos do registro de atendimento'}
              {viewMode === 'view' && 'Detalhamento do atendimento registrado'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {ro ? (
            <button onClick={onBack} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#d0daef] text-[#3d4f72] hover:bg-[#f0f4fb] transition-colors">
              Voltar
            </button>
          ) : (
            <>
              <button type="button" onClick={onBack} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#d0daef] text-[#3d4f72] hover:bg-[#f0f4fb] transition-colors">
                Cancelar
              </button>
              <button type="button" onClick={handleSubmit} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors" style={{ background: '#2b65bf' }}>
                Salvar Atendimento
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body Form */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafd]">
        <div className="bg-white rounded-2xl border border-[#d0daef] shadow-sm p-8 flex flex-col gap-6">
          <h3 className="text-base font-bold text-[#1a2744] border-b border-[#e4e9f4] pb-3">Informações do Registro</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo 1: Data e Hora */}
            <div>
              <label className={lbl}>Data e Hora do Atendimento *</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  disabled={ro}
                  className={ro ? inpRO : inp}
                  value={form.dataHora ? form.dataHora.slice(0, 16) : ''}
                  onChange={e => handleFieldChange('dataHora', e.target.value)}
                />
              </div>
              {errors.dataHora && <span className="text-xs text-red-500 font-medium mt-1 inline-block">{errors.dataHora}</span>}
            </div>

            {/* Campo 2: Tipo de Doador/Parceiro */}
            <div>
              <label className={lbl}>Tipo de Beneficiário *</label>
              {ro ? (
                <input
                  type="text"
                  disabled
                  className={inpRO}
                  value={form.tipoDoador}
                />
              ) : (
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 text-sm text-[#1a2744] font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="tipoDoador"
                      checked={form.tipoDoador === 'Doador'}
                      onChange={() => handleFieldChange('tipoDoador', 'Doador')}
                      className="accent-[#2b65bf]"
                    />
                    Doador
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#1a2744] font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="tipoDoador"
                      checked={form.tipoDoador === 'Parceiro'}
                      onChange={() => handleFieldChange('tipoDoador', 'Parceiro')}
                      className="accent-[#2b65bf]"
                    />
                    Parceiro
                  </label>
                </div>
              )}
              {errors.tipoDoador && <span className="text-xs text-red-500 font-medium mt-1 inline-block">{errors.tipoDoador}</span>}
            </div>

            {/* Campo 3: Seleção Dinâmica Doador/Parceiro */}
            <div className="md:col-span-2">
              <label className={lbl}>Selecionar {form.tipoDoador === 'Doador' ? 'Doador' : 'Parceiro'} *</label>
              {ro ? (
                <input
                  type="text"
                  disabled
                  className={inpRO}
                  value={getDoadorParceiroNome(form.tipoDoador, form.doadorParceiroId)}
                />
              ) : (
                <select
                  value={form.doadorParceiroId || ''}
                  onChange={e => handleFieldChange('doadorParceiroId', Number(e.target.value))}
                  className={inp}
                >
                  <option value="">Selecione...</option>
                  {options.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.nome} ({opt.cpfCnpj})
                    </option>
                  ))}
                </select>
              )}
              {errors.doadorParceiroId && <span className="text-xs text-red-500 font-medium mt-1 inline-block">{errors.doadorParceiroId}</span>}
            </div>

            {/* Campo 4: Observações */}
            <div className="md:col-span-2">
              <label className={lbl}>Observações / Relato do Atendimento</label>
              <textarea
                disabled={ro}
                className={ro ? inpRO : inp}
                value={form.observacao}
                onChange={e => handleFieldChange('observacao', e.target.value)}
                placeholder="Descreva o atendimento, alinhamento técnico ou encaminhamentos realizados..."
                rows={5}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════════════
export function AtendimentosPage() {
  const [list, setList] = useState<Atendimento[]>(MOCK_ATENDIMENTOS);
  const [viewMode, setViewMode] = useState<'list' | 'view' | 'edit' | 'new'>('list');
  const [selectedItem, setSelectedItem] = useState<Atendimento | null>(null);
  const [deleteItem, setDeleteItem] = useState<Atendimento | null>(null);

  // Filtros e busca
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('dataHora');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [perPage] = useState(10);

  // Computa a busca e os filtros
  const filteredData = useMemo(() => {
    let r = list.filter(item => {
      const q = search.toLowerCase();
      const resolvedName = getDoadorParceiroNome(item.tipoDoador, item.doadorParceiroId).toLowerCase();
      const matchSearch = !q ||
        resolvedName.includes(q) ||
        (item.observacao && item.observacao.toLowerCase().includes(q));

      const matchTipo = filterTipo === 'ALL' || item.tipoDoador === filterTipo;

      return matchSearch && matchTipo;
    });

    r.sort((a, b) => {
      let av = (a as any)[sortField];
      let bv = (b as any)[sortField];

      // Resolver o nome do Doador/Parceiro caso esteja ordenando por Beneficiário
      if (sortField === 'beneficiario') {
        av = getDoadorParceiroNome(a.tipoDoador, a.doadorParceiroId);
        bv = getDoadorParceiroNome(b.tipoDoador, b.doadorParceiroId);
      }

      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return r;
  }, [list, search, filterTipo, sortField, sortDir]);

  const total = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safeP = Math.min(page, totalPages - 1);
  const pageData = filteredData.slice(safeP * perPage, safeP * perPage + perPage);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleSave = (savedForm: Atendimento) => {
    if (viewMode === 'new') {
      const newId = list.length > 0 ? Math.max(...list.map(x => x.id)) + 1 : 1;
      const newRecord: Atendimento = {
        ...savedForm,
        id: newId,
        tipoCadastro: 'Manual' // Controlado internamente
      };
      setList(prev => [newRecord, ...prev]);
    } else {
      setList(prev => prev.map(x => x.id === savedForm.id ? savedForm : x));
    }
    setViewMode('list');
    setSelectedItem(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteItem) {
      setList(prev => prev.filter(x => x.id !== deleteItem.id));
      setDeleteItem(null);
    }
  };

  if (viewMode !== 'list' && selectedItem) {
    return (
      <AtendimentoForm
        atendimento={selectedItem}
        viewMode={viewMode}
        onBack={() => { setViewMode('list'); setSelectedItem(null); }}
        onSave={handleSave}
      />
    );
  }

  const blankAtendimento = (): Atendimento => ({
    id: 0,
    dataHora: new Date().toISOString().slice(0, 16),
    tipoCadastro: 'Manual',
    observacao: '',
    tipoDoador: 'Doador',
    doadorParceiroId: 0
  });

  return (
    <div className="flex flex-col h-full bg-[#f8fafd]">
      {/* Header list */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#e4e9f4] shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[#1a2744]">Atendimentos</h2>
          <p className="text-xs text-[#6b7a9e] mt-1">Gerencie a realização de atendimentos a doadores e parceiros</p>
        </div>
        <button
          onClick={() => { setSelectedItem(blankAtendimento()); setViewMode('new'); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-sm active:scale-95"
          style={{ background: '#2b65bf' }}
        >
          <Plus size={16} /> Novo Atendimento
        </button>
      </div>

      {/* Control bar */}
      <div className="flex flex-col gap-4 px-8 py-4 bg-white border-b border-[#e4e9f4] shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Pesquisar por observação ou beneficiário..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-[#f0f4fb] border-[#d0daef] text-[#1a2744]"
            />
          </div>
          <button
            onClick={() => setShowFilters(s => !s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-[#2b65bf]' : 'border-[#d0daef] text-[#3d4f72] hover:bg-[#f0f4fb]'}`}
          >
            <SlidersHorizontal size={15} /> Filtros
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-4 p-4 rounded-xl border border-[#d0daef] bg-[#f8fafc] animate-fadeIn">
            <div className="w-48">
              <label className="block text-xs font-semibold text-[#3d4f72] mb-1.5">Tipo de Beneficiário</label>
              <select
                value={filterTipo}
                onChange={e => { setFilterTipo(e.target.value); setPage(0); }}
                className="w-full rounded-lg px-2.5 py-1.5 text-xs border outline-none bg-white border-[#d0daef] text-[#1a2744]"
              >
                <option value="ALL">Todos</option>
                <option value="Doador">Doador</option>
                <option value="Parceiro">Parceiro</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Grid Table */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="bg-white rounded-2xl border border-[#d0daef] shadow-sm overflow-hidden flex flex-col max-h-full">
          <div className="overflow-y-auto flex-1">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#e4e9f4] bg-[#f8fafc] sticky top-0 z-10">
                  <th onClick={() => handleSort('dataHora')} className="cursor-pointer px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Data e Hora <SortIcon field="dataHora" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th onClick={() => handleSort('tipoDoador')} className="cursor-pointer px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Tipo <SortIcon field="tipoDoador" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th onClick={() => handleSort('beneficiario')} className="cursor-pointer px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Beneficiário <SortIcon field="beneficiario" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Observação
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e9f4]">
                {pageData.map(item => {
                  const resolvedName = getDoadorParceiroNome(item.tipoDoador, item.doadorParceiroId);
                  return (
                    <tr key={item.id} className="hover:bg-[#f8fafc]/60 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-[#1a2744] whitespace-nowrap">
                        {fmtDateTime(item.dataHora)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border"
                          style={{
                            backgroundColor: item.tipoDoador === 'Doador' ? '#eff6ff' : '#f5f3ff',
                            color: item.tipoDoador === 'Doador' ? '#2b65bf' : '#7c3aed',
                            borderColor: item.tipoDoador === 'Doador' ? '#bfdbfe' : '#ddd6fe'
                          }}
                        >
                          {item.tipoDoador === 'Doador' ? <User size={12} /> : <Building size={12} />}
                          {item.tipoDoador}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#1a2744] font-semibold">{resolvedName}</td>
                      <td className="px-6 py-4 text-xs text-[#6b7a9e] max-w-xs truncate" title={item.observacao}>
                        {item.observacao || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setSelectedItem(item); setViewMode('view'); }}
                            className="p-2 rounded-xl text-[#3d4f72] hover:bg-[#f0f4fb] hover:text-[#2b65bf] border border-transparent hover:border-[#d0daef] transition-colors"
                            title="Visualizar"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => { setSelectedItem(item); setViewMode('edit'); }}
                            className="p-2 rounded-xl text-[#3d4f72] hover:bg-[#f0f4fb] hover:text-[#2b65bf] border border-transparent hover:border-[#d0daef] transition-colors"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteItem(item)}
                            className="p-2 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pageData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#6b7a9e]">
                      Nenhum atendimento registrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#e4e9f4] bg-[#f8fafc] shrink-0">
            <div className="text-xs font-medium text-[#6b7a9e]">
              Mostrando {pageData.length} de {total} registros
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

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <DeleteModal
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
