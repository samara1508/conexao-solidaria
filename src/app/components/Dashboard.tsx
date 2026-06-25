import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar,
  PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  Gift,
  Package,
  Users,
  Building,
  Award
} from 'lucide-react';
import {
  MOCK_ITENS,
  MOCK_DOACOES_FAMILIAS,
  MOCK_MOVIMENTACOES_ESTOQUE,
  MOCK_DOADORES,
  MOCK_PARCEIROS,
  MOCK_INSTITUICOES
} from '../mockData';
import { CategoriaItem } from '../types';

// Cores do Tema
const COLORS = {
  blue: '#2b65bf',
  teal: '#2b7a8c',
  orange: '#e07a5f',
  lightBlue: '#6ab8c8',
  navy: '#1a2744',
  muted: '#8f9ebf',
  bgCard: '#ffffff',
  bgMain: '#f8fafd',
  border: '#d0daef'
};

const CATEGORIES: Record<CategoriaItem, { label: string; color: string }> = {
  ALIMENTO: { label: 'Alimentos', color: COLORS.blue },
  HIGIENE_PESSOAL: { label: 'Higiene Pessoal', color: COLORS.teal },
  LIMPEZA: { label: 'Limpeza', color: COLORS.orange },
  VESTUARIO: { label: 'Vestuário', color: COLORS.lightBlue },
  MEDICAMENTO: { label: 'Medicamentos', color: '#10b981' }, // green-500
  ESCOLAR: { label: 'Material Escolar', color: '#8b5cf6' }, // violet-500
  MOVEIS_UTENSILIOS: { label: 'Móveis e Utensílios', color: COLORS.muted }
};

export function Dashboard() {
  const [periodoAtendimentos, setPeriodoAtendimentos] = useState<7 | 15>(15);
  const [selectedInst, setSelectedInst] = useState<string>('TODAS');

  // 1. Cálculos de KPIs
  const kpis = useMemo(() => {
    // Total em Estoque
    const totalEstoque = MOCK_ITENS.reduce((acc, curr) => acc + (curr.ativo ? curr.estoque : 0), 0);

    // Atendimentos (Mês)
    const totalAtendimentos = MOCK_DOACOES_FAMILIAS.length;

    // Doações Recebidas (Entradas)
    const totalDoacoesRecebidas = MOCK_MOVIMENTACOES_ESTOQUE.filter(
      m => m.tipoMovimento === 'ENTRADA' && m.transacao === 'DOACAO'
    ).length;

    // Parceiros e Doadores Ativos
    const doadoresAtivos = MOCK_DOADORES.filter(d => d.status === 'ativo').length;
    const parceirosAtivos = MOCK_PARCEIROS.filter(p => p.status === 'ativo').length;
    const totalParceirosDoadores = doadoresAtivos + parceirosAtivos;

    return {
      totalEstoque,
      totalAtendimentos,
      totalDoacoesRecebidas,
      totalParceirosDoadores
    };
  }, []);

  // 2. Dados do Gráfico 1: Atendimentos por Período
  const atendimentosData = useMemo(() => {
    // Gerar datas dos últimos N dias (até 24/06/2026)
    const dataList = [];
    const endDate = new Date('2026-06-24');
    for (let i = periodoAtendimentos - 1; i >= 0; i--) {
      const d = new Date(endDate);
      d.setDate(endDate.getDate() - i);
      const isoStr = d.toISOString().slice(0, 10);
      dataList.push(isoStr);
    }

    // Contabilizar atendimentos por data
    const countMap: Record<string, number> = {};
    MOCK_DOACOES_FAMILIAS.forEach(d => {
      countMap[d.data] = (countMap[d.data] || 0) + 1;
    });

    return dataList.map(dateStr => {
      const parts = dateStr.split('-');
      return {
        keyStr: dateStr,
        label: `${parts[2]}/${parts[1]}`, // formato DD/MM
        Atendimentos: countMap[dateStr] || 0
      };
    });
  }, [periodoAtendimentos]);

  // 3. Dados do Gráfico 2: Recursos por Instituição/Categoria
  const resourcesData = useMemo(() => {
    // Definimos uma divisão teórica do estoque nas filiais
    // Central: 60%, Filial Norte: 25%, Filial Sul: 15%
    const allocation = {
      'Conexão Solidária Central': 0.6,
      'Filial Norte': 0.25,
      'Filial Sul': 0.15
    };

    // Calcular totais por categoria e por filial
    const stockMap: Record<string, Record<string, number>> = {
      'Conexão Solidária Central': {},
      'Filial Norte': {},
      'Filial Sul': {}
    };

    MOCK_ITENS.forEach(item => {
      if (!item.ativo) return;
      const cat = item.categoria;
      Object.entries(allocation).forEach(([instName, pct]) => {
        const qty = Math.round(item.estoque * pct);
        stockMap[instName][cat] = (stockMap[instName][cat] || 0) + qty;
      });
    });

    if (selectedInst === 'TODAS') {
      // Retorna array para stacked bar chart (Instituições no eixo X, categorias empilhadas)
      return Object.keys(stockMap).map(inst => {
        const item: Record<string, any> = { name: inst === 'Conexão Solidária Central' ? 'Central' : inst };
        Object.keys(CATEGORIES).forEach(cat => {
          item[cat] = stockMap[inst][cat] || 0;
        });
        return item;
      });
    } else {
      // Retorna array para pie/donut chart da instituição específica selecionada
      const instName = selectedInst;
      const dataForInst = stockMap[instName] || {};
      return Object.entries(dataForInst)
        .map(([cat, val]) => ({
          name: CATEGORIES[cat as CategoriaItem]?.label || cat,
          value: val,
          color: CATEGORIES[cat as CategoriaItem]?.color || COLORS.muted
        }))
        .filter(item => item.value > 0);
    }
  }, [selectedInst]);

  const totalSelectedInstStock = useMemo(() => {
    if (selectedInst === 'TODAS') return 0;
    return resourcesData.reduce((acc, curr) => acc + curr.value, 0);
  }, [resourcesData, selectedInst]);

  // 4. Dados do Gráfico 3: Top 5 Doadores
  const topDoadoresData = useMemo(() => {
    const donorMap: Record<string, number> = {};
    MOCK_MOVIMENTACOES_ESTOQUE.forEach(m => {
      if (m.tipoMovimento === 'ENTRADA' && m.transacao === 'DOACAO') {
        donorMap[m.emitente] = (donorMap[m.emitente] || 0) + m.quantidade;
      }
    });

    return Object.entries(donorMap)
      .map(([name, qty]) => ({ name, quantidade: qty }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
  }, []);

  // 5. Alertas de Estoque Crítico
  const estoqueCritico = useMemo(() => {
    return MOCK_ITENS.filter(item => item.ativo && item.estoque < 20)
      .sort((a, b) => a.estoque - b.estoque);
  }, []);

  return (
    <div className="flex flex-col gap-8 mt-6">
      {/* Seção 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Estoque */}
        <div className="bg-white rounded-2xl border border-[#d0daef] p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#f0f4fb]" style={{ color: COLORS.blue }}>
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6b7a9e] uppercase tracking-wider">Total em Estoque</p>
            <h3 className="text-2xl font-bold text-[#1a2744] mt-1">{kpis.totalEstoque} <span className="text-xs font-medium text-[#6b7a9e]">itens</span></h3>
          </div>
        </div>

        {/* KPI 2: Atendimentos */}
        <div className="bg-white rounded-2xl border border-[#d0daef] p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#f0f4fb]" style={{ color: COLORS.teal }}>
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6b7a9e] uppercase tracking-wider">Atendimentos (Mês)</p>
            <h3 className="text-2xl font-bold text-[#1a2744] mt-1">{kpis.totalAtendimentos} <span className="text-xs font-medium text-[#6b7a9e]">famílias</span></h3>
          </div>
        </div>

        {/* KPI 3: Doações */}
        <div className="bg-white rounded-2xl border border-[#d0daef] p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#f0f4fb]" style={{ color: COLORS.orange }}>
            <Gift size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6b7a9e] uppercase tracking-wider">Doações Recebidas</p>
            <h3 className="text-2xl font-bold text-[#1a2744] mt-1">{kpis.totalDoacoesRecebidas} <span className="text-xs font-medium text-[#6b7a9e]">cargas</span></h3>
          </div>
        </div>

        {/* KPI 4: Parceiros */}
        <div className="bg-white rounded-2xl border border-[#d0daef] p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#f0f4fb]" style={{ color: COLORS.lightBlue }}>
            <Building size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6b7a9e] uppercase tracking-wider">Parceiros e Doadores Ativos</p>
            <h3 className="text-2xl font-bold text-[#1a2744] mt-1">{kpis.totalParceirosDoadores}</h3>
          </div>
        </div>
      </div>

      {/* Seção 2: Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Gráfico 1: Atendimentos a Famílias (Coluna 3/5) */}
        <div className="bg-white rounded-2xl border border-[#d0daef] p-6 shadow-sm lg:col-span-3 flex flex-col h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-[#1a2744] text-base">Atendimentos a Famílias</h4>
              <p className="text-xs text-[#6b7a9e] mt-0.5">Evolução temporal das doações realizadas</p>
            </div>
            {/* Seletor de período */}
            <div className="flex bg-[#f0f4fb] rounded-lg p-1 border border-[#d0daef]">
              <button
                onClick={() => setPeriodoAtendimentos(7)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${periodoAtendimentos === 7 ? 'bg-white text-[#2b65bf] shadow-sm' : 'text-[#6b7a9e] hover:text-[#1a2744]'}`}
              >
                7 Dias
              </button>
              <button
                onClick={() => setPeriodoAtendimentos(15)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${periodoAtendimentos === 15 ? 'bg-white text-[#2b65bf] shadow-sm' : 'text-[#6b7a9e] hover:text-[#1a2744]'}`}
              >
                15 Dias
              </button>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={atendimentosData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAtendimentos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e9f4" />
                <XAxis dataKey="label" stroke="#6b7a9e" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7a9e" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #d0daef', boxShadow: '0 4px 12px rgba(26,39,68,0.08)' }}
                  labelStyle={{ fontWeight: 'bold', color: COLORS.navy, fontSize: '12px' }}
                  itemStyle={{ color: COLORS.blue, fontSize: '12px', fontWeight: 'semibold' }}
                />
                <Area type="monotone" dataKey="Atendimentos" stroke={COLORS.blue} strokeWidth={2.5} fillOpacity={1} fill="url(#colorAtendimentos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Estoque por Categoria/Instituição (Coluna 2/5) */}
        <div className="bg-white rounded-2xl border border-[#d0daef] p-6 shadow-sm lg:col-span-2 flex flex-col h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-[#1a2744] text-base">Recursos Disponíveis</h4>
              <p className="text-xs text-[#6b7a9e] mt-0.5">Estoque por categoria e filial</p>
            </div>
            {/* Dropdown de Instituições */}
            <div className="relative">
              <select
                value={selectedInst}
                onChange={(e) => setSelectedInst(e.target.value)}
                className="appearance-none bg-[#f0f4fb] border border-[#d0daef] text-[#3d4f72] px-3 py-1.5 pr-8 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#2b65bf] cursor-pointer"
              >
                <option value="TODAS">Todas Filiais</option>
                {MOCK_INSTITUICOES.map(inst => (
                  <option key={inst.id} value={inst.nome}>
                    {inst.nome === 'Conexão Solidária Central' ? 'Central' : inst.nome}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#6b7a9e]">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0 flex items-center justify-center relative">
            {selectedInst === 'TODAS' ? (
              // Stacked Bar Chart para todas as instituições
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resourcesData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e9f4" />
                  <XAxis dataKey="name" stroke="#6b7a9e" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6b7a9e" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #d0daef', boxShadow: '0 4px 12px rgba(26,39,68,0.08)' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  {Object.entries(CATEGORIES).map(([key, config]) => (
                    <Bar key={key} dataKey={key} name={config.label} stackId="a" fill={config.color} radius={[0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              // Donut Chart para instituição selecionada
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resourcesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {resourcesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #d0daef', boxShadow: '0 4px 12px rgba(26,39,68,0.08)' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Texto Centralizado da Rosca */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-[#1a2744]">{totalSelectedInstStock}</span>
                  <span className="text-[10px] uppercase font-bold text-[#6b7a9e] tracking-wider">Itens Totais</span>
                </div>
              </>
            )}
          </div>

          {/* Legenda customizada para o Donut Chart */}
          {selectedInst !== 'TODAS' && (
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
              {resourcesData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-semibold text-[#3d4f72]">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Seção 3: Ranking e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Doadores */}
        <div className="bg-white rounded-2xl border border-[#d0daef] p-6 shadow-sm flex flex-col h-[340px]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#f0f4fb] text-[#2b65bf]">
              <Award size={18} />
            </div>
            <div>
              <h4 className="font-bold text-[#1a2744] text-base">Top 5 Doadores</h4>
              <p className="text-xs text-[#6b7a9e] mt-0.5">Parceiros mais atuantes no período por volume doado</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4 justify-center">
            {topDoadoresData.map((donor, idx) => {
              // Encontrar cor ou apenas calcular percentual da barra em relação ao primeiro
              const maxQty = topDoadoresData[0]?.quantidade || 1;
              const pct = (donor.quantidade / maxQty) * 100;

              return (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-6 font-bold text-sm text-[#6b7a9e] text-center">
                    {idx === 0 && <span className="text-yellow-500 text-base">🥇</span>}
                    {idx === 1 && <span className="text-gray-400 text-base">🥈</span>}
                    {idx === 2 && <span className="text-amber-600 text-base">🥉</span>}
                    {idx > 2 && `${idx + 1}º`}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#3d4f72] mb-1">
                      <span>{donor.name}</span>
                      <span className="font-bold text-[#2b65bf]">{donor.quantidade} itens</span>
                    </div>
                    {/* Barra de Progresso */}
                    <div className="w-full h-2.5 bg-[#f0f4fb] rounded-full overflow-hidden border border-[#e4e9f4]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${COLORS.blue} 0%, ${COLORS.teal} 100%)`
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alertas de Estoque Crítico */}
        <div className="bg-white rounded-2xl border border-[#d0daef] p-6 shadow-sm flex flex-col h-[340px]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#fff7ed] text-[#d97706]">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="font-bold text-[#1a2744] text-base">Alertas de Estoque Crítico</h4>
              <p className="text-xs text-[#6b7a9e] mt-0.5">Itens com quantidade em estoque abaixo de 20 unidades</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {estoqueCritico.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#6b7a9e]">
                <Package size={36} className="mb-2 text-[#d0daef]" />
                <p className="text-xs font-medium">Estoque saudável! Nenhum item em nível crítico.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {estoqueCritico.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-[#e4e9f4] hover:bg-[#f8fafd] transition-colors">
                    <div>
                      <h5 className="text-xs font-bold text-[#1a2744]">{item.nome}</h5>
                      <span className="text-[10px] font-semibold text-[#6b7a9e] uppercase mt-0.5 inline-block">
                        {CATEGORIES[item.categoria]?.label || item.categoria}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-lg"
                        style={{
                          backgroundColor: item.estoque <= 10 ? '#fef2f2' : '#fff7ed',
                          color: item.estoque <= 10 ? '#ef4444' : '#d97706'
                        }}
                      >
                        {item.estoque} {item.unidadeMedida}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
