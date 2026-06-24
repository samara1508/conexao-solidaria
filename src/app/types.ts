export type SituacaoCadastro = 'ATIVO' | 'INATIVO' | 'PENDENTE_ATUALIZACAO';
export type StatusEmprego = 'EMPREGO_FORMAL' | 'TRABALHO_AUTONOMO_INFORMAL' | 'DESEMPREGADO' | 'APOSENTADO_PENSIONISTA';
export type TipoMoradia = 'PROPRIA' | 'ALUGADA' | 'CEDIDA_FAVOR' | 'OCUPACAO_OCASIONAL' | 'SITUACAO_DE_RUA' | 'ABRIGO';
export type TipoInstituicao = 'CENTRAL' | 'FILIAL';
export type TipoMovimento = 'ENTRADA' | 'SAIDA';
export type TipoTransacao = 'DOACAO' | 'TRANSFERENCIA';
export type CategoriaItem = 'ALIMENTO' | 'HIGIENE_PESSOAL' | 'LIMPEZA' | 'VESTUARIO' | 'MEDICAMENTO' | 'ESCOLAR' | 'MOVEIS_UTENSILIOS';
export type UnidadeMedida = 'KG' | 'LITRO' | 'UNIDADE' | 'PACOTE' | 'PAR' | 'KIT';

export interface Endereco {
  id?: number;
  cep: string;
  bairro: string;
  rua: string;
  cidade: string;
  estadoUF: string;
  numero: string;
  complemento: string;
}

export interface Familia {
  id: number;
  nomeResponsavel: string;
  cpf: string;
  telefone: string;
  telefoneSecundario: string;
  dataHoraCadastro: string;
  dataHoraAtualizacao: string;
  qtdIntegrantes: number;
  rendaFamiliarTotal: number;
  qtdCriancas: number;
  qtdAdolescentes: number;
  qtdIdosos: number;
  possuiGestante: boolean;
  possuiLactante: boolean;
  situacaoCadastro: SituacaoCadastro;
  statusEmpregoResponsavel: StatusEmprego;
  possuiCadastroUnico: boolean;
  numeroNis: string;
  tipoMoradia: TipoMoradia;
  possuiMembroPcd: boolean;
  historicoDoencasCronicas: string;
  possuiDependenciaQuimica: boolean;
  parecerDoAssistenteSocial: string;
  observacoes: string;
  endereco: Endereco;
}

export interface Instituicao {
  id: number;
  nome: string;
  cnpj: string;
  nomeResponsavel: string;
  telefoneResponsavel: string;
  emailResponsavel: string;
  tipo: TipoInstituicao;
  telefoneInstituicao: string;
  emailInstituicao: string;
  centralId?: number;
  situacaoCadastro: SituacaoCadastro;
  endereco: Endereco;
}

export interface Item {
  id: number;
  nome: string;
  descricao: string;
  codigoBarras: string;
  categoria: CategoriaItem;
  unidadeMedida: UnidadeMedida;
  dataCadastro: string;
  ativo: boolean;
  exigeControleValidade: boolean;
  estoque: number;
  tamanho?: string;
}

export interface ItemMovimento {
  itemId: number;
  nome: string;
  quantidade: number;
  unidade: UnidadeMedida;
  estoqueAtual: number;
}

export type StatusUsuario = 'ativo' | 'inativo';

export interface Usuario {
  id: number;
  nome: string;
  nomeUsuario: string;
  senha?: string;
  dominio: string;
  email: string;
  status: StatusUsuario;
  cpf: string;
  isAdmin: boolean;
}

export interface DoacaoFamiliaItem {
  nome: string;
  categoria: CategoriaItem;
  quantidade: number;
  unidade: UnidadeMedida;
}

export interface DoacaoFamilia {
  id: number;
  instituicaoNome: string;
  instituicaoCnpj: string;
  familiaResponsavel: string;
  familiaCpf: string;
  data: string;
  itens: DoacaoFamiliaItem[];
}

export interface MovimentacaoEstoque {
  id: number;
  instituicaoNome: string;
  tipoMovimento: TipoMovimento;
  transacao: TipoTransacao;
  emitente: string;
  destinatario: string;
  quantidade: number;
  dataHora: string;
  observacao: string;
}


