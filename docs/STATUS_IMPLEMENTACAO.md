# Arcany Digital — status de implementação

Atualizado em 31/10/2026.

## Implementado no repositório

- Cliente de navegador Supabase e tela de acesso/cadastro.
- Prospecção por cidade, UF e segmento usando Google Places, com filtro de site listado e carregamento paginado de resultados.
- Criação automática da organização no primeiro acesso autenticado.
- Controle de estoque com cadastro de produtos, saldo inicial e movimentações de entrada, saída, perda e devolução.
- Financeiro com lançamentos de receitas/despesas, vencimento e status.
- CRM com leitura do banco por organização, atualização de etapas e importação inicial dos leads locais quando a base remota está vazia.
- Leads com ação manual de sincronização para a organização autenticada.
- Criador de projetos para site, cardápio e loja, com configuração de identidade e produtos.
- Vitrines públicas em `/loja/[slug]`, com carrinho e envio de pedido.
- Endpoint servidor de pedidos: valida produtos e quantidades e recalcula os preços usando a configuração publicada, sem confiar no total enviado pelo navegador.
- Painel de pedidos com atualização de status e pagamento.
- Migrações SQL iniciais e de vitrines públicas, com RLS e privilégios explícitos.
- Documentação de ativação do Supabase e variáveis necessárias.

## Validação

- A compilação de produção do commit `027b11d2` passou no GitHub Actions.
- A compilação do criador de projetos e da vitrine pública também passou em commits anteriores.
- O GitHub Actions confirmou sucesso para a compilação do commit `69db22e9` e para os módulos de pedidos, estoque e navegação.
- A paginação da prospecção foi adicionada nos commits `7cbb5f1c` e `783467e5`; as respectivas execuções devem ser consultadas antes de considerar essa atualização validada.

## Dependências externas que não podem ser concluídas só pelo repositório

1. Executar as duas migrações SQL no projeto Supabase.
2. Configurar na Vercel `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` (esta última somente no servidor).
3. Configurar a chave Google Places no servidor para a prospecção.
4. Fazer o deploy na Vercel e validar a URL de produção.
5. Configurar um provedor de pagamento para Pix/cartão; atualmente o fluxo registra pedido e direciona a conversa para o WhatsApp, sem cobrar online.
6. Configurar domínio próprio e publicação independente para cada cliente; as vitrines atuais são hospedadas no domínio Arcany.
7. Integrar baixa automática de estoque com pedidos e testar segurança com usuários de organizações diferentes.
8. Implementar e validar cobrança online, webhooks de pagamento, reembolsos e conciliação, caso a Arcany vá receber pagamentos dentro da plataforma.
9. Configurar monitoramento, limites de uso e alertas para as APIs externas, além de política de privacidade e termos de uso.

## Critério de conclusão

Não declarar a plataforma 100% pronta até que as migrações estejam aplicadas, as variáveis configuradas, o deploy validado e os fluxos de autenticação, isolamento multiempresa, criação/publicação de vitrine, pedido público, gestão de pedidos, estoque, CRM e financeiro sejam testados em produção.
