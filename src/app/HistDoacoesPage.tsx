import { useState, useMemo } from 'react';
import {
  Search, Eye, ChevronUp, ChevronDown,
  ChevronsUpDown, X, List,
} from 'lucide-react';
import { DoacaoFamilia, CategoriaItem, UnidadeMedida } from './types';
import { MOCK_DOACOES_FAMILIAS } from './mockData';

// ─── helpers ───────────────────────────────────────────────────────
const fmtCPF = (v: string) => v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
const fmtCNPJ = (v: string) => v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
const fmtDate = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/');

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

function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: 'asc' | 'desc' }) {
  if (field !== sortField) return <ChevronsUpDown size={13} className="text-gray-400 inline ml-1" />;
  return sortDir === 'asc' ? <ChevronUp size={13} className="inline ml-1" style={{ color: '#2b65bf' }} /> : <ChevronDown size={13} className="inline ml-1" style={{ color: '#2b65bf' }} />;
}

// ════════════════════════════════════════════════════════════════
//  ITEMS DETAIL MODAL
// ════════════════════════════════════════════════════════════════
function ItemsModal({ doacao, onClose }: { doacao: DoacaoFamilia; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh]">
        <div className="px-6 py-4 border-b border-[#e4e9f4] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#1a2744] text-base">Itens da Doação</h3>
            <p className="text-xs text-[#6b7a9e] mt-0.5">Destinatário: {doacao.familiaResponsavel}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#6b7a9e] hover:bg-gray-100 hover:text-[#1a2744] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e4e9f4] bg-[#f8fafc]">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e]">Nome do Item</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e]">Categoria</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] text-right">Quantidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e9f4]">
              {doacao.itens.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#f8fafc]/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-[#1a2744]">{item.nome}</td>
                  <td className="px-4 py-3 text-sm text-[#3d4f72]">{CATEGORIA_LABEL[item.categoria]}</td>
                  <td className="px-4 py-3 text-sm font-bold text-[#2b65bf] text-right">
                    {item.quantidade} {UNIDADE_LABEL[item.unidade]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-[#e4e9f4] flex justify-end">
          <button onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: '#2b65bf' }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  HISTÓRICO DOAÇÕES FAMÍLIAS PAGE
// ════════════════════════════════════════════════════════════════
export function HistDoacoesPage() {
  const [doacoes] = useState<DoacaoFamilia[]>(MOCK_DOACOES_FAMILIAS);
  const [selectedDoacao, setSelectedDoacao] = useState<DoacaoFamilia | null>(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('data');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [perPage] = useState(10);

  const filtered = useMemo(() => {
    let r = doacoes.filter(d => {
      const q = search.toLowerCase();
      return !q || 
        d.instituicaoNome.toLowerCase().includes(q) || 
        d.instituicaoCnpj.includes(q) || 
        d.familiaResponsavel.toLowerCase().includes(q) || 
        d.familiaCpf.includes(q);
    });
    r.sort((a, b) => {
      const av = (a as any)[sortField] ?? '';
      const bv = (b as any)[sortField] ?? '';
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return r;
  }, [doacoes, search, sortField, sortDir]);

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
          <h2 className="text-xl font-bold text-[#1a2744]">Histórico de Doações para Famílias</h2>
          <p className="text-xs text-[#6b7a9e] mt-1">Consulte o registro histórico de doações entregues às famílias</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center gap-3 px-8 py-4 bg-white border-b border-[#e4e9f4] shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Pesquisar por instituição, família, CNPJ ou CPF..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-[#f0f4fb] border-[#d0daef] text-[#1a2744]" />
        </div>
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
                  <th onClick={() => handleSort('familiaResponsavel')} className="cursor-pointer px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Família (Responsável) <SortIcon field="familiaResponsavel" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th onClick={() => handleSort('data')} className="cursor-pointer px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Data <SortIcon field="data" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none text-center">
                    Qtd. Itens Distintos
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e9f4]">
                {pageData.map(d => (
                  <tr key={d.id} className="hover:bg-[#f8fafc]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-[#1a2744]">{d.instituicaoNome}</div>
                      <div className="text-xs text-[#6b7a9e] mt-0.5">CNPJ: {fmtCNPJ(d.instituicaoCnpj)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-[#1a2744]">{d.familiaResponsavel}</div>
                      <div className="text-xs text-[#6b7a9e] mt-0.5">CPF: {fmtCPF(d.familiaCpf)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#3d4f72]">{fmtDate(d.data)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#1a2744] text-center">{d.itens.length}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end">
                        <button onClick={() => setSelectedDoacao(d)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-[#2b65bf] hover:text-[#1e468a] transition-all text-xs font-semibold border border-transparent hover:border-blue-200"
                          title="Visualizar Itens">
                          <Eye size={14} /> Visualizar Itens
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pageData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#6b7a9e]">Nenhuma doação encontrada.</td>
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

      {/* Detail Modal */}
      {selectedDoacao && (
        <ItemsModal doacao={selectedDoacao} onClose={() => setSelectedDoacao(null)} />
      )}
    </div>
  );
}
