# Configuração e estado atual da Arcany Digital

## 1. Projeto Supabase autorizado

Este guia se refere exclusivamente ao projeto Supabase da Arcany Digital:

- Project ref: `kiwhtyuqgvcczwtafzcn`
- Não executar comandos deste guia em projetos de clientes.
- A migração inicial já está aplicada. **Não reaplicar** `initial_saas_schema`.

Histórico confirmado no banco:

1. `20261107194126_initial_saas_schema`
2. `20261107194405_restrict_function_execute_permissions`
3. `20261107203829_harden_tenant_rls_and_index_foreign_keys`
4. `20261114150346_revoke_public_workspace_bootstrap`
5. `20261114153048_project_assets_private_storage`
6. `20261114154420_project_publications_and_public_media`
7. `20261114154530_project_publications_policy_performance`
8. `20261114154604_project_publications_public_read_roles`
9. `20261114154710_owner_only_auth_signup_provisioning`

A consulta atual encontrou **17 tabelas públicas e RLS habilitado nas 17**. O advisor de segurança retornou zero findings. A verificação também encontrou zero usuários em `auth.users`, zero organizações, zero associações em `organization_members`, zero empresas e zero leads. Portanto, a estrutura está preparada, mas o primeiro acesso real ainda não foi executado.

### Migrações que não devem ser aplicadas agora

- `202610310002_public_storefronts.sql` é uma migração legada e não foi aplicada.
- `20261107210000_public_storefronts.sql` também não consta no histórico aplicado. A publicação atual usa `project_publications` e as rotas `/p/[slug]`; não há necessidade demonstrada para criar a tabela antiga `public_storefronts`.
- `20261114170000_project_assets_private_storage.sql` não consta no histórico aplicado e repete a criação da tabela/bucket de arquivos já coberta por `20261114153048_project_assets_private_storage`. Não aplicar sem reconciliação específica.

Não executar nenhuma dessas migrações como tentativa de corrigir cadastro, login, empresas ou leads.

## 2. Variáveis de ambiente

Configurar no ambiente de implantação:

- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Arcany.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: chave publicável recomendada. O código aceita também `NEXT_PUBLIC_SUPABASE_ANON_KEY` para compatibilidade.
- `ARCANY_OWNER_EMAIL`: e-mail autorizado para o middleware. Deve corresponder ao e-mail permitido pelo trigger de Auth no banco.
- `GOOGLE_PLACES_API_KEY`: opcional para prospecção; somente no servidor.

A chave publicável/anon pode estar no navegador. A proteção dos dados depende de Auth e RLS.

**Não configurar `SUPABASE_SERVICE_ROLE_KEY` para autenticação, empresas ou leads.** O fluxo atual não precisa dessa chave. Nunca colocar segredos em `NEXT_PUBLIC_`, no cliente ou no GitHub.

## 3. Cadastro, login e associação organizacional

O modelo atual é um **workspace privado de uma única agência**, operado pelo proprietário. Clientes e empresas prospectadas não recebem contas na Arcany.

Fluxo efetivo:

1. A tela de primeiro acesso chama `supabase.auth.signUp` para a conta proprietária autorizada.
2. O cadastro **não chama** `public.bootstrap_organization`.
3. Um trigger `AFTER INSERT ON auth.users` executa `private.arcany_owner_signup_provision()`. A função é `SECURITY DEFINER`, usa `search_path` vazio e aceita somente o e-mail proprietário configurado no código/migração.
4. O trigger cria ou reutiliza a organização `Arcany Digital` e insere a associação do usuário em `organization_members` com papel `owner`.
5. Se houver confirmação de e-mail, `/auth/callback` troca o código por sessão e valida novamente a identidade.
6. O middleware usa cookies Supabase, exige sessão válida e confere `ARCANY_OWNER_EMAIL` antes de liberar as rotas privadas.

A função antiga `public.bootstrap_organization(text)` teve EXECUTE revogado para `PUBLIC`, `anon` e `authenticated`; no estado atual, ela não é o caminho de provisionamento do navegador. Não reabrir essa permissão.

A associação foi confirmada por inspeção do trigger e da função, mas **não foi validada por cadastro real**: ainda existem zero usuários e zero organizações. Não declarar o login concluído antes do primeiro acesso e da confirmação do e-mail.

No Supabase Auth, revisar a configuração global de signups e cadastrar a URL base do ambiente e o redirect terminado em `/auth/callback`. O trigger bloqueia e-mails diferentes do proprietário, mas isso não substitui a revisão das configurações do Auth.

## 4. RLS e arquivos

- Todas as 17 tabelas públicas estão com RLS habilitado.
- As tabelas privadas de negócio usam políticas baseadas em `private.is_org_member(organization_id)`.
- `organization_members` permite ao usuário consultar sua própria associação; a criação inicial é feita pelo trigger privilegiado.
- `project_publications` permite leitura anônima somente de registros com `published = true`.
- O bucket `arcany-client-assets` está privado, com limite de 25 MB.
- O bucket `arcany-published-media` é público para servir somente mídias selecionadas para páginas publicadas.

A revisão estática das políticas e o advisor não substituem um teste funcional autenticado. Como o modelo atual é de um único proprietário, não há teste de duas contas independentes executado nesta etapa.

## 5. Empresas e leads: estado e caminho de migração

- **Empresas:** ainda são cadastradas no armazenamento local; há sincronização manual aditiva para `public.companies`.
- **Leads:** ainda são cadastrados no armazenamento local; há sincronização manual aditiva para `public.leads`.
- As chaves locais atuais são separadas pelo ID do usuário autenticado.
- O botão **Backup JSON** exporta as chaves legadas conhecidas e as chaves da conta atual. O arquivo é criado no aparelho, sem upload e sem apagar dados.
- Chaves antigas sem ID de usuário não são importadas automaticamente, para evitar misturar dados de aparelhos compartilhados.
- O CRM não importa automaticamente leads locais quando a nuvem está vazia.

Antes de tornar o banco a fonte principal:

1. Criar e confirmar o primeiro acesso do proprietário.
2. Gerar e guardar o backup JSON no aparelho.
3. Conferir manualmente a origem dos dados das chaves antigas.
4. Executar a sincronização manual de empresas e leads, que mantém os registros locais.
5. Implementar reconciliação com contagem de inseridos, ignorados e conflitos.
6. Comparar os dados da nuvem com o backup.
7. Só depois de conferência, teste e aprovação, alterar a fonte principal. Não apagar o `localStorage` nesta fase.

## 6. Critérios de conclusão

- [x] Build de produção, testes automatizados, lint e auditoria de dependências aprovados no commit de integração `2077fc061450c97558874a1f29bf14cc7414c701`.
- [x] Middleware e callback com validação server-side do proprietário.
- [x] Trigger de provisionamento e permissões de bootstrap revisados no projeto Arcany.
- [x] RLS habilitado nas 17 tabelas públicas.
- [ ] Criar a conta proprietária e confirmar o e-mail.
- [ ] Validar login, renovação de sessão e logout em navegador.
- [ ] Testar CRUD, upload, download, exclusão e publicação com a conta real.
- [ ] Testar o backup JSON em aparelho real.
- [ ] Concluir a migração/reconciliação de empresas e leads sem apagar o cache local.

Até concluir os itens pendentes, a integração permanece em validação e não deve ser considerada pronta para produção.
