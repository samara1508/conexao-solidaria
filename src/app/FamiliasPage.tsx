import { useState, useMemo } from 'react';
import {
  Plus, Search, SlidersHorizontal, ArrowLeft,
  Pencil, Eye, UserX, UserCheck, ChevronUp, ChevronDown,
  ChevronsUpDown, X, AlertTriangle, CheckSquare, Square,
} from 'lucide-react';
import { Familia, SituacaoCadastro, StatusEmprego, TipoMoradia } from './types';
import { MOCK_FAMILIAS } from './mockData';

// ─── helpers ──────────────────────────────────────────────────────
const fmtCPF    = (v: string) => v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
const fmtPhone  = (v: string) => v.length === 11 ? v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
const fmtDate   = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/');
const fmtCurrency = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const SITUACAO_LABEL: Record<SituacaoCadastro, string> = {
  ATIVO: 'Ativo', INATIVO: 'Inativo', PENDENTE_ATUALIZACAO: 'Pendente de Atualização',
};
const EMPREGO_LABEL: Record<StatusEmprego, string> = {
  EMPREGO_FORMAL: 'Emprego Formal (CLT)',
  TRABALHO_AUTONOMO_INFORMAL: 'Autônomo / Informal',
  DESEMPREGADO: 'Desempregado(a)',
  APOSENTADO_PENSIONISTA: 'Aposentado(a) / Pensionista',
};
const MORADIA_LABEL: Record<TipoMoradia, string> = {
  PROPRIA: 'Própria', ALUGADA: 'Alugada', CEDIDA_FAVOR: 'Cedida por favor',
  OCUPACAO_OCASIONAL: 'Ocupação ocasional', SITUACAO_DE_RUA: 'Situação de rua', ABRIGO: 'Abrigo',
};

function SituacaoBadge({ s }: { s: SituacaoCadastro }) {
  const cfg: Record<SituacaoCadastro, { bg: string; color: string }> = {
    ATIVO:               { bg: '#f0fdf4', color: '#16a34a' },
    INATIVO:             { bg: '#f3f4f6', color: '#6b7280' },
    PENDENTE_ATUALIZACAO:{ bg: '#fffbeb', color: '#d97706' },
  };
  const { bg, color } = cfg[s];
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: bg, color }}>{SITUACAO_LABEL[s]}</span>
  );
}

// ─── blank form ────────────────────────────────────────────────────
const blankFamilia = (): Omit<Familia, 'id' | 'dataHoraCadastro' | 'dataHoraAtualizacao'> => ({
  nomeResponsavel: '', cpf: '', telefone: '', telefoneSecundario: '',
  qtdIntegrantes: 1, rendaFamiliarTotal: 0,
  qtdCriancas: 0, qtdAdolescentes: 0, qtdIdosos: 0,
  possuiGestante: false, possuiLactante: false,
  situacaoCadastro: 'ATIVO',
  statusEmpregoResponsavel: 'DESEMPREGADO',
  possuiCadastroUnico: false, numeroNis: '',
  tipoMoradia: 'ALUGADA',
  possuiMembroPcd: false, historicoDoencasCronicas: '',
  possuiDependenciaQuimica: false,
  parecerDoAssistenteSocial: '', observacoes: '',
  endereco: { cep: '', bairro: '', rua: '', cidade: 'Caxias do Sul', estadoUF: 'RS', numero: '', complemento: '' },
});

// ─── shared input style ────────────────────────────────────────────
const inp = 'w-full rounded-lg px-3 py-2.5 text-sm border outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-[#f0f4fb] border-[#d0daef] text-[#1a2744]';
const lbl = 'block text-sm font-medium text-[#3d4f72] mb-1';
const inpRO = 'w-full rounded-lg px-3 py-2.5 text-sm border bg-[#f8f9fc] border-[#e4e9f4] text-[#3d4f72] cursor-not-allowed';

// ─── consent text ─────────────────────────────────────────────────
const CONSENT_TEXT = `TERMO DE CONSENTIMENTO PARA USO DE DADOS PESSOAIS
Lei Geral de Proteção de Dados – LGPD (Lei nº 13.709/2018)

A Conexão Solidária, no exercício de suas atividades socioassistenciais, solicita autorização para coletar, armazenar e utilizar os dados pessoais do(a) responsável e de sua família, conforme descrito a seguir.

1. DADOS COLETADOS
Serão coletados dados de identificação (nome, CPF, telefone), dados socioeconômicos (renda, composição familiar, situação de emprego), dados de moradia e dados de saúde quando relevantes para os serviços prestados.

2. FINALIDADE DO USO
• Identificação e acompanhamento socioeconômico da família
• Planejamento e distribuição equitativa de recursos, cestas básicas e doações
• Elaboração de métricas e relatórios internos da instituição
• Encaminhamentos a programas sociais e serviços de saúde

3. COMPARTILHAMENTO
Os dados não serão compartilhados com terceiros sem consentimento expresso, exceto quando exigido por lei ou para fins exclusivamente assistenciais vinculados à instituição.

4. SEGURANÇA
Os dados serão armazenados em ambiente seguro com acesso restrito a colaboradores autorizados da Conexão Solidária.

5. DIREITOS DO TITULAR
O(a) responsável poderá, a qualquer momento:
• Solicitar acesso, correção ou exclusão de seus dados
• Revogar este consentimento
• Solicitar informações sobre o uso dos dados

Para exercer esses direitos, entre em contato com a instituição.

Ao confirmar, o(a) responsável declara ter compreendido os termos acima, que as informações prestadas são verídicas, e que concorda com o tratamento dos dados para as finalidades descritas.`;

// ════════════════════════════════════════════════════════════════
//  SECTION CARD
// ════════════════════════════════════════════════════════════════
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#d0daef] p-6 mb-4">
      <h3 className="text-sm font-semibold text-[#1a2744] uppercase tracking-wide mb-4 pb-3 border-b border-[#e4e9f4]">{title}</h3>
      {children}
    </div>
  );
}

function BoolRow({ label, value, onChange, readOnly }: { label: string; value: boolean; onChange?: (v: boolean) => void; readOnly?: boolean }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button type="button"
        onClick={() => !readOnly && onChange && onChange(!value)}
        className="flex items-center justify-center w-5 h-5 rounded border-2 transition-all shrink-0"
        style={{ borderColor: value ? '#2b65bf' : '#d0daef', background: value ? '#2b65bf' : 'white' }}>
        {value && <svg viewBox="0 0 10 8" className="w-3 h-3 text-white"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </button>
      <span className="text-sm text-[#3d4f72]">{label}</span>
    </label>
  );
}

// ════════════════════════════════════════════════════════════════
//  CONSENT MODAL
// ════════════════════════════════════════════════════════════════
function ConsentModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const [checked, setChecked] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
        <div className="px-6 pt-6 pb-4 border-b border-[#e4e9f4] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#fffbeb' }}>
            <AlertTriangle size={20} style={{ color: '#d97706' }} />
          </div>
          <div>
            <h2 className="font-semibold text-[#1a2744] text-base">Termo de Consentimento</h2>
            <p className="text-xs text-[#6b7a9e] mt-0.5">Leia o termo para o(a) responsável antes de prosseguir</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <pre className="whitespace-pre-wrap text-sm text-[#3d4f72] leading-relaxed font-sans">{CONSENT_TEXT}</pre>
        </div>

        <div className="px-6 py-4 border-t border-[#e4e9f4] space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <button type="button" onClick={() => setChecked(c => !c)}
              className="mt-0.5 flex items-center justify-center w-5 h-5 rounded border-2 transition-all shrink-0"
              style={{ borderColor: checked ? '#2b65bf' : '#d0daef', background: checked ? '#2b65bf' : 'white' }}>
              {checked && <svg viewBox="0 0 10 8" className="w-3 h-3 text-white"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </button>
            <span className="text-sm text-[#3d4f72] leading-snug">
              O(a) responsável declara ter ouvido e <strong>concordado</strong> com os termos acima para uso de seus dados pessoais.
            </span>
          </label>
          <div className="flex gap-3 justify-end">
            <button onClick={onCancel}
              className="px-5 py-2.5 rounded-lg text-sm font-medium border border-[#d0daef] text-[#3d4f72] hover:bg-[#f0f4fb] transition-colors">
              Cancelar
            </button>
            <button onClick={onConfirm} disabled={!checked}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ background: checked ? '#2b65bf' : '#b0c4e8', cursor: checked ? 'pointer' : 'not-allowed' }}>
              Confirmar e Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  CONFIRM DIALOG
// ════════════════════════════════════════════════════════════════
function ConfirmDialog({ message, confirmLabel, danger, onConfirm, onCancel }:
  { message: string; confirmLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <p className="text-sm text-[#3d4f72] mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-[#d0daef] text-[#3d4f72] hover:bg-[#f0f4fb] transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: danger ? '#dc2626' : '#2b65bf' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  SORT ICON
// ════════════════════════════════════════════════════════════════
function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: 'asc' | 'desc' }) {
  if (field !== sortField) return <ChevronsUpDown size={13} className="text-gray-400 inline ml-1" />;
  return sortDir === 'asc' ? <ChevronUp size={13} className="inline ml-1" style={{ color: '#2b65bf' }} /> : <ChevronDown size={13} className="inline ml-1" style={{ color: '#2b65bf' }} />;
}

// ════════════════════════════════════════════════════════════════
//  FAMILIA FORM
// ════════════════════════════════════════════════════════════════
function FamiliaForm({
  familia, mode, onBack, onSave,
}: {
  familia: Familia | null;
  mode: 'new' | 'edit' | 'view';
  onBack: () => void;
  onSave: (f: Familia) => void;
}) {
  const ro = mode === 'view';
  const init = familia ?? { id: Date.now(), dataHoraCadastro: new Date().toISOString(), dataHoraAtualizacao: new Date().toISOString(), ...blankFamilia() };
  const [form, setForm] = useState<Familia>(init);
  const [showConsent, setShowConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState(mode);

  const f = <K extends keyof Familia>(k: K) => (v: Familia[K]) => setForm(prev => ({ ...prev, [k]: v }));
  const e = (k: keyof Familia) => form[k] as string;
  const addr = <K extends keyof Familia['endereco']>(k: K) => (v: string) => setForm(prev => ({ ...prev, endereco: { ...prev.endereco, [k]: v } }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nomeResponsavel.trim()) errs.nomeResponsavel = 'Obrigatório';
    if (!form.cpf.trim() || form.cpf.length < 11) errs.cpf = 'CPF inválido (11 dígitos)';
    if (!form.telefone.trim()) errs.telefone = 'Obrigatório';
    if (!form.endereco.rua.trim()) errs.rua = 'Obrigatório';
    if (!form.endereco.numero.trim()) errs.numero = 'Obrigatório';
    if (!form.endereco.bairro.trim()) errs.bairro = 'Obrigatório';
    if (!form.endereco.cep.trim()) errs.cep = 'Obrigatório';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => { if (validate()) setShowConsent(true); };
  const handleConfirm = () => { setShowConsent(false); onSave({ ...form, dataHoraAtualizacao: new Date().toISOString() }); };

  const inputProps = (field: keyof Familia, val: string) => ({
    className: errors[field] ? inp.replace('border-[#d0daef]', 'border-red-400') : (ro ? inpRO : inp),
    value: val, disabled: ro || viewMode === 'view',
  });

  const titleMap = { new: 'Nova Família', edit: 'Editar Família', view: 'Detalhes da Família' };

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
            <button onClick={() => setViewMode('edit')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ background: '#2b65bf' }}>
              <Pencil size={14} /> Editar
            </button>
          )}
          {(viewMode === 'new' || viewMode === 'edit') && (
            <>
              <button onClick={onBack} className="px-4 py-2 rounded-lg text-sm font-medium border border-[#d0daef] text-[#3d4f72] hover:bg-[#f0f4fb] transition-colors">
                Cancelar
              </button>
              <button onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ background: '#2b65bf' }}>
                Salvar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6" style={{ background: 'linear-gradient(135deg,#dce5f4 0%,#eef1f8 50%,#d4ddf0 100%)' }}>

        {/* Dados Pessoais */}
        <Section title="Dados do Responsável">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={lbl}>Nome completo *</label>
              <input {...inputProps('nomeResponsavel', e('nomeResponsavel'))}
                onChange={ev => f('nomeResponsavel')(ev.target.value)} placeholder="Nome do responsável familiar" />
              {errors.nomeResponsavel && <p className="text-xs text-red-500 mt-1">{errors.nomeResponsavel}</p>}
            </div>
            <div>
              <label className={lbl}>CPF *</label>
              <input {...inputProps('cpf', e('cpf'))} onChange={ev => f('cpf')(ev.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="Somente números" maxLength={11} />
              {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf}</p>}
            </div>
            <div>
              <label className={lbl}>Status de Emprego *</label>
              <select className={ro ? inpRO : inp} disabled={ro} value={form.statusEmpregoResponsavel}
                onChange={ev => f('statusEmpregoResponsavel')(ev.target.value as StatusEmprego)}>
                {Object.entries(EMPREGO_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Telefone *</label>
              <input {...inputProps('telefone', e('telefone'))} onChange={ev => f('telefone')(ev.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="DDD + número" />
              {errors.telefone && <p className="text-xs text-red-500 mt-1">{errors.telefone}</p>}
            </div>
            <div>
              <label className={lbl}>Telefone Secundário</label>
              <input className={ro ? inpRO : inp} disabled={ro} value={form.telefoneSecundario}
                onChange={ev => f('telefoneSecundario')(ev.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="DDD + número (opcional)" />
            </div>
          </div>
        </Section>

        {/* Composição */}
        <Section title="Composição Familiar">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {([['qtdIntegrantes', 'Total de Integrantes *'], ['qtdCriancas', 'Crianças (0–12)'], ['qtdAdolescentes', 'Adolescentes (13–17)'], ['qtdIdosos', 'Idosos (60+)']] as [keyof Familia, string][]).map(([k, label]) => (
              <div key={k}>
                <label className={lbl}>{label}</label>
                <input type="number" min={0} className={ro ? inpRO : inp} disabled={ro}
                  value={form[k] as number}
                  onChange={ev => f(k)(Number(ev.target.value) as any)} />
              </div>
            ))}
            <div>
              <label className={lbl}>Renda Familiar Total (R$) *</label>
              <input type="number" min={0} step="0.01" className={ro ? inpRO : inp} disabled={ro}
                value={form.rendaFamiliarTotal}
                onChange={ev => f('rendaFamiliarTotal')(Number(ev.target.value) as any)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <BoolRow label="Possui gestante" value={form.possuiGestante} onChange={f('possuiGestante') as any} readOnly={ro} />
            <BoolRow label="Possui lactante" value={form.possuiLactante} onChange={f('possuiLactante') as any} readOnly={ro} />
          </div>
        </Section>

        {/* Moradia */}
        <Section title="Moradia e Assistência Social">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={lbl}>Tipo de Moradia *</label>
              <select className={ro ? inpRO : inp} disabled={ro} value={form.tipoMoradia}
                onChange={ev => f('tipoMoradia')(ev.target.value as TipoMoradia)}>
                {Object.entries(MORADIA_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Situação do Cadastro</label>
              <select className={ro ? inpRO : inp} disabled={ro || viewMode === 'new'} value={form.situacaoCadastro}
                onChange={ev => f('situacaoCadastro')(ev.target.value as SituacaoCadastro)}>
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="PENDENTE_ATUALIZACAO">Pendente de Atualização</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <BoolRow label="Possui Cadastro Único" value={form.possuiCadastroUnico} onChange={f('possuiCadastroUnico') as any} readOnly={ro} />
            <BoolRow label="Possui membro PCD" value={form.possuiMembroPcd} onChange={f('possuiMembroPcd') as any} readOnly={ro} />
            <BoolRow label="Dependência química" value={form.possuiDependenciaQuimica} onChange={f('possuiDependenciaQuimica') as any} readOnly={ro} />
          </div>
          {form.possuiCadastroUnico && (
            <div className="mt-4">
              <label className={lbl}>Número NIS</label>
              <input className={ro ? inpRO : inp} disabled={ro} value={form.numeroNis}
                onChange={ev => f('numeroNis')(ev.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="11 dígitos" />
            </div>
          )}
        </Section>

        {/* Endereço */}
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
              <input className={ro ? inpRO : inp} disabled={ro} value={form.endereco.estadoUF} maxLength={2}
                onChange={ev => addr('estadoUF')(ev.target.value.toUpperCase().slice(0,2))} />
            </div>
          </div>
        </Section>

        {/* Observações */}
        <Section title="Observações e Pareceres">
          <div className="space-y-4">
            {([
              ['historicoDoencasCronicas', 'Histórico de Doenças Crônicas'],
              ['parecerDoAssistenteSocial', 'Parecer do Assistente Social'],
              ['observacoes', 'Observações Gerais'],
            ] as [keyof Familia, string][]).map(([k, label]) => (
              <div key={k}>
                <label className={lbl}>{label}</label>
                <textarea rows={3} className={(ro ? inpRO : inp) + ' resize-none'} disabled={ro}
                  value={form[k] as string} onChange={ev => f(k)(ev.target.value as any)}
                  placeholder={ro ? '—' : 'Digite aqui...'} />
              </div>
            ))}
          </div>
        </Section>
      </div>

      {showConsent && <ConsentModal onConfirm={handleConfirm} onCancel={() => setShowConsent(false)} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  FAMILIAS PAGE (LIST)
// ════════════════════════════════════════════════════════════════
export function FamiliasPage({ initialView }: { initialView?: 'list' | 'form' }) {
  const [familias, setFamilias] = useState<Familia[]>(MOCK_FAMILIAS);
  const [view, setView] = useState<'list' | 'form'>(initialView ?? 'list');
  const [selected, setSelected] = useState<Familia | null>(null);
  const [formMode, setFormMode] = useState<'new' | 'edit' | 'view'>(initialView === 'form' ? 'new' : 'new');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<SituacaoCadastro | 'ALL'>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('nomeResponsavel');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<'inativar' | 'ativar'>('inativar');

  const filtered = useMemo(() => {
    let r = familias.filter(f => {
      const q = search.toLowerCase();
      const matchSearch = !q || f.nomeResponsavel.toLowerCase().includes(q) || f.cpf.includes(q) || f.telefone.includes(q);
      const matchStatus = filterStatus === 'ALL' || f.situacaoCadastro === filterStatus;
      return matchSearch && matchStatus;
    });
    r.sort((a, b) => {
      const av = (a as any)[sortField] ?? '';
      const bv = (b as any)[sortField] ?? '';
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return r;
  }, [familias, search, filterStatus, sortField, sortDir]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safeP = Math.min(page, totalPages - 1);
  const pageData = filtered.slice(safeP * perPage, safeP * perPage + perPage);

  const handleSort = (field: string) => {
    if (field === sortField) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const openForm = (mode: 'new' | 'edit' | 'view', f?: Familia) => {
    setSelected(f ?? null); setFormMode(mode); setView('form');
  };

  const handleSave = (f: Familia) => {
    setFamilias(prev => {
      const idx = prev.findIndex(x => x.id === f.id);
      return idx >= 0 ? prev.map(x => x.id === f.id ? f : x) : [...prev, { ...f, id: Date.now() }];
    });
    setView('list');
  };

  const doToggle = (id: number, action: 'inativar' | 'ativar') => {
    setFamilias(prev => prev.map(f => f.id === id ? { ...f, situacaoCadastro: action === 'inativar' ? 'INATIVO' : 'ATIVO' } : f));
    setConfirmId(null);
  };

  if (view === 'form') {
    return <FamiliaForm familia={selected} mode={formMode} onBack={() => setView('list')} onSave={handleSave} />;
  }

  const thCls = 'px-4 py-3 text-left text-xs font-semibold text-[#6b7a9e] uppercase tracking-wide cursor-pointer select-none hover:text-[#2b65bf] whitespace-nowrap';
  const tdCls = 'px-4 py-3 text-sm text-[#3d4f72]';

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-6 py-5 bg-white border-b border-[#e4e9f4] flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold text-[#1a2744]">Famílias</h1>
          <p className="text-sm text-[#6b7a9e] mt-0.5">{total} {total === 1 ? 'família encontrada' : 'famílias encontradas'}</p>
        </div>
        <button onClick={() => openForm('new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: '#2b65bf', boxShadow: '0 2px 8px rgba(43,101,191,0.3)' }}>
          <Plus size={16} /> Nova Família
        </button>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-3 bg-white border-b border-[#e4e9f4] space-y-3 shrink-0">
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a9e]" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Buscar por nome, CPF ou telefone..."
              className="w-full pl-9 pr-8 py-2 rounded-lg text-sm border border-[#d0daef] bg-[#f0f4fb] text-[#1a2744] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b7a9e] hover:text-[#1a2744]"><X size={14} /></button>}
          </div>
          <button onClick={() => setShowFilters(s => !s)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${showFilters ? 'border-[#2b65bf] text-[#2b65bf] bg-blue-50' : 'border-[#d0daef] text-[#6b7a9e] hover:bg-[#f0f4fb]'}`}>
            <SlidersHorizontal size={15} /> Filtros {filterStatus !== 'ALL' && <span className="w-2 h-2 rounded-full bg-[#2b65bf] inline-block" />}
          </button>
        </div>
        {showFilters && (
          <div className="flex items-center gap-4 pt-1">
            <span className="text-xs font-medium text-[#6b7a9e] shrink-0">Situação:</span>
            <div className="flex gap-2">
              {(['ALL', 'ATIVO', 'INATIVO', 'PENDENTE_ATUALIZACAO'] as const).map(s => (
                <button key={s} onClick={() => { setFilterStatus(s); setPage(0); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterStatus === s ? 'bg-[#2b65bf] text-white border-[#2b65bf]' : 'border-[#d0daef] text-[#6b7a9e] hover:bg-[#f0f4fb]'}`}>
                  {s === 'ALL' ? 'Todos' : SITUACAO_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse min-w-[700px]">
          <thead className="sticky top-0 z-10" style={{ background: '#f8f9fc' }}>
            <tr className="border-b border-[#e4e9f4]">
              {([['nomeResponsavel','Nome do Responsável'], ['cpf','CPF'], ['qtdIntegrantes','Integrantes'], ['rendaFamiliarTotal','Renda'], ['situacaoCadastro','Situação'], ['dataHoraCadastro','Cadastro']] as [string,string][]).map(([f, label]) => (
                <th key={f} className={thCls} onClick={() => handleSort(f)}>
                  {label}<SortIcon field={f} sortField={sortField} sortDir={sortDir} />
                </th>
              ))}
              <th className="px-4 py-3 text-xs font-semibold text-[#6b7a9e] uppercase tracking-wide text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-[#6b7a9e]">Nenhuma família encontrada.</td></tr>
            ) : pageData.map((f, idx) => (
              <tr key={f.id} className="border-b border-[#f0f4fb] transition-colors hover:bg-[#f8f9fc]"
                style={{ background: idx % 2 === 0 ? 'white' : '#fafbfd' }}>
                <td className={tdCls + ' font-medium text-[#1a2744]'}>{f.nomeResponsavel}</td>
                <td className={tdCls}>{fmtCPF(f.cpf)}</td>
                <td className={tdCls + ' text-center'}>{f.qtdIntegrantes}</td>
                <td className={tdCls}>{fmtCurrency(f.rendaFamiliarTotal)}</td>
                <td className={tdCls}><SituacaoBadge s={f.situacaoCadastro} /></td>
                <td className={tdCls}>{fmtDate(f.dataHoraCadastro)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openForm('view', f)} title="Visualizar"
                      className="p-1.5 rounded-lg text-[#6b7a9e] hover:text-[#2b65bf] hover:bg-blue-50 transition-colors">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => openForm('edit', f)} title="Editar"
                      className="p-1.5 rounded-lg text-[#6b7a9e] hover:text-[#2b65bf] hover:bg-blue-50 transition-colors">
                      <Pencil size={15} />
                    </button>
                    {f.situacaoCadastro !== 'INATIVO' ? (
                      <button onClick={() => { setConfirmId(f.id); setConfirmAction('inativar'); }} title="Inativar"
                        className="p-1.5 rounded-lg text-[#6b7a9e] hover:text-red-500 hover:bg-red-50 transition-colors">
                        <UserX size={15} />
                      </button>
                    ) : (
                      <button onClick={() => { setConfirmId(f.id); setConfirmAction('ativar'); }} title="Ativar"
                        className="p-1.5 rounded-lg text-[#6b7a9e] hover:text-green-600 hover:bg-green-50 transition-colors">
                        <UserCheck size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
          {Array.from({ length: totalPages }, (_, i) => (
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

      {/* Confirm dialog */}
      {confirmId !== null && (
        <ConfirmDialog
          message={`Deseja ${confirmAction} a família de "${familias.find(f => f.id === confirmId)?.nomeResponsavel}"? ${confirmAction === 'inativar' ? 'O cadastro permanecerá no sistema.' : ''}`}
          confirmLabel={confirmAction === 'inativar' ? 'Inativar' : 'Ativar'}
          danger={confirmAction === 'inativar'}
          onConfirm={() => doToggle(confirmId, confirmAction)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
