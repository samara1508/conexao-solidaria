import { useState, useMemo } from 'react';
import {
  Search, SlidersHorizontal, ChevronUp, ChevronDown,
  ChevronsUpDown, X,
} from 'lucide-react';
import { MovimentacaoEstoque, TipoMovimento, TipoTransacao } from './types';
import { MOCK_MOVIMENTACOES_ESTOQUE } from './mockData';

// ─── helpers ───────────────────────────────────────────────────────
const fmtDateTime = (iso: string) => {
  const parts = iso.split('T');
  const dateStr = parts[0].split('-').reverse().join('/');
  const timeStr = parts[1].slice(0, 5);
  return `${dateStr} às ${timeStr}`;
};

function TipoMovBadge({ t }: { t: TipoMovimento }) {
  const bg = t === 'ENTRADA' ? '#f0fdf4' : '#fef2f2';
  const color = t === 'ENTRADA' ? '#16a34a' : '#dc2626';
  const label = t === 'ENTRADA' ? 'Entrada' : 'Saída';
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: bg, color }}>
      {label}
    </span>
  );
}

function TransacaoBadge({ t }: { t: TipoTransacao }) {
  const bg = t === 'DOACAO' ? '#eff6ff' : '#f5f3ff';
  const color = t === 'DOACAO' ? '#2b65bf' : '#7c3aed';
  const label = t === 'DOACAO' ? 'Doação' : 'Transferência';
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

// ════════════════════════════════════════════════════════════════
//  MOVIMENTAÇÕES ESTOQUE PAGE
// ════════════════════════════════════════════════════════════════
export function MovEstoquePage() {
  const [movs] = useState<MovimentacaoEstoque[]>(MOCK_MOVIMENTACOES_ESTOQUE);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState<TipoMovimento | 'ALL'>('ALL');
  const [filterTrans, setFilterTrans] = useState<TipoTransacao | 'ALL'>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('dataHora');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [perPage] = useState(10);

  const filtered = useMemo(() => {
    let r = movs.filter(m => {
      const q = search.toLowerCase();
      const matchSearch = !q || 
        m.instituicaoNome.toLowerCase().includes(q) || 
        m.emitente.toLowerCase().includes(q) || 
        m.destinatario.toLowerCase().includes(q) || 
        (m.observacao && m.observacao.toLowerCase().includes(q));
      
      const matchTipo = filterTipo === 'ALL' || m.tipoMovimento === filterTipo;
      const matchTrans = filterTrans === 'ALL' || m.transacao === filterTrans;
      
      return matchSearch && matchTipo && matchTrans;
    });
    r.sort((a, b) => {
      const av = (a as any)[sortField] ?? '';
      const bv = (b as any)[sortField] ?? '';
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return r;
  }, [movs, search, filterTipo, filterTrans, sortField, sortDir]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safeP = Math.min(page, totalPages - 1);
  const pageData = filtered.slice(safeP * perPage, safeP * perPage + perPage);

  const handleSort = (field: string) => {
    if (field === sortField) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafd]">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#e4e9f4] shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[#1a2744]">Movimentações de Estoque</h2>
          <p className="text-xs text-[#6b7a9e] mt-1">Consulte o histórico de todas as entradas, saídas, doações e transferências realizadas</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col gap-4 px-8 py-4 bg-white border-b border-[#e4e9f4] shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Pesquisar por instituição, emitente, destinatário ou observação..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-[#f0f4fb] border-[#d0daef] text-[#1a2744]" />
          </div>
          <button onClick={() => setShowFilters(s => !s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-[#2b65bf]' : 'border-[#d0daef] text-[#3d4f72] hover:bg-[#f0f4fb]'}`}>
            <SlidersHorizontal size={15} /> Filtros
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-4 p-4 rounded-xl border border-[#d0daef] bg-[#f8fafc] animate-fadeIn">
            <div className="w-44">
              <label className="block text-xs font-semibold text-[#3d4f72] mb-1.5">Tipo Movimento</label>
              <select value={filterTipo} onChange={e => { setFilterTipo(e.target.value as any); setPage(0); }}
                className="w-full rounded-lg px-2.5 py-1.5 text-xs border outline-none bg-white border-[#d0daef] text-[#1a2744]">
                <option value="ALL">Todos</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
              </select>
            </div>
            <div className="w-44">
              <label className="block text-xs font-semibold text-[#3d4f72] mb-1.5">Transação</label>
              <select value={filterTrans} onChange={e => { setFilterTrans(e.target.value as any); setPage(0); }}
                className="w-full rounded-lg px-2.5 py-1.5 text-xs border outline-none bg-white border-[#d0daef] text-[#1a2744]">
                <option value="ALL">Todas</option>
                <option value="DOACAO">Doação</option>
                <option value="TRANSFERENCIA">Transferência</option>
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
                  <th onClick={() => handleSort('instituicaoNome')} className="cursor-pointer px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Instituição <SortIcon field="instituicaoNome" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th onClick={() => handleSort('tipoMovimento')} className="cursor-pointer px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Movimento <SortIcon field="tipoMovimento" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th onClick={() => handleSort('transacao')} className="cursor-pointer px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Transação <SortIcon field="transacao" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th onClick={() => handleSort('emitente')} className="cursor-pointer px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Emitente <SortIcon field="emitente" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th onClick={() => handleSort('destinatario')} className="cursor-pointer px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Destinatário <SortIcon field="destinatario" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th onClick={() => handleSort('quantidade')} className="cursor-pointer px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none text-center">
                    Qtd. Itens <SortIcon field="quantidade" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th onClick={() => handleSort('dataHora')} className="cursor-pointer px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Data e Hora <SortIcon field="dataHora" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Observação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e9f4]">
                {pageData.map(m => (
                  <tr key={m.id} className="hover:bg-[#f8fafc]/60 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-[#1a2744]">{m.instituicaoNome}</td>
                    <td className="px-6 py-4">
                      <TipoMovBadge t={m.tipoMovimento} />
                    </td>
                    <td className="px-6 py-4">
                      <TransacaoBadge t={m.transacao} />
                    </td>
                    <td className="px-6 py-4 text-sm text-[#3d4f72]">{m.emitente}</td>
                    <td className="px-6 py-4 text-sm text-[#3d4f72]">{m.destinatario}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#1a2744] text-center">{m.quantidade}</td>
                    <td className="px-6 py-4 text-sm text-[#3d4f72] whitespace-nowrap">{fmtDateTime(m.dataHora)}</td>
                    <td className="px-6 py-4 text-xs text-[#6b7a9e] max-w-xs truncate" title={m.observacao}>
                      {m.observacao || '-'}
                    </td>
                  </tr>
                ))}
                {pageData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-[#6b7a9e]">Nenhuma movimentação encontrada.</td>
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
    </div>
  );
}
