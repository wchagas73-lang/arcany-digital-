# Roadmap da Arcany Digital

## Definição do produto

A Arcany é o ambiente interno de trabalho de uma única operação de agência digital. O proprietário usa a plataforma para prospectar empresas, diagnosticar problemas, preparar propostas, desenvolver soluções digitais, publicar entregáveis e manter histórico dos serviços prestados.

Empresas e clientes não recebem contas, convites ou acesso ao painel. A autenticação deve proteger somente o acesso administrativo do proprietário. O banco pode manter uma organização interna única por simplicidade, mas não deve oferecer auto cadastro, multi-tenant comercial ou onboarding de clientes.

## Fase 1 — Fundação e publicação
- [x] Estrutura inicial Next.js, TypeScript e identidade visual responsiva.
- [x] Navegação dos módulos comerciais.
- [x] Prospecção com Google Places e análise pública de sites.
- [x] Pipeline inicial de CRM e central de soluções.
- [x] Build de produção validado no GitHub Actions em uma revisão anterior.
- [ ] Confirmar publicação e variáveis de ambiente no projeto Vercel principal `arcany-digital` (sem hífen).
- [ ] Testar o fluxo completo no domínio publicado.

## Fase 2 — Contas e segurança multi-tenant
- [x] Supabase Auth com clientes SSR e sessão por cookies.
- [x] Proteção das rotas privadas.
- [x] Bootstrap de uma organização por conta.
- [x] RLS habilitado em todas as tabelas do schema público.
- [x] Políticas por organização e helper de associação movido para schema privado.
- [x] Restringir permissões das funções SQL.
- [x] Indexar chaves estrangeiras para reduzir gargalos de consulta.
- [ ] Testar cadastro, confirmação de e-mail, login, logout e recuperação de acesso.
- [ ] Testar isolamento com duas contas reais distintas.
- [ ] Confirmar as URLs de redirecionamento e variáveis de ambiente na Vercel.
- [ ] Gerar e versionar lockfile de dependências.

## Fase 3 — Prospecção
- [x] Pesquisa por cidade, estado e segmento via Google Places.
- [x] Filtros por presença de site listado no perfil.
- [x] Indicar foco comercial por tipo de solução.
- [x] Analisar página inicial e até quatro páginas internas públicas.
- [x] Exibir evidências, data e limites da verificação.
- [ ] Persistir pesquisas e empresas encontradas no banco da organização.
- [ ] Deduplicar empresas por identificadores e domínio.
- [ ] Permitir revisão e enriquecimento manual dos dados.
- [ ] Monitorar custos, cotas e limites da API.

## Fase 4 — Empresas, leads e atividades
- [ ] Tornar o cadastro de empresas totalmente persistente no Supabase.
- [ ] Tornar leads totalmente persistentes no Supabase.
- [ ] Unificar criação de leads entre prospecção, empresas e central de vendas.
- [ ] Histórico de contatos e atividades por empresa/lead.
- [ ] Tarefas, lembretes e próximos passos.
- [ ] Importação/exportação com proteção contra duplicidade.
- [ ] Garantir que dados locais antigos possam ser importados sem misturar contas.

## Fase 5 — Diagnóstico e propostas
- [x] Checklist inicial de oportunidades digitais.
- [x] Separar problemas confirmados, pontos a investigar e itens não identificados.
- [ ] Salvar diagnósticos vinculados às empresas.
- [ ] Gerar recomendações a partir de necessidades confirmadas.
- [ ] Criar propostas comerciais com escopo, prazo, valor e condições.
- [ ] Acompanhar envio, revisão, aceite e perda da proposta.

## Fase 6 — CRM comercial
- [x] Pipeline inicial com etapas de negociação.
- [x] Visão inicial de oportunidades e clientes fechados.
- [ ] Persistir todas as alterações e atividades no banco.
- [ ] Lembretes e agenda de follow-up.
- [ ] Histórico de conversas e resultados por lead.
- [ ] Indicadores calculados exclusivamente a partir de dados reais da conta.

## Fase 7 — Fábrica de soluções digitais
- [x] Central inicial para selecionar serviços e preparar briefings.
- [x] Tipos de solução: sites, catálogos, e-commerce, automações, CRM, estoque, financeiro e dashboards como entregáveis.
- [ ] Gerador de projetos com modelos por segmento.
- [ ] Pré-visualização e demonstrações reutilizáveis.
- [ ] Briefing, escopo, checklist, prazos e etapas de produção.
- [ ] Gestão de publicação, domínio e entrega ao cliente.
- [ ] Biblioteca de componentes e modelos reaproveitáveis.

## Fase 8 — Clientes, manutenção e pós-entrega
- [ ] Cadastro dos clientes atendidos pelo profissional.
- [ ] Contratos, planos de manutenção e renovações.
- [ ] Chamados, solicitações e histórico de suporte.
- [ ] Controle de acessos e credenciais com armazenamento seguro.
- [ ] Registro de entregas, links, domínios e documentação.
- [ ] Lembretes de vencimentos e acompanhamento.

## Fase 9 — Automação e IA
- [ ] Assistente para resumir pesquisas e sugerir oportunidades, sempre com evidências.
- [ ] Geração assistida de briefings, propostas e conteúdo.
- [ ] Fluxos de atendimento WhatsApp Business e integrações oficiais quando aplicável.
- [ ] Aprovação humana antes de enviar mensagens ou publicar conteúdo.
- [ ] Limites de uso e custos por organização.

## Fase 10 — Qualidade, planos e escala
- [ ] Testes automatizados de autenticação, RLS e fluxos comerciais.
- [ ] Testes de isolamento com contas independentes.
- [ ] Monitoramento, logs, backups e recuperação.
- [ ] Lockfile versionado e auditoria contínua de dependências.
- [ ] Planos, cobrança e limites de uso.
- [ ] Documentação de operação e suporte.

## Princípios do produto
- O assinante é o profissional que vende e desenvolve soluções digitais.
- Os negócios prospectados são clientes do assinante, não usuários da Arcany por padrão.
- Nenhum assinante pode visualizar dados de outro.
- Não apresentar suposições como fatos confirmados.
- Respeitar privacidade, termos das fontes de dados e legislação aplicável.
- Nunca expor chaves privadas no navegador ou no repositório.
- Não apagar dados ou tabelas sem backup, análise de dependências e plano de reversão.
