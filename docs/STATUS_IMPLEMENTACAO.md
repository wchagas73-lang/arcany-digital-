# Arcany Digital: status de implementação

Atualizado em 14/11/2026.

## Objetivo do produto

A Arcany Digital é a plataforma SaaS usada pelo profissional que prospecta empresas e vende soluções digitais sob medida. As empresas prospectadas são clientes do profissional e não precisam criar conta na Arcany para receber sites, catálogos, lojas, automações ou sistemas.

## Repositório e integração

- Repositório: `wchagas73-lang/arcany-digital-`.
- Branch de integração: `feat/supabase-auth-protection`.
- Branch padrão: `main`.
- A branch de integração está à frente da `main`, sem commits atrás, e existe uma PR em rascunho (#1). Não mesclar sem revisão do diff e dos efeitos nos módulos existentes.
- A PR altera autenticação, armazenamento, navegação e módulos de negócio. Também remove a rota antiga `src/app/api/pedidos/route.ts`. Os módulos de estoque, financeiro e pedidos foram restaurados nesta etapa e voltaram ao menu, com consultas limitadas à organização autenticada. O recebimento público de pedidos ainda não está ativo porque a rota de API foi removida e a tabela `public_storefronts` não existe.
- O fluxo de vitrine na branch de integração envia o pedido diretamente ao WhatsApp e informa que não armazena o pedido na Arcany.

## Autenticação e isolamento

- Supabase SSR está integrado por helpers separados para navegador e servidor.
- `/acesso` permite cadastro e login por e-mail/senha.
- O cadastro com sessão imediata e o callback de confirmação usam `ensureUserOrganization`, que consulta a associação, executa `public.bootstrap_organization` se necessário e confirma a associação.
- O middleware exige sessão nas rotas internas e mantém `/acesso`, `/auth/callback` e `/loja/:slug` públicas.
- O usuário ainda não concluiu o primeiro cadastro real. Testes de cadastro, confirmação de e-mail, login/logout e isolamento entre duas contas permanecem pendentes.
- Não armazenar nem solicitar senhas do usuário em conversas.

## Supabase Arcany

Projeto-alvo exclusivo: `kiwhtyuqgvcczwtafzcn`.

Migrações registradas no banco:
1. `20261107194126_initial_saas_schema`.
2. `20261107194405_restrict_function_execute_permissions`.
3. `20261107203829_harden_tenant_rls_and_index_foreign_keys`.

Estado confirmado:
- 15 tabelas no schema público, todas com RLS habilitado.
- Políticas de isolamento usam `private.is_org_member(organization_id)`.
- A função `public.bootstrap_organization(text)` exige usuário autenticado, impede associação duplicada no fluxo normal e tem `search_path` restrito a `pg_catalog`.
- `anon` não pode executar o bootstrap; `authenticated` pode, conforme necessário ao cadastro self-service.
- O índice único `organization_members_one_org_per_user_uidx` foi criado para impor uma organização por usuário.
- O hardening de privilégios foi aplicado no projeto Arcany: privilégios de tabelas para `anon` removidos; privilégios elevados de `authenticated` removidos; permissões CRUD mantidas para `authenticated`.
- Os privilégios padrão foram ajustados para objetos criados pela role `postgres`.
- Não foi possível alterar os privilégios padrão da role `supabase_admin` com a conexão disponível. Essa limitação permanece documentada.
- A auditoria Security ainda sinaliza `public.bootstrap_organization` por ser `SECURITY DEFINER` e executável por `authenticated`. A função é necessária ao cadastro; não retirar EXECUTE sem alternativa testada.
- O Health Advisor não apresentou findings na última verificação.
- Não há contas, organizações, associações, empresas ou leads reais cadastrados no banco.

## Empresas, leads e backup

- Empresas e leads são mantidos em chaves locais separadas pelo ID do usuário autenticado.
- Chaves antigas sem identificação de conta não são importadas automaticamente.
- Existe exportação JSON de backup local, sem upload ou exclusão de dados.
- Leads têm sincronização manual para o Supabase, com deduplicação básica e sem apagar o cache local.
- O módulo Empresas agora tem sincronização manual para o Supabase por organização. A rotina compara nome/telefone, envia somente registros ainda não encontrados e mantém todos os dados locais.
- A sincronização de empresas foi adicionada ao código, mas ainda precisa passar pelo GitHub Actions e por teste real com uma conta autenticada.
- Antes de qualquer migração em lote, gerar backup, validar organização, deduplicar e preservar o armazenamento local até a conferência final.

## Vitrines e pedidos

- O banco Arcany tem a tabela `store_orders`, mas não tem a tabela `public_storefronts`.
- A migração opcional `20261107210000_public_storefronts.sql` não foi aplicada.
- A página `/loja/:slug` consulta `public_storefronts`; portanto, a vitrine pública não pode ser considerada funcional até que a estrutura e as políticas necessárias sejam implementadas e testadas.
- A versão atual da vitrine na branch de integração prepara o pedido para WhatsApp e não o registra na Arcany.
- Não aplicar a migração opcional sem revisar as políticas de leitura pública, escrita e proteção dos dados dos pedidos.

## Segredos e configuração

- `.env.example` contém apenas variáveis públicas do Supabase e a variável de servidor `GOOGLE_PLACES_API_KEY` vazia.
- Não versionar arquivos de ambiente reais nem valores de chaves privadas.
- A chave Google Places deve permanecer somente no servidor.
- Não usar `SUPABASE_SERVICE_ROLE_KEY` no navegador. Qualquer uso futuro deve ficar em rota de servidor com validação explícita e escopo mínimo.

## Validação automatizada

No workflow GitHub Actions associado ao commit `50fb78a373aa2b70c44e24427093ba5c397ace37` (run #133):
- Auditoria de dependências: aprovada.
- Testes de bootstrap/associação: aprovados.
- Build de produção: aprovado.
- Lint: aprovado.

Essas verificações não substituem testes reais de autenticação, persistência, isolamento entre contas, fluxos comerciais e publicação.

## Vercel

- A consulta atual à equipe Vercel foi bloqueada por falta de autorização para o escopo `wchagas73-3735s-projects`.
- Foi gerado um link de autorização de acesso à equipe, válido por 10 minutos. Após a aprovação pelo titular, será possível consultar projetos, variáveis não secretas, deployments e logs.
- Não presumir que o deployment esteja atualizado ou pronto sem conferir o projeto correto e o commit publicado.

## Próximas etapas

1. Conferir a configuração de produção e o deployment Vercel.
2. Revisar a PR inteira e preservar os módulos que devem continuar disponíveis.
3. Implementar persistência de empresas na nuvem com backup e reconciliação não destrutiva.
4. Fortalecer e testar a sincronização de leads.
5. Revisar o fluxo de vitrine e pedidos antes de habilitar a migração opcional.
6. Após o primeiro cadastro real, testar confirmação de e-mail, login/logout e isolamento entre duas contas.
7. Só então declarar a Arcany pronta para receber assinantes em produção.

## Limites de segurança e escopo

- Não executar comandos no Supabase do Açougue Bom Jardim (`tbpxqtwlmpifuazmzihe`).
- O único Supabase autorizado para a Arcany é `kiwhtyuqgvcczwtafzcn`.
- Não apagar dados, não criar dados fictícios e não reaplicar a migração inicial.
- Não migrar dados locais sem backup verificável e plano de reconciliação.
