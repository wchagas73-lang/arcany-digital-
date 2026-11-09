# Arcany Digital — status de implementação

Atualizado em 09/11/2026.

## Repositório e autenticação

- Supabase SSR está integrado por helpers separados para navegador e servidor.
- A tela `/acesso` permite cadastro e login por e-mail/senha.
- No cadastro com sessão imediata, a aplicação consulta `organization_members` e chama `public.bootstrap_organization` quando ainda não há associação.
- Quando a confirmação de e-mail está ativa, `/auth/callback` troca o código por sessão, valida o usuário, consulta a associação e chama o bootstrap se necessário.
- No login, uma conta sem associação também tenta criar a primeira organização.
- O middleware exige sessão nas rotas internas e mantém `/acesso`, `/auth/callback` e `/loja/:slug` públicas.
- Os testes reais de cadastro, confirmação de e-mail, login/logout, recuperação de senha e isolamento entre duas contas ainda não foram concluídos.

## Supabase Arcany

Projeto-alvo exclusivo: `kiwhtyuqgvcczwtafzcn`.

Migrações registradas no banco:
1. `20261107194126_initial_saas_schema` — aplicada uma vez.
2. `20261107194405_restrict_function_execute_permissions` — aplicada.
3. `20261107203829_harden_tenant_rls_and_index_foreign_keys` — aplicada.

Estado verificado:
- 15 tabelas no schema público; RLS habilitado nas 15.
- Políticas de isolamento das tabelas de negócio usam `private.is_org_member(organization_id)`.
- `anon` não pode executar `public.bootstrap_organization(text)`; `authenticated` pode, conforme necessário ao cadastro self-service.
- Contagens atuais: 0 organizações, 0 associações, 0 empresas e 0 leads.
- A chave primária de `organization_members` ainda permite tecnicamente mais de uma organização por usuário. O índice único por `user_id` está preparado no script de hardening, mas ainda não foi aplicado.

### Pendência de privilégios

A auditoria SQL confirmou privilégios de tabela excessivos em `anon`, incluindo `TRUNCATE`, e em `authenticated`, incluindo `TRUNCATE`, `REFERENCES` e `TRIGGER`. RLS não protege contra `TRUNCATE`.

O script `docs/sql/20261108_tenant_privilege_hardening.sql` foi preparado e revisado, mas não aplicado. A aplicação no banco deve aguardar revisão/aprovação da etapa de DDL e validação do ambiente. Não executar novamente a migração inicial.

A migração opcional `20261107210000_public_storefronts.sql` permanece não aplicada; não é necessária para a autenticação ou para a migração de empresas/leads nesta fase.

## Empresas, leads e backup

- Empresas e leads continuam armazenados localmente, em chaves namespaced pelo ID do usuário autenticado.
- Chaves locais antigas sem escopo de usuário não são importadas automaticamente, para evitar misturar dados em dispositivos compartilhados.
- A tela Leads oferece exportação CSV e sincronização manual parcial; a sincronização não remove o cache local.
- O CRM foi ajustado para não importar automaticamente os leads locais quando a tabela remota está vazia.
- Empresas ainda não foram migradas para o banco.
- Não iniciar a migração completa até corrigir privilégios, impor associação única, testar autenticação e isolamento RLS com duas contas reais e preparar backup/reconciliação idempotente.

## Segredos e configuração

- A árvore atual do repositório contém apenas `.env.example`, sem arquivos de ambiente reais.
- `.gitignore` agora ignora `.env*`, com exceção explícita de `.env.example`.
- Os helpers de navegador usam somente URL e chave publicável/anon do Supabase.
- `GOOGLE_PLACES_API_KEY` é lida em rotas de servidor, sem prefixo `NEXT_PUBLIC_`.
- `SUPABASE_SERVICE_ROLE_KEY` aparece apenas como nome de variável vazio/documentado no exemplo de ambiente; não deve ser configurada no cliente nem versionada com valor.

## Validação

- No commit atual `0192810`, o GitHub Actions concluiu `npm audit` com 0 vulnerabilidades, `npm run build` aprovado e `npm run lint` aprovado. Resta um aviso não bloqueante sobre `<img>` em `src/app/solucoes/page.tsx`.
- O deploy de preview do projeto Vercel `arcany-digital` (sem hífen) está concluído e marcado como Ready: `https://arcany-digital-c0nelbq2w-wchagas73-3735s-projects.vercel.app`.
- O projeto Vercel separado `arcany-digital-` (com hífen) falhou por limite diário de implantações. Não confundir os dois projetos.
- A compilação não substitui testes reais de autenticação, associação e isolamento multi-tenant.
