import { useState, useMemo } from 'react';
import {
  Search, SlidersHorizontal, ChevronUp, ChevronDown,
  ChevronsUpDown, Boxes
} from 'lucide-react';
import { MOCK_ITENS, MOCK_INSTITUICOES } from './mockData';
import { CategoriaItem, UnidadeMedida } from './types';

// ─── helpers ───────────────────────────────────────────────────────
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

// Alocação teórica de estoque das filiais
const ALLOCATION = {
  'Conexão Solidária Central': 0.6,
  'Filial Norte': 0.25,
  'Filial Sul': 0.15
};

function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: 'asc' | 'desc' }) {
  if (field !== sortField) return <ChevronsUpDown size={13} className="text-gray-400 inline ml-1" />;
  return sortDir === 'asc' ? <ChevronUp size={13} className="inline ml-1" style={{ color: '#2b65bf' }} /> : <ChevronDown size={13} className="inline ml-1" style={{ color: '#2b65bf' }} />;
}

export function EstoqueInstPage() {
  const [search, setSearch] = useState('');
  const [filterInst, setFilterInst] = useState<string>('ALL');
  const [filterCat, setFilterCat] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('itemNome');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [perPage] = useState(10);

  // Consolidação de dados por item e filial
  const stockRows = useMemo(() => {
    const result: any[] = [];
    let idCounter = 1;

    MOCK_ITENS.forEach(item => {
      if (!item.ativo) return;
      Object.entries(ALLOCATION).forEach(([instName, pct]) => {
        const qty = Math.round(item.estoque * pct);
        result.push({
          id: idCounter++,
          instituicaoNome: instName,
          itemNome: item.nome,
          itemCategoria: item.categoria,
          quantidade: qty,
          unidade: item.unidadeMedida
        });
      });
    });

    return result;
  }, []);

  // Filtragem e ordenação dos dados
  const filteredAndSorted = useMemo(() => {
    let r = stockRows.filter(row => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        row.itemNome.toLowerCase().includes(q) ||
        row.instituicaoNome.toLowerCase().includes(q);

      const matchInst = filterInst === 'ALL' || row.instituicaoNome === filterInst;
      const matchCat = filterCat === 'ALL' || row.itemCategoria === filterCat;

      return matchSearch && matchInst && matchCat;
    });

    r.sort((a, b) => {
      const av = (a as any)[sortField] ?? '';
      const bv = (b as any)[sortField] ?? '';

      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return r;
  }, [stockRows, search, filterInst, filterCat, sortField, sortDir]);

  const total = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safeP = Math.min(page, totalPages - 1);
  const pageData = filteredAndSorted.slice(safeP * perPage, safeP * perPage + perPage);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafd]">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#e4e9f4] shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[#1a2744]">Estoque por instituição</h2>
          <p className="text-xs text-[#6b7a9e] mt-1">Consulte o saldo de estoque atual de cada item dividido por filial</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col gap-4 px-8 py-4 bg-white border-b border-[#e4e9f4] shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Pesquisar por item ou instituição..."
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
              <label className="block text-xs font-semibold text-[#3d4f72] mb-1.5">Instituição / Filial</label>
              <select value={filterInst} onChange={e => { setFilterInst(e.target.value); setPage(0); }}
                className="w-full rounded-lg px-2.5 py-1.5 text-xs border outline-none bg-white border-[#d0daef] text-[#1a2744]">
                <option value="ALL">Todas as Instituições</option>
                {MOCK_INSTITUICOES.map(inst => (
                  <option key={inst.id} value={inst.nome}>{inst.nome}</option>
                ))}
              </select>
            </div>
            <div className="w-48">
              <label className="block text-xs font-semibold text-[#3d4f72] mb-1.5">Categoria do Item</label>
              <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(0); }}
                className="w-full rounded-lg px-2.5 py-1.5 text-xs border outline-none bg-white border-[#d0daef] text-[#1a2744]">
                <option value="ALL">Todas as Categorias</option>
                {Object.entries(CATEGORIA_LABEL).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
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
                  <th onClick={() => handleSort('itemNome')} className="cursor-pointer px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Item <SortIcon field="itemNome" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Categoria
                  </th>
                  <th onClick={() => handleSort('quantidade')} className="cursor-pointer px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none text-center">
                    Estoque <SortIcon field="quantidade" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#6b7a9e] select-none">
                    Unidade
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e9f4]">
                {pageData.map(row => {
                  const isCritico = row.quantidade <= 10;
                  const isAlerta = row.quantidade > 10 && row.quantidade < 20;

                  return (
                    <tr key={row.id} className="hover:bg-[#f8fafc]/60 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-[#1a2744]">
                        {row.instituicaoNome === 'Conexão Solidária Central' ? 'Central' : row.instituicaoNome}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#3d4f72] font-medium">{row.itemNome}</td>
                      <td className="px-6 py-4 text-xs text-[#6b7a9e]">
                        {CATEGORIA_LABEL[row.itemCategoria as CategoriaItem] || row.itemCategoria}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isCritico
                              ? 'bg-red-50 text-red-500 border border-red-200'
                              : isAlerta
                              ? 'bg-amber-50 text-amber-600 border border-amber-200'
                              : 'text-[#1a2744]'
                          }`}
                        >
                          {row.quantidade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6b7a9e]">
                        {UNIDADE_LABEL[row.unidade as UnidadeMedida] || row.unidade}
                      </td>
                    </tr>
                  );
                })}
                {pageData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#6b7a9e]">
                      Nenhum registro encontrado.
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
    </div>
  );
}
