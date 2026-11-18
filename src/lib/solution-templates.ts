export type SolutionTemplate = {
  id: string;
  title: string;
  niche: string;
  type: string;
  summary: string;
  objective: string;
  sections: string[];
  features: string[];
  prompt: string;
};

const baseRules = [
  "Criar uma experiência original, responsiva e profissional, priorizando celular.",
  "Não inventar avaliações, depoimentos, certificações, preços, endereço ou dados comerciais.",
  "Usar conteúdo demonstrativo claramente identificável até receber os dados reais do cliente.",
  "Implementar acessibilidade, estados vazios, validação de formulários e mensagens de erro.",
  "Preparar SEO básico, metadados, desempenho e imagens otimizadas.",
  "Manter identidade visual consistente e evitar aparência genérica de template.",
];

function makePrompt(title: string, niche: string, type: string, objective: string, sections: string[], features: string[]) {
  return [
    `PROJETO: ${title}`,
    `SEGMENTO: ${niche}`,
    `TIPO DE SOLUÇÃO: ${type}`,
    `OBJETIVO DE NEGÓCIO: ${objective}`,
    "",
    "CONTEXTO E DIREÇÃO:",
    "Desenvolva uma solução digital pronta para personalização e entrega profissional pela Arcany Digital. Antes de implementar, considere o público, a jornada do cliente e a ação principal que o negócio deseja gerar.",
    "",
    "ESTRUTURA DE PÁGINAS E SEÇÕES:",
    ...sections.map((item) => `- ${item}`),
    "",
    "FUNCIONALIDADES:",
    ...features.map((item) => `- ${item}`),
    "",
    "REQUISITOS DE QUALIDADE:",
    ...baseRules.map((item) => `- ${item}`),
    "- Separar componentes reutilizáveis de conteúdo específico do cliente.",
    "- Centralizar textos, cores, imagens, contatos e dados em uma configuração editável.",
    "- Não conectar pagamentos, WhatsApp API, estoque ou serviços externos sem credenciais e validação do cliente.",
    "- Entregar instruções de configuração, testes e publicação.",
    "",
    "DADOS DO CLIENTE A PERSONALIZAR:",
    "- Nome, logotipo, cores e identidade visual.",
    "- Fotos reais, textos, produtos/serviços, preços e condições.",
    "- WhatsApp, endereço, horários, redes sociais e domínio.",
    "- Regras operacionais, integrações e responsáveis.",
    "",
    "CRITÉRIO DE ACEITE:",
    "A solução deve funcionar em telas pequenas e grandes, ter navegação clara, formulários validados, conteúdo editável e nenhum dado fictício apresentado como verdadeiro.",
  ].join("\n");
}

function template(
  id: string, title: string, niche: string, type: string, summary: string, objective: string,
  sections: string[], features: string[],
): SolutionTemplate {
  return { id, title, niche, type, summary, objective, sections, features, prompt: makePrompt(title, niche, type, objective, sections, features) };
}

export const solutionTemplates: SolutionTemplate[] = [
  template("pet-landing", "Landing page para pet shop", "Pet", "Landing page", "Captação de contatos, apresentação de serviços e direcionamento para WhatsApp.", "Gerar pedidos de banho e tosa, consultas ou orçamento de produtos.", ["Hero com proposta de valor e CTA", "Serviços: banho, tosa, consultas ou cuidados", "Diferenciais e estrutura", "Galeria de pets e ambiente", "Perguntas frequentes", "Contato, localização e horários"], ["CTA fixo para WhatsApp", "Formulário de agendamento ou orçamento", "Blocos de serviços editáveis", "Mapa e links sociais"]),
  template("pet-catalog", "Catálogo de produtos pet", "Pet", "Catálogo digital", "Vitrine organizada para rações, acessórios, higiene e medicamentos permitidos.", "Facilitar consulta de produtos e pedidos pelo WhatsApp.", ["Destaques e ofertas", "Categorias por tipo e porte", "Cards de produtos", "Informações de entrega", "Contato"], ["Busca e filtros", "Produto com foto, descrição e preço fornecido pelo cliente", "Lista de interesse", "Pedido encaminhado ao WhatsApp"]),
  template("pet-booking", "Agendamento para banho e tosa", "Pet", "Agendamento", "Agenda para serviços recorrentes com seleção de pet e horário.", "Reduzir trocas de mensagens e organizar a agenda.", ["Seleção do serviço", "Dados do tutor e do pet", "Calendário e horários", "Confirmação e orientações"], ["Duração por serviço", "Bloqueio de horários ocupados", "Confirmação administrativa", "Lembretes preparados para integração"]),
  template("beauty-landing", "Landing page para salão de beleza", "Beleza", "Landing page", "Página de conversão com serviços, profissionais e agendamento.", "Transformar visitas em solicitações de horário.", ["Hero e CTA agendar", "Serviços e tratamentos", "Profissionais", "Galeria de resultados autorizados", "Depoimentos reais autorizados", "Localização e contato"], ["Botão de agendamento", "Tabela de serviços configurável", "Integração WhatsApp", "SEO local"]),
  template("beauty-booking", "Agenda para salão e barbearia", "Beleza", "Agendamento", "Fluxo de escolha de profissional, serviço e horário.", "Organizar agenda e reduzir conflitos de horários.", ["Escolha do serviço", "Escolha do profissional", "Calendário", "Dados do cliente", "Resumo e confirmação"], ["Duração real do serviço", "Bloqueio de intervalos consecutivos", "Regras de expediente e pausas", "Painel administrativo"]),
  template("fashion-store", "Vitrine digital de moda", "Moda e vestuário", "Vitrine digital", "Apresentação visual de coleções, novidades e peças disponíveis.", "Gerar descoberta de produtos e conversas de compra.", ["Banner de coleção", "Categorias", "Novidades e destaques", "Grade de produtos", "Guia de medidas", "Contato e políticas"], ["Filtros por tamanho, cor e categoria", "Galeria de fotos", "Variações de produto", "Consulta de disponibilidade"]),
  template("fashion-ecommerce", "E-commerce de roupas e calçados", "Moda e calçados", "E-commerce", "Loja virtual com variações, carrinho e fluxo de compra.", "Vender produtos com seleção de tamanho, cor e numeração.", ["Home e campanhas", "Categorias", "Detalhes do produto", "Carrinho", "Checkout", "Políticas e atendimento"], ["Variações e disponibilidade", "Cálculo de frete por integração", "Pedidos e status", "Pagamento somente após integração validada"]),
  template("retail-catalog", "Catálogo para loja de variedades", "Comércio varejista", "Catálogo digital", "Catálogo pesquisável para lojas com grande variedade de produtos.", "Ajudar clientes a localizar produtos e solicitar disponibilidade.", ["Destaques", "Categorias", "Busca", "Produtos", "Informações da loja", "Contato"], ["Busca e filtros", "Preço e disponibilidade editáveis", "Lista de produtos desejados", "Compartilhamento de itens"]),
  template("retail-stock", "Controle de estoque para comércio", "Comércio varejista", "Sistema de estoque", "Operação de produtos, entradas, saídas e alertas.", "Reduzir divergências e melhorar reposição.", ["Resumo de estoque", "Cadastro de produtos", "Fornecedores", "Entradas e saídas", "Inventário", "Relatórios"], ["SKU e código de barras preparado", "Estoque mínimo", "Histórico de movimentações", "Perfis e permissões"]),
  template("shoe-catalog", "Catálogo para loja de calçados", "Calçados", "Catálogo digital", "Vitrine com numeração, cores e disponibilidade por modelo.", "Diminuir perguntas repetitivas e facilitar consulta de numeração.", ["Coleções", "Categorias", "Produtos em destaque", "Detalhe com numeração", "Como comprar", "Contato"], ["Filtro por numeração e marca", "Grade de disponibilidade", "Fotos por ângulo", "Pedido por WhatsApp"]),
  template("restaurant-menu", "Cardápio digital para restaurante", "Alimentação", "Cardápio digital", "Cardápio por categorias com adicionais e chamada para pedido.", "Aumentar conversão e reduzir erros no pedido.", ["Destaques e combos", "Categorias", "Itens e adicionais", "Entrega ou retirada", "Horários e contato"], ["Carrinho", "Observações por item", "Adicionais configuráveis", "Envio de pedido ao canal escolhido"]),
  template("grocery-store", "Loja digital para mercado e hortifruti", "Mercado e hortifruti", "E-commerce", "Catálogo com unidades, peso, ofertas e entrega local.", "Receber pedidos de produtos por unidade ou peso.", ["Ofertas", "Categorias", "Produtos por unidade/kg", "Carrinho", "Entrega e pagamento", "Contato"], ["Unidade, kg e quantidade", "Substituição de item configurável", "Taxa de entrega", "Resumo do pedido"]),
  template("butcher-catalog", "Catálogo para açougue", "Açougue", "Catálogo e pedidos", "Vitrine de cortes, kits e ofertas com unidades de venda.", "Facilitar encomendas e pedidos para retirada ou entrega.", ["Kits e promoções", "Categorias de carnes", "Produtos por kg/unidade", "Orientações de pedido", "Entrega e contato"], ["Preço por kg ou unidade", "Quantidade", "Carrinho", "Pedido com resumo"]),
  template("clinic-landing", "Landing page para clínica", "Saúde e bem-estar", "Landing page", "Apresentação institucional com especialidades e solicitação de contato.", "Gerar contatos e solicitações de agendamento sem promessas clínicas.", ["Apresentação", "Especialidades", "Equipe e credenciais verificadas", "Estrutura", "Perguntas frequentes", "Contato"], ["Formulário de contato mínimo", "CTA de agendamento", "SEO local", "Avisos de privacidade"]),
  template("clinic-booking", "Solicitação de agendamento para clínica", "Saúde e bem-estar", "Agendamento", "Solicitação de horários com fluxo claro e coleta mínima de dados.", "Organizar pedidos de agendamento para confirmação pela equipe.", ["Tipo de atendimento", "Profissional (quando aplicável)", "Preferência de data", "Dados de contato", "Confirmação de solicitação"], ["Não expor informações sensíveis", "Confirmação pela equipe", "Regras de disponibilidade", "Aviso de privacidade"]),
  template("workshop-landing", "Site para oficina mecânica", "Automotivo", "Landing page", "Serviços, especialidades, localização e orçamento.", "Receber pedidos de orçamento e agendamento.", ["Hero e CTA", "Serviços automotivos", "Especialidades e marcas atendidas", "Estrutura", "Localização", "Contato"], ["Formulário de orçamento", "Envio de fotos pelo canal definido", "WhatsApp", "SEO local"]),
  template("workshop-management", "Gestão de ordens de serviço", "Automotivo", "Sistema de gestão", "Cadastro de clientes, veículos, orçamentos e etapas do serviço.", "Padronizar atendimento e acompanhar serviços em execução.", ["Clientes e veículos", "Entrada do veículo", "Orçamentos", "Ordens de serviço", "Status e histórico", "Relatórios"], ["Placa e dados do veículo", "Checklist de entrada", "Aprovação de orçamento", "Histórico por veículo"]),
  template("real-estate", "Vitrine imobiliária", "Imobiliário", "Vitrine digital", "Apresentação pesquisável de imóveis para venda e locação.", "Gerar contatos qualificados para cada imóvel.", ["Busca de imóveis", "Destaques", "Detalhes do imóvel", "Galeria", "Características", "Formulário de interesse"], ["Filtros por tipo, preço e localização", "Galeria", "Código do imóvel", "Contato vinculado ao imóvel"]),
  template("services-landing", "Landing page para prestador de serviços", "Serviços profissionais", "Landing page", "Página focada em confiança, escopo e solicitação de orçamento.", "Receber contatos e pedidos de orçamento qualificados.", ["Proposta de valor", "Serviços", "Como funciona", "Portfólio autorizado", "Perguntas frequentes", "Contato"], ["Formulário qualificador", "CTA de orçamento", "Área atendida", "SEO local"]),
  template("b2b-corporate", "Site institucional B2B", "Empresas e indústria", "Site institucional", "Apresentação corporativa com soluções, setores atendidos e contato comercial.", "Apoiar credibilidade e geração de oportunidades B2B.", ["Home institucional", "Soluções", "Setores atendidos", "Cases autorizados", "Sobre e certificações verificadas", "Contato comercial"], ["Formulário B2B", "Materiais para download", "SEO técnico", "Integração com CRM"]),
  template("generic-dashboard", "Dashboard operacional sob medida", "Multissetorial", "Sistema web", "Painel adaptável para indicadores, registros e rotinas operacionais.", "Digitalizar um processo específico validado com o cliente.", ["Visão geral", "Cadastros", "Operações", "Relatórios", "Configurações"], ["Papéis e permissões", "Filtros", "Exportação", "Trilha de auditoria", "Backup e recuperação"]),
];

export const templateNiches = ["Todos", ...Array.from(new Set(solutionTemplates.map((item) => item.niche)))];
export const templateTypes = ["Todos", ...Array.from(new Set(solutionTemplates.map((item) => item.type)))];
