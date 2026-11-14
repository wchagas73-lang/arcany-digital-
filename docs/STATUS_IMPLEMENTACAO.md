# Status de implementação da Arcany Digital

Atualizado em 14/11/2026.

## Modelo do produto

A Arcany Digital é o workspace privado de uma única agência, operado pelo proprietário. Empresas e clientes são registros comerciais e projetos atendidos, não usuários da plataforma.

## Ambiente

- Repositório: `wchagas73-lang/arcany-digital-`.
- Branch de integração: `feat/supabase-auth-protection`.
- PR: [#1, em rascunho](https://github.com/wchagas73-lang/arcany-digital-/pull/1).
- Commit de aplicação validado: `2077fc061450c97558874a1f29bf14cc7414c701`.
- Supabase exclusivo da Arcany: `kiwhtyuqgvcczwtafzcn`.
- As alterações continuam na branch de integração; não foram mescladas em `main` nem publicadas em produção.
- O Supabase do Açougue Bom Jardim não foi acessado nem alterado.

## Implementado na branch

### Administração, comercial e produção

- Painel administrativo e navegação do workspace.
- Biblioteca de modelos por nicho e tipo de solução.
- Briefing e cadastro de projetos.
- Fluxo de produção, revisão, aprovação, publicação e entrega.
- Upload de logos, fotos, vídeos MP4 e PDFs em bucket privado, com limite de 25 MB.
- Editor de landing page e publicação em `/p/[slug]`.
- Mídias só são copiadas para o bucket público quando o proprietário publica explicitamente.

### Autenticação e segurança

- Cliente Supabase no navegador e no servidor com `@supabase/ssr`.
- Middleware e callback com validação server-side do proprietário.
- Primeiro acesso restrito ao e-mail proprietário autorizado.
- Trigger de Auth cria/reutiliza a organização Arcany e associa o proprietário como `owner`.
- `public.bootstrap_organization(text)` não é chamado pelo cliente e tem EXECUTE revogado para `PUBLIC`, `anon` e `authenticated`.
- RLS habilitado em todas as 17 tabelas públicas.
- Advisor de segurança do projeto Arcany retornou zero findings na última consulta.
- A chave service-role não aparece na configuração pública do projeto nem nos resultados de busca do código do branch.

### Empresas e leads

- Permanecem no armazenamento local por conta, com chaves separadas por usuário.
- Há sincronização manual e aditiva para as tabelas `companies` e `leads`.
- O botão Backup JSON exporta chaves antigas e atuais sem enviar ou apagar dados.
- O CRM não migra automaticamente dados locais para a nuvem.
- A migração definitiva ainda não foi executada.

## Estado confirmado no Supabase Arcany

Histórico: 9 migrações aplicadas, incluindo schema inicial, endurecimento de privilégios/RLS, arquivos privados, publicações e provisionamento restrito do proprietário.

- Tabelas públicas: 17.
- Tabelas com RLS: 17.
- Usuários Auth: 0.
- Organizações: 0.
- Associações em `organization_members`: 0.
- Empresas: 0.
- Leads: 0.
- Advisor de segurança: zero findings.
- Bucket `arcany-client-assets`: privado.
- Bucket `arcany-published-media`: público para mídias aprovadas.

A estrutura e o trigger foram inspecionados, mas ainda não existe uma conta real para validar o fluxo de ponta a ponta.

## Validação automatizada

No GitHub Actions, execução do commit `2077fc061450c97558874a1f29bf14cc7414c701` concluída com sucesso:

- Instalação de dependências e geração do lockfile.
- Auditoria de vulnerabilidades.
- Testes automatizados de provisionamento, proteção e laboratório.
- Build de produção.
- ESLint.

A aprovação do CI não comprova login real, upload, publicação ou isolamento funcional em navegador.

## Pendências e próximo passo

1. Configurar no ambiente de implantação `NEXT_PUBLIC_SUPABASE_URL`, chave publicável/anon e `ARCANY_OWNER_EMAIL`.
2. Conferir no Supabase Auth a URL base, redirect `/auth/callback` e a configuração global de signups.
3. Executar o primeiro acesso do proprietário e confirmar o e-mail.
4. Confirmar que o trigger criou exatamente uma organização e uma associação `owner`.
5. Testar login, sessão, logout, CRUD de projetos, upload/download/exclusão e publicação.
6. Testar o backup JSON em aparelho real.
7. Só então concluir a reconciliação de empresas e leads, preservando `localStorage`.

A conta Auth ainda não existe. Essa etapa depende do primeiro acesso e da confirmação de e-mail pelo proprietário. Não criar senha nem simular uma conta em nome do usuário.

## Migrações não autorizadas

Não aplicar novamente `initial_saas_schema`. Não aplicar `202610310002_public_storefronts.sql`, `20261107210000_public_storefronts.sql` ou a migração duplicada `20261114170000_project_assets_private_storage.sql` sem necessidade demonstrada e autorização específica.
