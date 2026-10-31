# Roadmap da Arcany Digital

## Fase 1 — Fundação (em andamento)
- [x] Criar estrutura inicial com Next.js e TypeScript.
- [x] Criar identidade visual e navegação responsiva.
- [x] Criar painel inicial e rotas dos módulos.
- [x] Documentar o estado real do projeto.
- [ ] Validar build e publicação na Vercel.

## Fase 2 — Dados e contas
- [ ] Banco PostgreSQL e camada de acesso com Prisma.
- [ ] Autenticação e proteção de rotas.
- [ ] Cadastro e edição de empresas e leads.
- [ ] Histórico de atividades.

## Fase 3 — Prospecção real
- [ ] Definir fontes e APIs permitidas para pesquisa de empresas.
- [ ] Filtros por cidade, estado e segmento.
- [ ] Coletar e registrar origem e data dos dados.
- [x] Pesquisar empresas por cidade, estado e segmento usando Google Places.
- [x] Filtrar empresas com ou sem site listado no perfil do Google.
- [x] Selecionar foco comercial: site, cardápio, e-commerce, Google, estoque, CRM ou financeiro.
- [x] Exibir sinais públicos encontrados e itens que ainda precisam de investigação.
- [x] Analisar a página inicial pública do site e procurar sinais de cardápio, catálogo, e-commerce, carrinho e pedidos.
- [x] Exibir evidências encontradas, endereço consultado e data da verificação, sem tratar ausência de sinal como prova.
- [ ] Ampliar a análise para páginas internas públicas (menu, produtos, loja e pedidos), registrando evidências e data.
- [ ] Criar checklist de diagnóstico por empresa e salvar o resultado no banco.
- [ ] Deduplicar empresas e permitir revisão manual.

## Fase 4 — Diagnóstico de oportunidades
- [x] Criar primeira tela para registrar necessidades por empresa.
- [x] Separar problemas confirmados, pontos a investigar e itens não identificados.
- [ ] Salvar diagnóstico vinculado à empresa no banco de dados.
- [ ] Gerar recomendações de soluções com base nos problemas confirmados.

## Fase 5 — Presença e publicação no Google
- [ ] Consultar e orientar a criação ou melhoria do Perfil da Empresa no Google.
- [ ] Integrar a API do Perfil da Empresa com OAuth e autorização explícita do proprietário.
- [ ] Preparar fluxo de atualização de informações, fotos, horários e categorias.
- [ ] Implementar publicação somente após autorização e aprovação do responsável; acompanhar verificação do Google.

## Fase 6 — CRM
- [ ] Pipeline de vendas configurável.
- [ ] Tarefas, lembretes e histórico de contatos.
- [ ] Indicadores calculados a partir dos dados reais.

## Fase 7 — Operação e gestão dos clientes
- [ ] Cadastro de produtos, fornecedores e movimentações de estoque.
- [ ] Importação de XML de NF-e com conferência dos itens antes da entrada.
- [ ] Controle de lotes, validade, perdas e estoque mínimo.
- [ ] Registrar vendas e baixar estoque automaticamente.
- [ ] Fluxo de caixa, contas a pagar e receber.
- [ ] CRM e histórico de relacionamento.
- [ ] Loja virtual, catálogo, carrinho e painel de pedidos.

## Fase 8 — Fábrica de soluções digitais
- [x] Criar central inicial para selecionar soluções e preparar briefings.
- [ ] Criar gerador de sites com modelos por segmento e pré-visualização.
- [ ] Criar gerador de e-commerce com catálogo, carrinho e pedidos.
- [ ] Criar módulos operacionais reutilizáveis: estoque, CRM, financeiro e dashboards.
- [ ] Conectar os projetos a banco de dados, autenticação e permissões por cliente.
- [ ] Integrar pagamentos, entrega e canais de atendimento conforme cada projeto.

## Fase 9 — Demonstrações e IA
- [ ] Modelos de sites por segmento.
- [ ] Geração de demonstrações com dados fornecidos ou verificados.
- [ ] Integração com provedor de IA via variáveis de ambiente seguras.
- [ ] Revisão humana antes de publicar ou enviar ao cliente.

## Fase 10 — Qualidade e escala
- [ ] Testes automatizados.
- [ ] Controle de uso, custos e limites das APIs.
- [ ] Logs, monitoramento e backups.
- [ ] Planos e cobrança, se fizer sentido para o produto.

## Princípios do produto
- Atender múltiplos nichos, sem limitar a plataforma a um único segmento.
- Não apresentar dados inventados como resultados reais.
- Respeitar termos de uso, privacidade e legislação aplicável.
- Não expor chaves privadas no navegador nem no repositório.
