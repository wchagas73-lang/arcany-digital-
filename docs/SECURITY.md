# Segurança da Arcany Digital

## Modelo de contas

- Cada assinante da Arcany é um profissional com sua própria conta e organização.
- Empresas prospectadas, leads, diagnósticos, propostas e projetos pertencem à organização do profissional.
- Os negócios prospectados não recebem contas Arcany por padrão.
- As políticas RLS usam a associação entre `auth.uid()` e `organization_members` para isolar registros.
- O fluxo atual da aplicação assume uma organização por usuário; a associação única precisa ser garantida também no banco.

## Banco de dados

- RLS está habilitado nas 15 tabelas públicas da estrutura SaaS aplicada.
- As políticas atuais de dados de negócio permitem operações apenas a `authenticated` e verificam `private.is_org_member(organization_id)` tanto em `USING` quanto em `WITH CHECK`.
- `private.is_org_member(uuid)` fica no schema privado, fora da API pública do PostgREST. O helper é `SECURITY DEFINER`, usa `search_path` restrito e referencia objetos com schema explícito.
- `public.bootstrap_organization(text)` é a função `SECURITY DEFINER` intencionalmente exposta como RPC autenticada. Ela cria a primeira organização e associação, valida `auth.uid()` e impede novas organizações quando já existe associação. A execução é negada para `anon` e `public`.
- O aviso do Supabase sobre `bootstrap_organization` ser executável por usuários autenticados é esperado enquanto o cadastro self-service estiver habilitado. Não conceder execução a usuários anônimos.
- Índices de chaves estrangeiras foram adicionados para apoiar filtros e joins.

### Auditoria de privilégios — 08/11/2026; rechecagem em 10/11/2026

A inspeção do ACL do banco Arcany encontrou privilégios padrão excessivos nas tabelas públicas: `anon` recebeu SELECT/INSERT/UPDATE/DELETE e também TRUNCATE; `authenticated` também recebeu TRUNCATE, REFERENCES e TRIGGER. As políticas RLS atuais não têm políticas para `anon`, então as operações comuns por linha permanecem bloqueadas para esse papel; porém, RLS não protege contra TRUNCATE. Os privilégios são desnecessários para as tabelas privadas do SaaS e os privilégios padrão também os propagariam para novas tabelas.

A rechecagem confirmou que não há sequências públicas atualmente, mas os privilégios padrão também concederiam acesso a `anon` e `authenticated` em sequências futuras. O script preparado agora restringe esses privilégios futuros, preservando `USAGE/SELECT` para o papel autenticado quando uma tabela usar uma sequência.

Há ainda uma diferença entre o modelo da aplicação e a chave primária atual de `organization_members`: o código espera uma organização por usuário, mas a chave primária composta permite mais de uma associação. Isso também deixa uma janela de concorrência no primeiro cadastro.

Foi preparado o script `docs/sql/20261108_tenant_privilege_hardening.sql` para:
- remover privilégios de tabela e sequência de `anon`;
- limitar `authenticated` a SELECT/INSERT/UPDATE/DELETE em tabelas, sempre sujeitos às políticas RLS, e a USAGE/SELECT em sequências;
- endurecer os privilégios padrão de tabelas, sequências e funções para os criadores de objetos;
- impor uma associação organizacional por usuário e fechar a corrida entre chamadas simultâneas de bootstrap.

**Esse script ainda não foi aplicado ao Supabase.** Não migrar empresas/leads nem habilitar persistência em nuvem até essa revisão e aplicação controlada no projeto Arcany.

## Cache local

- Os caches locais de empresas e leads usam chaves com o ID do usuário autenticado.
- Chaves antigas sem escopo não são importadas automaticamente: isso evita expor dados de uma conta a outra em aparelhos compartilhados.
- O cache local não substitui a persistência multi-dispositivo no Supabase. A sincronização completa dos módulos ainda está no roadmap.
- O CRM não importa mais leads locais automaticamente quando a tabela remota está vazia. A carga para a nuvem deve ser iniciada explicitamente na tela Leads, após exportação CSV e validação de autenticação/RLS.
- A sincronização manual atual não apaga o cache local; ela ainda é parcial e não substitui um processo de backup/exportação JSON e migração idempotente. Não apagar nem substituir o cache local durante a migração.

## Segredos e implantação

- Chaves públicas do Supabase podem usar variáveis `NEXT_PUBLIC_`.
- Chaves administrativas/service-role nunca devem ser expostas ao navegador ou versionadas no Git.
- A chave do Google Places permanece em variável de servidor (`GOOGLE_PLACES_API_KEY`), sem prefixo `NEXT_PUBLIC_`.
- O repositório contém apenas o modelo `.env.example`; arquivos `.env` e `.env.local` estão no `.gitignore`.
- Configurar na Vercel as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ou a chave anon legada) e no Supabase Auth as URLs de retorno permitidas, incluindo `/auth/callback`.
- Antes de produção, testar confirmação de e-mail, login, logout, recuperação de acesso e isolamento com duas contas independentes. Esses testes reais ainda não foram concluídos.

## Migrações

As migrações aplicadas no banco Arcany são a estrutura inicial, a restrição de permissões das funções e o endurecimento de RLS/índices. A migração opcional de páginas públicas permanece não aplicada e não é necessária para autenticação, prospecção ou CRM. Não aplicar migrações de storefront sem necessidade demonstrada e autorização específica.
