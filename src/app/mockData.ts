import { Familia, Instituicao, Item, Usuario, DoacaoFamilia, MovimentacaoEstoque, Doador, Parceiro, Atendimento } from './types';

export const MOCK_FAMILIAS: Familia[] = [
  {
    id: 1,
    nomeResponsavel: 'Elizete da Silva',
    cpf: '12345678901',
    telefone: '54991234567',
    telefoneSecundario: '5432201122',
    dataHoraCadastro: '2026-06-20T08:38:09',
    dataHoraAtualizacao: '2026-06-22T10:08:41',
    qtdIntegrantes: 4,
    rendaFamiliarTotal: 1412.0,
    qtdCriancas: 2,
    qtdAdolescentes: 0,
    qtdIdosos: 0,
    possuiGestante: true,
    possuiLactante: false,
    situacaoCadastro: 'ATIVO',
    statusEmpregoResponsavel: 'TRABALHO_AUTONOMO_INFORMAL',
    possuiCadastroUnico: true,
    numeroNis: '12345678910',
    tipoMoradia: 'ALUGADA',
    possuiMembroPcd: false,
    historicoDoencasCronicas: 'Responsável relata quadro de asma crônica na criança mais nova.',
    possuiDependenciaQuimica: false,
    parecerDoAssistenteSocial: 'Família reside em imóvel alugado com infiltrações. Necessita de inclusão urgente no programa de distribuição de cestas básicas e acompanhamento da gestação.',
    observacoes: '',
    endereco: { id: 1, cep: '95034000', bairro: 'Centro', rua: 'Rua Flores', cidade: 'Caxias do Sul', estadoUF: 'RS', numero: '100', complemento: 'Próximo à paróquia central' },
  },
  {
    id: 2,
    nomeResponsavel: 'João Carlos Pereira',
    cpf: '98765432100',
    telefone: '54987654321',
    telefoneSecundario: '',
    dataHoraCadastro: '2026-05-15T14:20:00',
    dataHoraAtualizacao: '2026-06-01T09:00:00',
    qtdIntegrantes: 3,
    rendaFamiliarTotal: 900.0,
    qtdCriancas: 1,
    qtdAdolescentes: 1,
    qtdIdosos: 0,
    possuiGestante: false,
    possuiLactante: false,
    situacaoCadastro: 'ATIVO',
    statusEmpregoResponsavel: 'DESEMPREGADO',
    possuiCadastroUnico: true,
    numeroNis: '98765432100',
    tipoMoradia: 'CEDIDA_FAVOR',
    possuiMembroPcd: false,
    historicoDoencasCronicas: '',
    possuiDependenciaQuimica: false,
    parecerDoAssistenteSocial: 'Família em situação de vulnerabilidade. Responsável desempregado há 6 meses.',
    observacoes: 'Adolescente em idade escolar.',
    endereco: { id: 2, cep: '95010010', bairro: 'São Pelegrino', rua: 'Av. Júlio de Castilhos', cidade: 'Caxias do Sul', estadoUF: 'RS', numero: '450', complemento: 'Apto 12' },
  },
  {
    id: 3,
    nomeResponsavel: 'Maria Aparecida Santos',
    cpf: '11122233344',
    telefone: '54992223344',
    telefoneSecundario: '5432119900',
    dataHoraCadastro: '2026-04-10T11:00:00',
    dataHoraAtualizacao: '2026-04-10T11:00:00',
    qtdIntegrantes: 6,
    rendaFamiliarTotal: 2100.0,
    qtdCriancas: 3,
    qtdAdolescentes: 1,
    qtdIdosos: 1,
    possuiGestante: false,
    possuiLactante: true,
    situacaoCadastro: 'PENDENTE_ATUALIZACAO',
    statusEmpregoResponsavel: 'EMPREGO_FORMAL',
    possuiCadastroUnico: false,
    numeroNis: '',
    tipoMoradia: 'PROPRIA',
    possuiMembroPcd: true,
    historicoDoencasCronicas: 'Idoso com diabetes tipo 2 e hipertensão.',
    possuiDependenciaQuimica: false,
    parecerDoAssistenteSocial: 'Atualização cadastral necessária. Renda declarada não corresponde com situação domiciliar.',
    observacoes: '',
    endereco: { id: 3, cep: '95020050', bairro: 'Madureira', rua: 'Rua Ernesto Alves', cidade: 'Caxias do Sul', estadoUF: 'RS', numero: '78', complemento: '' },
  },
  {
    id: 4,
    nomeResponsavel: 'Carlos Eduardo Oliveira',
    cpf: '55566677788',
    telefone: '54993334455',
    telefoneSecundario: '',
    dataHoraCadastro: '2026-03-02T09:30:00',
    dataHoraAtualizacao: '2026-05-20T16:00:00',
    qtdIntegrantes: 2,
    rendaFamiliarTotal: 0.0,
    qtdCriancas: 0,
    qtdAdolescentes: 0,
    qtdIdosos: 0,
    possuiGestante: false,
    possuiLactante: false,
    situacaoCadastro: 'INATIVO',
    statusEmpregoResponsavel: 'APOSENTADO_PENSIONISTA',
    possuiCadastroUnico: true,
    numeroNis: '55566677788',
    tipoMoradia: 'ALUGADA',
    possuiMembroPcd: false,
    historicoDoencasCronicas: '',
    possuiDependenciaQuimica: false,
    parecerDoAssistenteSocial: 'Família saiu da área de atendimento.',
    observacoes: 'Mudou para outro município.',
    endereco: { id: 4, cep: '95040100', bairro: 'Lourdes', rua: 'Rua Garibaldi', cidade: 'Caxias do Sul', estadoUF: 'RS', numero: '233', complemento: '' },
  },
  {
    id: 5,
    nomeResponsavel: 'Ana Paula Rodrigues',
    cpf: '33344455566',
    telefone: '54994445566',
    telefoneSecundario: '',
    dataHoraCadastro: '2026-06-01T15:00:00',
    dataHoraAtualizacao: '2026-06-01T15:00:00',
    qtdIntegrantes: 5,
    rendaFamiliarTotal: 1800.0,
    qtdCriancas: 2,
    qtdAdolescentes: 2,
    qtdIdosos: 0,
    possuiGestante: false,
    possuiLactante: false,
    situacaoCadastro: 'ATIVO',
    statusEmpregoResponsavel: 'TRABALHO_AUTONOMO_INFORMAL',
    possuiCadastroUnico: true,
    numeroNis: '33344455566',
    tipoMoradia: 'PROPRIA',
    possuiMembroPcd: false,
    historicoDoencasCronicas: '',
    possuiDependenciaQuimica: false,
    parecerDoAssistenteSocial: '',
    observacoes: '',
    endereco: { id: 5, cep: '95050200', bairro: 'Santa Catarina', rua: 'Rua XV de Novembro', cidade: 'Caxias do Sul', estadoUF: 'RS', numero: '512', complemento: 'Casa fundos' },
  },
];

export const MOCK_INSTITUICOES: Instituicao[] = [
  {
    id: 1,
    nome: 'Conexão Solidária Central',
    cnpj: '12345678000100',
    nomeResponsavel: 'Diego Pereira',
    telefoneResponsavel: '5498769045',
    emailResponsavel: 'diego.pereira@conexaosolidaria.org',
    tipo: 'CENTRAL',
    telefoneInstituicao: '5433727632',
    emailInstituicao: 'contato@conexaosolidaria.org',
    situacaoCadastro: 'ATIVO',
    endereco: { id: 1, cep: '95010000', bairro: 'Centro', rua: 'Rua Sinimbu', cidade: 'Caxias do Sul', estadoUF: 'RS', numero: '1580', complemento: 'Sala 201' },
  },
  {
    id: 2,
    nome: 'Filial Norte',
    cnpj: '12345678000281',
    nomeResponsavel: 'Carla Mendes',
    telefoneResponsavel: '54991110022',
    emailResponsavel: 'carla.mendes@conexaosolidaria.org',
    tipo: 'FILIAL',
    telefoneInstituicao: '5433001122',
    emailInstituicao: 'norte@conexaosolidaria.org',
    centralId: 1,
    situacaoCadastro: 'ATIVO',
    endereco: { id: 2, cep: '95045100', bairro: 'Nossa Senhora de Lourdes', rua: 'Rua Gustavo Kuhn', cidade: 'Caxias do Sul', estadoUF: 'RS', numero: '320', complemento: '' },
  },
  {
    id: 3,
    nome: 'Filial Sul',
    cnpj: '12345678000362',
    nomeResponsavel: 'Rafael Costa',
    telefoneResponsavel: '54992223344',
    emailResponsavel: 'rafael.costa@conexaosolidaria.org',
    tipo: 'FILIAL',
    telefoneInstituicao: '5433445566',
    emailInstituicao: 'sul@conexaosolidaria.org',
    centralId: 1,
    situacaoCadastro: 'ATIVO',
    endereco: { id: 3, cep: '95060300', bairro: 'Madureira', rua: 'Rua Qualquer', cidade: 'Caxias do Sul', estadoUF: 'RS', numero: '100', complemento: 'Ponto de ônibus em frente' },
  },
];

export const MOCK_ITENS: Item[] = [
  { id: 1, nome: 'Arroz Branco Tio Juca Tipo 1 (1kg)', descricao: 'Pacote de arroz polido', codigoBarras: '7891234567890', categoria: 'ALIMENTO', unidadeMedida: 'KG', dataCadastro: '2026-06-20', ativo: true, exigeControleValidade: true, estoque: 45 },
  { id: 2, nome: 'Feijão Preto (1kg)', descricao: 'Pacote de feijão preto', codigoBarras: '7891234567891', categoria: 'ALIMENTO', unidadeMedida: 'KG', dataCadastro: '2026-06-20', ativo: true, exigeControleValidade: true, estoque: 32 },
  { id: 3, nome: 'Óleo de Soja (900ml)', descricao: 'Garrafa de óleo de soja', codigoBarras: '7891234567892', categoria: 'ALIMENTO', unidadeMedida: 'LITRO', dataCadastro: '2026-06-20', ativo: true, exigeControleValidade: true, estoque: 28 },
  { id: 4, nome: 'Macarrão Espaguete (500g)', descricao: 'Pacote de macarrão', codigoBarras: '7891234567893', categoria: 'ALIMENTO', unidadeMedida: 'PACOTE', dataCadastro: '2026-06-20', ativo: true, exigeControleValidade: true, estoque: 60 },
  { id: 5, nome: 'Shampoo Anticaspa (200ml)', descricao: 'Shampoo para uso diário', codigoBarras: '7891234567894', categoria: 'HIGIENE_PESSOAL', unidadeMedida: 'UNIDADE', dataCadastro: '2026-06-21', ativo: true, exigeControleValidade: false, estoque: 18 },
  { id: 6, nome: 'Sabonete (90g)', descricao: 'Sabonete barra', codigoBarras: '7891234567895', categoria: 'HIGIENE_PESSOAL', unidadeMedida: 'UNIDADE', dataCadastro: '2026-06-21', ativo: true, exigeControleValidade: false, estoque: 50 },
  { id: 7, nome: 'Detergente Ypê (500ml)', descricao: 'Detergente neutro', codigoBarras: '7891234567896', categoria: 'LIMPEZA', unidadeMedida: 'UNIDADE', dataCadastro: '2026-06-21', ativo: true, exigeControleValidade: false, estoque: 22 },
  { id: 8, nome: 'Fralda Descartável M (pacote 20un)', descricao: 'Fraldas tamanho M', codigoBarras: '7891234567897', categoria: 'HIGIENE_PESSOAL', unidadeMedida: 'PACOTE', dataCadastro: '2026-06-22', ativo: true, exigeControleValidade: false, estoque: 10 },
  { id: 9, nome: 'Casaco de Lã Infantil', descricao: 'Casaco de frio de lã para inverno', codigoBarras: '7891234567898', categoria: 'VESTUARIO', unidadeMedida: 'UNIDADE', dataCadastro: '2026-06-22', ativo: true, exigeControleValidade: false, estoque: 8, tamanho: 'G (Infantil)' },
  { id: 10, nome: 'Sapato Social Masculino', descricao: 'Sapato social de couro preto', codigoBarras: '7891234567899', categoria: 'VESTUARIO', unidadeMedida: 'PAR', dataCadastro: '2026-06-22', ativo: true, exigeControleValidade: false, estoque: 15, tamanho: '41' },
  { id: 11, nome: 'Calça Jeans Juvenil', descricao: 'Calça jeans azul unissex', codigoBarras: '7891234567900', categoria: 'VESTUARIO', unidadeMedida: 'UNIDADE', dataCadastro: '2026-06-22', ativo: true, exigeControleValidade: false, estoque: 12, tamanho: '14' },
];

export const MOCK_USUARIOS: Usuario[] = [
  { id: 1, nome: 'Ivone do Carmo', nomeUsuario: 'ivone16', senha: '123456', dominio: 'caritas', email: 'ivone.carmo@gmail.com', status: 'ativo', cpf: '12345678901', isAdmin: false },
  { id: 2, nome: 'Admin Geral', nomeUsuario: 'admin', senha: 'adminpassword', dominio: 'caritas', email: 'admin@caritas.org', status: 'ativo', cpf: '98765432100', isAdmin: true },
  { id: 3, nome: 'José da Silva', nomeUsuario: 'jose.silva', senha: 'password123', dominio: 'caritas', email: 'jose.silva@caritas.org', status: 'inativo', cpf: '11122233344', isAdmin: false },
];

export const MOCK_DOACOES_FAMILIAS: DoacaoFamilia[] = [
  {
    id: 1,
    instituicaoNome: 'Conexão Solidária Central',
    instituicaoCnpj: '12345678000100',
    familiaResponsavel: 'Elizete da Silva',
    familiaCpf: '12345678901',
    data: '2026-06-23',
    itens: [
      { nome: 'Arroz Branco Tio Juca Tipo 1 (1kg)', categoria: 'ALIMENTO', quantidade: 5, unidade: 'KG' },
      { nome: 'Feijão Preto (1kg)', categoria: 'ALIMENTO', quantidade: 3, unidade: 'KG' },
      { nome: 'Sabonete (90g)', categoria: 'HIGIENE_PESSOAL', quantidade: 5, unidade: 'UNIDADE' }
    ]
  },
  {
    id: 2,
    instituicaoNome: 'Filial Norte',
    instituicaoCnpj: '12345678000281',
    familiaResponsavel: 'João Carlos Pereira',
    familiaCpf: '98765432100',
    data: '2026-06-24',
    itens: [
      { nome: 'Macarrão Espaguete (500g)', categoria: 'ALIMENTO', quantidade: 10, unidade: 'PACOTE' },
      { nome: 'Óleo de Soja (900ml)', categoria: 'ALIMENTO', quantidade: 4, unidade: 'LITRO' }
    ]
  },
  {
    id: 3,
    instituicaoNome: 'Filial Sul',
    instituicaoCnpj: '12345678000362',
    familiaResponsavel: 'Maria Aparecida Santos',
    familiaCpf: '11122233344',
    data: '2026-06-22',
    itens: [
      { nome: 'Fralda Descartável M (pacote 20un)', categoria: 'HIGIENE_PESSOAL', quantidade: 2, unidade: 'PACOTE' },
      { nome: 'Shampoo Anticaspa (200ml)', categoria: 'HIGIENE_PESSOAL', quantidade: 1, unidade: 'UNIDADE' },
      { nome: 'Sabonete (90g)', categoria: 'HIGIENE_PESSOAL', quantidade: 10, unidade: 'UNIDADE' }
    ]
  },
  {
    id: 4,
    instituicaoNome: 'Conexão Solidária Central',
    instituicaoCnpj: '12345678000100',
    familiaResponsavel: 'Elizete da Silva',
    familiaCpf: '12345678901',
    data: '2026-06-12',
    itens: [{ nome: 'Feijão Preto (1kg)', categoria: 'ALIMENTO', quantidade: 4, unidade: 'KG' }]
  },
  {
    id: 5,
    instituicaoNome: 'Filial Norte',
    instituicaoCnpj: '12345678000281',
    familiaResponsavel: 'João Carlos Pereira',
    familiaCpf: '98765432100',
    data: '2026-06-12',
    itens: [{ nome: 'Arroz Branco Tio Juca Tipo 1 (1kg)', categoria: 'ALIMENTO', quantidade: 5, unidade: 'KG' }]
  },
  {
    id: 6,
    instituicaoNome: 'Filial Norte',
    instituicaoCnpj: '12345678000281',
    familiaResponsavel: 'Ana Paula Rodrigues',
    familiaCpf: '33344455566',
    data: '2026-06-14',
    itens: [{ nome: 'Macarrão Espaguete (500g)', categoria: 'ALIMENTO', quantidade: 3, unidade: 'PACOTE' }]
  },
  {
    id: 7,
    instituicaoNome: 'Conexão Solidária Central',
    instituicaoCnpj: '12345678000100',
    familiaResponsavel: 'Elizete da Silva',
    familiaCpf: '12345678901',
    data: '2026-06-15',
    itens: [{ nome: 'Sabonete (90g)', categoria: 'HIGIENE_PESSOAL', quantidade: 2, unidade: 'UNIDADE' }]
  },
  {
    id: 8,
    instituicaoNome: 'Filial Sul',
    instituicaoCnpj: '12345678000362',
    familiaResponsavel: 'Maria Aparecida Santos',
    familiaCpf: '11122233344',
    data: '2026-06-15',
    itens: [{ nome: 'Óleo de Soja (900ml)', categoria: 'ALIMENTO', quantidade: 2, unidade: 'LITRO' }]
  },
  {
    id: 9,
    instituicaoNome: 'Filial Norte',
    instituicaoCnpj: '12345678000281',
    familiaResponsavel: 'João Carlos Pereira',
    familiaCpf: '98765432100',
    data: '2026-06-15',
    itens: [{ nome: 'Detergente Ypê (500ml)', categoria: 'LIMPEZA', quantidade: 4, unidade: 'UNIDADE' }]
  },
  {
    id: 10,
    instituicaoNome: 'Conexão Solidária Central',
    instituicaoCnpj: '12345678000100',
    familiaResponsavel: 'Elizete da Silva',
    familiaCpf: '12345678901',
    data: '2026-06-18',
    itens: [{ nome: 'Macarrão Espaguete (500g)', categoria: 'ALIMENTO', quantidade: 5, unidade: 'PACOTE' }]
  },
  {
    id: 11,
    instituicaoNome: 'Filial Sul',
    instituicaoCnpj: '12345678000362',
    familiaResponsavel: 'Maria Aparecida Santos',
    familiaCpf: '11122233344',
    data: '2026-06-18',
    itens: [{ nome: 'Casaco de Lã Infantil', categoria: 'VESTUARIO', quantidade: 2, unidade: 'UNIDADE' }]
  },
  {
    id: 12,
    instituicaoNome: 'Conexão Solidária Central',
    instituicaoCnpj: '12345678000100',
    familiaResponsavel: 'Ana Paula Rodrigues',
    familiaCpf: '33344455566',
    data: '2026-06-20',
    itens: [{ nome: 'Arroz Branco Tio Juca Tipo 1 (1kg)', categoria: 'ALIMENTO', quantidade: 10, unidade: 'KG' }]
  },
  {
    id: 13,
    instituicaoNome: 'Filial Norte',
    instituicaoCnpj: '12345678000281',
    familiaResponsavel: 'João Carlos Pereira',
    familiaCpf: '98765432100',
    data: '2026-06-21',
    itens: [{ nome: 'Sabonete (90g)', categoria: 'HIGIENE_PESSOAL', quantidade: 3, unidade: 'UNIDADE' }]
  },
  {
    id: 14,
    instituicaoNome: 'Conexão Solidária Central',
    instituicaoCnpj: '12345678000100',
    familiaResponsavel: 'Elizete da Silva',
    familiaCpf: '12345678901',
    data: '2026-06-21',
    itens: [{ nome: 'Óleo de Soja (900ml)', categoria: 'ALIMENTO', quantidade: 3, unidade: 'LITRO' }]
  }
];

export const MOCK_MOVIMENTACOES_ESTOQUE: MovimentacaoEstoque[] = [
  {
    id: 1,
    instituicaoNome: 'Conexão Solidária Central',
    tipoMovimento: 'ENTRADA',
    transacao: 'DOACAO',
    emitente: 'Supermercado Compre Bem',
    destinatario: 'Conexão Solidária Central',
    quantidade: 150,
    dataHora: '2026-06-20T09:30:00',
    observacao: 'Carga recebida em bom estado. Alimentos diversos.'
  },
  {
    id: 2,
    instituicaoNome: 'Conexão Solidária Central',
    tipoMovimento: 'SAIDA',
    transacao: 'TRANSFERENCIA',
    emitente: 'Conexão Solidária Central',
    destinatario: 'Filial Norte',
    quantidade: 50,
    dataHora: '2026-06-21T14:15:00',
    observacao: 'Transferência de mantimentos para reforço no estoque.'
  },
  {
    id: 3,
    instituicaoNome: 'Filial Norte',
    tipoMovimento: 'ENTRADA',
    transacao: 'TRANSFERENCIA',
    emitente: 'Conexão Solidária Central',
    destinatario: 'Filial Norte',
    quantidade: 50,
    dataHora: '2026-06-21T15:00:00',
    observacao: 'Recebimento de carga de transferência.'
  },
  {
    id: 4,
    instituicaoNome: 'Filial Norte',
    tipoMovimento: 'SAIDA',
    transacao: 'DOACAO',
    emitente: 'Filial Norte',
    destinatario: 'Família Elizete da Silva',
    quantidade: 13,
    dataHora: '2026-06-23T10:45:00',
    observacao: 'Cesta básica padrão entregue diretamente ao beneficiário.'
  },
  {
    id: 5,
    instituicaoNome: 'Filial Sul',
    tipoMovimento: 'ENTRADA',
    transacao: 'DOACAO',
    emitente: 'Mesa Brasil SESC',
    destinatario: 'Filial Sul',
    quantidade: 300,
    dataHora: '2026-06-22T08:00:00',
    observacao: 'Grande lote de produtos de higiene e limpeza doado.'
  },
  {
    id: 6,
    instituicaoNome: 'Filial Sul',
    tipoMovimento: 'SAIDA',
    transacao: 'DOACAO',
    emitente: 'Filial Sul',
    destinatario: 'Família Maria Aparecida Santos',
    quantidade: 13,
    dataHora: '2026-06-22T16:30:00',
    observacao: 'Produtos de higiene pessoal entregues.'
  },
  {
    id: 7,
    instituicaoNome: 'Conexão Solidária Central',
    tipoMovimento: 'ENTRADA',
    transacao: 'DOACAO',
    emitente: 'Tio João Ltda',
    destinatario: 'Conexão Solidária Central',
    quantidade: 100,
    dataHora: '2026-06-12T10:00:00',
    observacao: 'Doação de arroz e cestas secas.'
  },
  {
    id: 8,
    instituicaoNome: 'Conexão Solidária Central',
    tipoMovimento: 'ENTRADA',
    transacao: 'DOACAO',
    emitente: 'Maria de Souza',
    destinatario: 'Conexão Solidária Central',
    quantidade: 50,
    dataHora: '2026-06-15T11:30:00',
    observacao: 'Doação de vestuário de inverno.'
  },
  {
    id: 9,
    instituicaoNome: 'Filial Norte',
    tipoMovimento: 'ENTRADA',
    transacao: 'DOACAO',
    emitente: 'Hortifruti Caxias',
    destinatario: 'Filial Norte',
    quantidade: 220,
    dataHora: '2026-06-18T09:00:00',
    observacao: 'Doação de legumes frescos e frutas da estação.'
  },
  {
    id: 10,
    instituicaoNome: 'Filial Sul',
    tipoMovimento: 'ENTRADA',
    transacao: 'DOACAO',
    emitente: 'Associação Amigos do Bem',
    destinatario: 'Filial Sul',
    quantidade: 180,
    dataHora: '2026-06-21T16:00:00',
    observacao: 'Doação de leite e suplementos alimentares.'
  },
  {
    id: 11,
    instituicaoNome: 'Conexão Solidária Central',
    tipoMovimento: 'ENTRADA',
    transacao: 'DOACAO',
    emitente: 'Distribuidora RS',
    destinatario: 'Conexão Solidária Central',
    quantidade: 85,
    dataHora: '2026-06-23T14:00:00',
    observacao: 'Produtos de limpeza em geral.'
  }
];

export const MOCK_DOADORES: Doador[] = [
  {
    id: 1,
    nome: 'Tio João Ltda',
    email: 'tio.joao@gmail.com',
    status: 'ativo',
    cpfCnpj: '00000000000000',
    telefone: '33869023',
    observacoes: 'Realizam doação mensal de cestas de arroz',
    endereco: { cep: '95020050', bairro: 'Centro', rua: 'Rua Sinimbu', cidade: 'Caxias do Sul', estadoUF: 'RS', numero: '123', complemento: 'Prédio comercial A' }
  },
  {
    id: 2,
    nome: 'Maria de Souza',
    email: 'maria.souza@yahoo.com.br',
    status: 'ativo',
    cpfCnpj: '12345678909',
    telefone: '54991122334',
    observacoes: 'Doadora pontual de vestuário e calçados',
    endereco: { cep: '95010010', bairro: 'São Pelegrino', rua: 'Av. Júlio de Castilhos', cidade: 'Caxias do Sul', estadoUF: 'RS', numero: '450', complemento: 'Apto 204' }
  },
  {
    id: 3,
    nome: 'Supermercado Sol',
    email: 'contato@supermercadosol.com.br',
    status: 'inativo',
    cpfCnpj: '98765432000199',
    telefone: '5432219000',
    observacoes: 'Parceria finalizada em 2025',
    endereco: { cep: '95034000', bairro: 'Centro', rua: 'Rua Flores', cidade: 'Caxias do Sul', estadoUF: 'RS', numero: '99', complemento: '' }
  }
];

export const MOCK_PARCEIROS: Parceiro[] = [
  {
    id: 1,
    nome: 'Associação Comunitária Esperança',
    email: 'contato@aceesperanca.org',
    status: 'ativo',
    cpfCnpj: '12345678000100',
    telefone: '5432298765',
    observacoes: 'Parceiro para triagem e divulgação',
    endereco: { cep: '95020050', bairro: 'Centro', rua: 'Rua Sinimbu', cidade: 'Caxias do Sul', estadoUF: 'RS', numero: '780', complemento: 'Sala 4' }
  },
  {
    id: 2,
    nome: 'Logística Expressa Sul',
    email: 'contato@logexpress.com.br',
    status: 'ativo',
    cpfCnpj: '98765432000188',
    telefone: '5432205566',
    observacoes: 'Apoio logístico e transporte de doações pesadas',
    endereco: { cep: '95034000', bairro: 'Centro', rua: 'Rua Flores', cidade: 'Caxias do Sul', estadoUF: 'RS', numero: '1200', complemento: 'Galpão B' }
  },
  {
    id: 3,
    nome: 'Gráfica Caxias',
    email: 'comercial@graficacaxias.com.br',
    status: 'inativo',
    cpfCnpj: '11222333000144',
    telefone: '5432214400',
    observacoes: 'Inativo temporariamente para balanço',
    endereco: { cep: '95010010', bairro: 'São Pelegrino', rua: 'Av. Júlio de Castilhos', cidade: 'Caxias do Sul', estadoUF: 'RS', numero: '10', complemento: '' }
  }
];

export const MOCK_ATENDIMENTOS: Atendimento[] = [
  {
    id: 1,
    dataHora: '2026-06-22T10:00:00',
    tipoCadastro: 'Manual',
    observacao: 'Triagem e alinhamento de entregas de cestas de arroz.',
    tipoDoador: 'Doador',
    doadorParceiroId: 1
  },
  {
    id: 2,
    dataHora: '2026-06-23T14:30:00',
    tipoCadastro: 'Manual',
    observacao: 'Reunião para acertar cronograma de transporte de mantimentos.',
    tipoDoador: 'Parceiro',
    doadorParceiroId: 2
  },
  {
    id: 3,
    dataHora: '2026-06-24T16:00:00',
    tipoCadastro: 'Manual',
    observacao: 'Coleta de donativo de vestuário de inverno.',
    tipoDoador: 'Doador',
    doadorParceiroId: 2
  }
];

