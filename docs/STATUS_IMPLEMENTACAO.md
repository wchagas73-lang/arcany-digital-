# Status de implementação da Arcany Digital

Atualizado em 18/11/2026.

## Modelo do produto

A Arcany Digital é o workspace privado de uma única agência, operado pelo proprietário. Empresas e clientes são registros comerciais e projetos atendidos, não usuários da plataforma.

## Ambiente e proteção de produção

- Repositório: `wchagas73-lang/arcany-digital-`.
- Branch de integração: `feat/supabase-auth-protection`.
- PR: [#1, em rascunho](https://github.com/wchagas73-lang/arcany-digital-/pull/1).
- Commit validado pelo CI: `9534871ce6c87419c3718ab4d0af8758255f6640`.
- Supabase exclusivo da Arcany: `kiwhtyuqgvcczwtafzcn`.
- Produção atual mantida na Vercel; nenhuma alteração foi mesclada em `main`.
- O projeto Supabase do Açougue Bom Jardim não foi acessado nem alterado nesta revisão.

## Funcionalidades implementadas na branch

### Administração e produção
- Painel administrativo e navegação do workspace.
- Biblioteca de modelos por nicho e tipo de solução.
- Briefing e cadastro de projetos.
- Fluxo de produção, revisão, aprovação, publicação e entrega.
- Upload de logos, fotos, vídeos MP4 e PDFs em bucket privado, com limite de 25 MB.
- Editor de landing page e publicação em `/p/[slug]`.
- Mídias só são copiadas para o bucket público quando o proprietário as seleciona explicitamente para publicação.

### Autenticação e segurança
- Cliente Supabase no navegador e no servidor com `@supabase/ssr`.
- Middleware e callback com validação server-side do proprietário.
- Primeiro acesso restrito ao e-mail proprietário autorizado.
- Trigger de Auth cria/reutiliza a organização Arcany e associa o proprietário como `owner`.
- `public.bootstrap_organization(text)` não é chamado pelo cliente e tem EXECUTE revogado para `PUBLIC`, `anon` e `authenticated`.
- RLS habilitado nas 17 tabelas públicas.
- Advisor de segurança do Supabase retornou zero findings na consulta de 18/11/2026.
- Nenhuma chave service-role foi encontrada no cliente/browser.

### Empresas e leads
- Dados existentes permanecem no armazenamento local por conta, com chaves separadas.
- Há sincronização manual e aditiva para `companies` e `leads`.
- Backup JSON exporta chaves antigas e atuais sem enviar ou apagar dados.
- CRM ainda não migra automaticamente os dados locais para a nuvem.
- A migração definitiva dos registros locais ainda não foi executada.

## Estado real do Supabase Arcany em 18/11/2026

- Histórico: 9 migrações aplicadas.
- Tabelas públicas: 17.
- Tabelas públicas com RLS: 17.
- Usuários Auth: 0.
- Organizações: 0.
- Associações em `organization_members`: 0.
- Empresas: 0.
- Leads: 0.
- Advisor de segurança: zero findings.
- Advisor de performance: 29 avisos informativos de índices ainda não utilizados; não foi feita remoção automática.
- Buckets previstos: `arcany-client-assets` privado e `arcany-published-media` público somente para mídia aprovada.

A estrutura do banco e o trigger de provisionamento foram inspecionados. Ainda não há uma conta Auth real, portanto não foi possível validar login e provisionamento ponta a ponta.

## Validação automatizada

GitHub Actions, execução [44103426483](https://github.com/wchagas73-lang/arcany-digital-/actions/runs/44103426483), no commit `9534871ce6c87419c3718ab4d0af8758255f6640`, concluída com sucesso:

- Instalação de dependências e geração do lockfile.
- Auditoria de vulnerabilidades.
- Testes automatizados de provisionamento, proteção e laboratório.
- Build de produção.
- ESLint.

A aprovação do CI comprova que os testes e a compilação passaram. Não comprova login real, CRUD, upload, publicação ou isolamento funcional em navegador.

## Pendências para liberar a versão integrada

1. Configurar no ambiente de produção/preview `NEXT_PUBLIC_SUPABASE_URL`, chave publicável/anon e `ARCANY_OWNER_EMAIL`.
2. Conferir no Supabase Auth a URL base, redirect `/auth/callback` e a configuração global de signups.
3. Executar o primeiro acesso do proprietário e confirmar o e-mail.
4. Confirmar que o trigger criou exatamente uma organização e uma associação `owner`.
5. Testar login, renovação de sessão, logout e bloqueio de qualquer outro e-mail.
6. Testar CRUD de projetos, upload, download e exclusão de arquivos.
7. Testar publicação explícita, página pública em janela anônima, WhatsApp, imagens e responsividade.
8. Testar backup JSON em aparelho real.
9. Só depois reconciliar empresas e leads do armazenamento local com o banco, sem apagar a origem até conferir contagens e amostras.

A conta Auth ainda não existe. A senha deve ser criada pelo proprietário no formulário de primeiro acesso; não armazenar nem compartilhar credenciais no código ou no chat.

## Limites e cuidados de release

- O PR #1 permanece em rascunho e não deve ser mesclado até concluir os testes reais acima.
- A produção atual deve permanecer intacta enquanto a versão integrada não passar pelos testes.
- A Vercel retornou limite de 100 criações de deploy por dia e bloqueio temporário; não insistir em novos previews até a janela liberar.
- A branch de migração Cloudflare é separada e não faz parte desta liberação.
- Não aplicar novamente `initial_saas_schema`.
- Não aplicar migrações duplicadas de storefront/storage sem necessidade demonstrada e revisão específica.
- Não executar correções automáticas de dependências com `--force`.
