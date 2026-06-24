import { useState, useMemo } from 'react';
import {
  PackagePlus, PackageMinus, Heart, ArrowLeftRight,
  Search, Plus, X, CheckCircle2, Building2, User,
  ChevronDown, AlertTriangle,
} from 'lucide-react';
import { TipoMovimento, TipoTransacao, Item, ItemMovimento } from './types';
import { MOCK_ITENS, MOCK_FAMILIAS, MOCK_INSTITUICOES } from './mockData';

const BIG = 'text-base'; // accessible base size for this form

// ─── helpers ───────────────────────────────────────────────────────
const fmtCPF  = (v: string) => v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
const fmtCNPJ = (v: string) => v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');

// ─── inline search combobox ────────────────────────────────────────
function Combobox<T extends { id: number }>({
  placeholder, value, displayValue, options, getLabel, getSub,
  onSelect, onClear,
}: {
  placeholder: string;
  value: T | null;
  displayValue: (t: T) => string;
  options: T[];
  getLabel: (t: T) => string;
  getSub: (t: T) => string;
  onSelect: (t: T) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() =>
    query.length < 1 ? options.slice(0, 8)
      : options.filter(o => getLabel(o).toLowerCase().includes(query.toLowerCase()) || getSub(o).includes(query)),
    [query, options]);

  if (value) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 bg-blue-50"
        style={{ borderColor: '#2b65bf' }}>
        <CheckCircle2 size={18} style={{ color: '#2b65bf', flexShrink: 0 }} />
        <span className={`flex-1 font-medium ${BIG}`} style={{ color: '#1a2744' }}>{displayValue(value)}</span>
        <button onClick={onClear} className="text-[#6b7a9e] hover:text-red-500 transition-colors shrink-0"><X size={16} /></button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7a9e]" />
        <input
          className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#d0daef] bg-[#f0f4fb] outline-none transition-all focus:border-[#2b65bf] focus:bg-white ${BIG} text-[#1a2744]`}
          placeholder={placeholder}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[#d0daef] shadow-lg overflow-hidden max-h-56 overflow-y-auto">
          {filtered.map(o => (
            <button key={o.id} onMouseDown={() => { onSelect(o); setQuery(''); setOpen(false); }}
              className="w-full px-4 py-3 text-left hover:bg-[#f0f4fb] transition-colors border-b border-[#f0f4fb] last:border-0">
              <p className={`font-medium text-[#1a2744] ${BIG}`}>{getLabel(o)}</p>
              <p className="text-sm text-[#6b7a9e] mt-0.5">{getSub(o)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── type toggle card ─────────────────────────────────────────────
function TypeCard({ active, onClick, icon: Icon, label, sub, color }:
  { active: boolean; onClick: () => void; icon: React.ElementType; label: string; sub: string; color: string }) {
  return (
    <button onClick={onClick}
      className="flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all"
      style={{
        borderColor: active ? color : '#d0daef',
        background: active ? `${color}12` : 'white',
        boxShadow: active ? `0 4px 16px ${color}30` : 'none',
      }}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: active ? `${color}20` : '#f0f4fb' }}>
        <Icon size={28} style={{ color: active ? color : '#6b7a9e' }} strokeWidth={1.6} />
      </div>
      <div className="text-center">
        <p className={`font-bold ${BIG}`} style={{ color: active ? color : '#3d4f72' }}>{label}</p>
        <p className="text-sm text-[#6b7a9e] mt-0.5 leading-snug">{sub}</p>
      </div>
    </button>
  );
}

// ─── section card ─────────────────────────────────────────────────
function Section({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#d0daef] overflow-hidden mb-5"
      style={{ boxShadow: '0 2px 10px rgba(26,39,68,0.06)' }}>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e4e9f4]">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ background: '#2b65bf' }}>{num}</div>
        <h3 className="font-semibold text-[#1a2744]" style={{ fontSize: '1rem' }}>{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── item row in list ─────────────────────────────────────────────
function ItemRow({ item, onChange, onRemove }: {
  item: ItemMovimento; onChange: (q: number) => void; onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-[#d0daef] bg-[#f8f9fc]">
      <div className="flex-1">
        <p className={`font-medium text-[#1a2744] ${BIG}`}>{item.nome}</p>
        <p className="text-sm text-[#6b7a9e] mt-0.5">Estoque atual: <strong>{item.estoqueAtual} {item.unidade}</strong></p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <label className="text-sm font-medium text-[#3d4f72]">Qtd.</label>
        <input
          type="number" min={1} max={item.estoqueAtual || undefined}
          value={item.quantidade}
          onChange={e => onChange(Math.max(1, Number(e.target.value)))}
          className="w-24 px-3 py-2 rounded-lg border-2 border-[#d0daef] bg-white text-center font-semibold text-[#1a2744] outline-none focus:border-[#2b65bf] transition-all text-base"
        />
        <span className="text-sm text-[#6b7a9e] w-12">{item.unidade}</span>
        <button onClick={onRemove}
          className="p-1.5 rounded-lg text-[#6b7a9e] hover:text-red-500 hover:bg-red-50 transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  ESTOQUE PAGE
// ════════════════════════════════════════════════════════════════
export function EstoquePage({ tipoInicial }: { tipoInicial: TipoMovimento }) {
  const [tipo, setTipo] = useState<TipoMovimento>(tipoInicial);
  const [transacao, setTransacao] = useState<TipoTransacao>('DOACAO');
  const [emitente, setEmitente] = useState<typeof MOCK_INSTITUICOES[0] | null>(null);
  const [familia, setFamilia] = useState<typeof MOCK_FAMILIAS[0] | null>(null);
  const [instDest, setInstDest] = useState<typeof MOCK_INSTITUICOES[0] | null>(null);
  const [doador, setDoador] = useState('');
  const [itens, setItens] = useState<ItemMovimento[]>([]);
  const [observacao, setObservacao] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [showItemSearch, setShowItemSearch] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const instOptions = MOCK_INSTITUICOES.filter(i => i.situacaoCadastro === 'ATIVO');
  const familiaOptions = MOCK_FAMILIAS.filter(f => f.situacaoCadastro === 'ATIVO');

  const itemsFiltered = useMemo(() =>
    MOCK_ITENS.filter(i => i.ativo && !itens.find(x => x.itemId === i.id) &&
      (itemSearch === '' || i.nome.toLowerCase().includes(itemSearch.toLowerCase()))),
    [itemSearch, itens]);

  const addItem = (item: Item) => {
    setItens(prev => [...prev, { itemId: item.id, nome: item.nome, quantidade: 1, unidade: item.unidadeMedida, estoqueAtual: item.estoque }]);
    setItemSearch('');
    setShowItemSearch(false);
  };

  const updateQty = (itemId: number, q: number) => setItens(prev => prev.map(i => i.itemId === itemId ? { ...i, quantidade: q } : i));
  const removeItem = (itemId: number) => setItens(prev => prev.filter(i => i.itemId !== itemId));

  const getDestinatario = () => {
    if (tipo === 'SAIDA') return transacao === 'DOACAO' ? familia : instDest;
    return transacao === 'TRANSFERENCIA' ? instDest : null; // DOACAO entrada → doador free text
  };

  const validate = () => {
    const errs: string[] = [];
    if (!emitente) errs.push('Selecione o emitente (instituição que realiza o movimento).');
    if (tipo === 'SAIDA' && transacao === 'DOACAO' && !familia) errs.push('Selecione a família beneficiária.');
    if (transacao === 'TRANSFERENCIA' && !instDest) errs.push('Selecione a instituição destinatária/de origem.');
    if (tipo === 'ENTRADA' && transacao === 'DOACAO' && !doador.trim()) errs.push('Informe o nome do doador.');
    if (itens.length === 0) errs.push('Adicione ao menos um item ao movimento.');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setTipo(tipoInicial); setTransacao('DOACAO');
      setEmitente(null); setFamilia(null); setInstDest(null); setDoador('');
      setItens([]); setObservacao(''); setErrors([]);
    }, 2500);
  };

  const isEntrada = tipo === 'ENTRADA';
  const isDoacao  = transacao === 'DOACAO';

  const destLabel = isEntrada
    ? (isDoacao ? 'Doador' : 'Instituição de Origem')
    : (isDoacao ? 'Família Beneficiária' : 'Instituição Destinatária');

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-6 py-5 bg-white border-b border-[#e4e9f4] shrink-0">
        <h1 className="text-lg font-bold text-[#1a2744]">Movimentação de Estoque</h1>
        <p className="text-sm text-[#6b7a9e] mt-0.5">Registre entradas e saídas de itens do estoque</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6" style={{ background: 'linear-gradient(135deg,#dce5f4 0%,#eef1f8 50%,#d4ddf0 100%)' }}>
        <div className="max-w-3xl mx-auto">

          {/* Errors */}
          {errors.length > 0 && (
            <div className="flex items-start gap-3 p-4 mb-5 rounded-xl bg-red-50 border border-red-200">
              <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 mb-1">Corrija os campos abaixo antes de salvar:</p>
                <ul className="text-sm text-red-600 list-disc list-inside space-y-0.5">
                  {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* 1 — Tipo de Movimento */}
          <Section num={1} title="Tipo de Movimento">
            <div className="flex gap-4">
              <TypeCard active={!isEntrada} onClick={() => setTipo('SAIDA')}
                icon={PackageMinus} label="Saída" sub="Doação ou transferência de itens" color="#dc2626" />
              <TypeCard active={isEntrada} onClick={() => setTipo('ENTRADA')}
                icon={PackagePlus} label="Entrada" sub="Recebimento de itens no estoque" color="#16a34a" />
            </div>
          </Section>

          {/* 2 — Tipo de Transação */}
          <Section num={2} title="Tipo de Transação">
            <div className="flex gap-4">
              <TypeCard active={isDoacao} onClick={() => setTransacao('DOACAO')}
                icon={Heart} label="Doação"
                sub={isEntrada ? 'Recebido de um doador externo' : 'Entregue a uma família'}
                color="#2b65bf" />
              <TypeCard active={!isDoacao} onClick={() => setTransacao('TRANSFERENCIA')}
                icon={ArrowLeftRight} label="Transferência"
                sub="Entre unidades da instituição"
                color="#7c3aed" />
            </div>
          </Section>

          {/* 3 — Emitente */}
          <Section num={3} title="Emitente — Instituição que realiza o movimento">
            <Combobox
              placeholder="Buscar instituição por nome ou CNPJ..."
              value={emitente}
              displayValue={i => `${i.nome} — ${fmtCNPJ(i.cnpj)}`}
              options={instOptions}
              getLabel={i => i.nome}
              getSub={i => fmtCNPJ(i.cnpj)}
              onSelect={setEmitente}
              onClear={() => setEmitente(null)}
            />
          </Section>

          {/* 4 — Destinatário / Origem */}
          <Section num={4} title={destLabel}>
            {isEntrada && isDoacao ? (
              <div>
                <p className="text-sm text-[#6b7a9e] mb-3">Informe o nome completo do doador ou organização.</p>
                <input
                  className={`w-full px-4 py-3 rounded-xl border-2 border-[#d0daef] bg-[#f0f4fb] outline-none transition-all focus:border-[#2b65bf] focus:bg-white ${BIG} text-[#1a2744]`}
                  placeholder="Nome do doador ou organização..."
                  value={doador}
                  onChange={e => setDoador(e.target.value)}
                />
              </div>
            ) : tipo === 'SAIDA' && isDoacao ? (
              <div>
                <p className="text-sm text-[#6b7a9e] mb-3">Selecione a família que receberá a doação.</p>
                <Combobox
                  placeholder="Buscar família por nome ou CPF..."
                  value={familia}
                  displayValue={f => `${f.nomeResponsavel} — CPF ${fmtCPF(f.cpf)}`}
                  options={familiaOptions}
                  getLabel={f => f.nomeResponsavel}
                  getSub={f => `CPF: ${fmtCPF(f.cpf)}`}
                  onSelect={setFamilia}
                  onClear={() => setFamilia(null)}
                />
              </div>
            ) : (
              <div>
                <p className="text-sm text-[#6b7a9e] mb-3">
                  {isEntrada ? 'Selecione a instituição que está enviando os itens.' : 'Selecione a instituição de destino.'}
                </p>
                <Combobox
                  placeholder="Buscar instituição por nome ou CNPJ..."
                  value={instDest}
                  displayValue={i => `${i.nome} — ${fmtCNPJ(i.cnpj)}`}
                  options={instOptions.filter(i => i.id !== emitente?.id)}
                  getLabel={i => i.nome}
                  getSub={i => fmtCNPJ(i.cnpj)}
                  onSelect={setInstDest}
                  onClear={() => setInstDest(null)}
                />
              </div>
            )}
          </Section>

          {/* 5 — Itens */}
          <Section num={5} title="Itens e Quantidades">
            {itens.length > 0 && (
              <div className="space-y-3 mb-4">
                {itens.map(item => (
                  <ItemRow key={item.itemId} item={item}
                    onChange={q => updateQty(item.itemId, q)}
                    onRemove={() => removeItem(item.itemId)} />
                ))}
              </div>
            )}

            {!showItemSearch ? (
              <button onClick={() => setShowItemSearch(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-[#d0daef] text-[#6b7a9e] hover:border-[#2b65bf] hover:text-[#2b65bf] hover:bg-blue-50 transition-all w-full justify-center"
                style={{ fontSize: '0.95rem' }}>
                <Plus size={18} /> Adicionar item
              </button>
            ) : (
              <div className="border-2 border-[#2b65bf] rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border-b border-[#d0daef]">
                  <Search size={16} className="text-[#2b65bf]" />
                  <input autoFocus
                    className="flex-1 bg-transparent outline-none text-[#1a2744] placeholder-[#6b7a9e]"
                    style={{ fontSize: '0.95rem' }}
                    placeholder="Buscar item por nome..."
                    value={itemSearch}
                    onChange={e => setItemSearch(e.target.value)}
                  />
                  <button onClick={() => { setShowItemSearch(false); setItemSearch(''); }}
                    className="text-[#6b7a9e] hover:text-[#1a2744]"><X size={16} /></button>
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {itemsFiltered.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-[#6b7a9e]">Nenhum item encontrado.</p>
                  ) : itemsFiltered.map(item => (
                    <button key={item.id} onClick={() => addItem(item)}
                      className="w-full px-4 py-3 text-left hover:bg-[#f0f4fb] transition-colors border-b border-[#f0f4fb] last:border-0 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-[#1a2744]" style={{ fontSize: '0.95rem' }}>{item.nome}</p>
                        <p className="text-sm text-[#6b7a9e] mt-0.5">{item.categoria.replace('_', ' ')} · {item.unidadeMedida}</p>
                      </div>
                      <span className="text-sm font-semibold shrink-0 px-2.5 py-1 rounded-full"
                        style={{ background: item.estoque > 10 ? '#f0fdf4' : '#fff7ed', color: item.estoque > 10 ? '#16a34a' : '#d97706' }}>
                        {item.estoque} em estoque
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* 6 — Observação */}
          <Section num={6} title="Observação">
            <textarea rows={4}
              className={`w-full px-4 py-3 rounded-xl border-2 border-[#d0daef] bg-[#f0f4fb] outline-none transition-all focus:border-[#2b65bf] focus:bg-white resize-none ${BIG} text-[#1a2744]`}
              placeholder="Informações adicionais sobre este movimento (ex: validade, condições, observações especiais)..."
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
            />
          </Section>

          {/* Resumo + Botão */}
          <div className="bg-white rounded-2xl border border-[#d0daef] p-6 mt-2"
            style={{ boxShadow: '0 2px 10px rgba(26,39,68,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-[#6b7a9e]">Resumo do movimento</p>
                <p className="font-semibold text-[#1a2744] mt-0.5" style={{ fontSize: '1rem' }}>
                  <span style={{ color: isEntrada ? '#16a34a' : '#dc2626' }}>{isEntrada ? 'Entrada' : 'Saída'}</span>
                  {' · '}
                  <span>{isDoacao ? 'Doação' : 'Transferência'}</span>
                  {' · '}
                  <span>{itens.length} {itens.length === 1 ? 'item' : 'itens'}</span>
                </p>
              </div>
              <button onClick={handleSubmit}
                className="flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#3b7dd8,#2b65bf)', boxShadow: '0 4px 16px rgba(43,101,191,0.35)', fontSize: '1rem' }}>
                <CheckCircle2 size={20} />
                Registrar Movimento
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white"
          style={{ background: '#16a34a' }}>
          <CheckCircle2 size={20} />
          <span className="font-semibold">Movimento registrado com sucesso!</span>
        </div>
      )}
    </div>
  );
}
