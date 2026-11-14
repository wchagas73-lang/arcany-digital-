# Arcany Digital: status real de implementação

Atualizado em 14/11/2026.

## Modelo do produto

A Arcany Digital é o workspace privado de uma única agência, operado pelo proprietário. Clientes e empresas prospectadas são registros de CRM e projetos, sem contas ou acesso administrativo à Arcany.

## Ambiente

- Repositório: `wchagas73-lang/arcany-digital-`.
- Branch de integração: `feat/supabase-auth-protection`.
- Branch principal: `main`.
- Supabase exclusivo da Arcany: `kiwhtyuqgvcczwtafzcn`.
- Projeto Vercel: `arcany-digital`, ID `prj_jDvLrke7SJOL5nVaw12jaWCvjQ11`.
- Não modificar o projeto Supabase do Açougue Bom Jardim (`tbpxqtwlmpifuazmzihe`).
- As alterações desta etapa permanecem na branch de integração e não foram mescladas em main nem publicadas em produção.

## Implementado na branch de integração

- Acesso por login, sem formulário público de cadastro.
- Middleware e callback verificam o e-mail proprietário configurado no servidor.
- Biblioteca inicial de modelos por nicho e tipo de solução.
- Briefing personalizado com instruções para não inventar informações comerciais.
- Cadastro de projetos na tabela `projects`, com briefing e configuração inicial.
- Página de administração com indicadores do banco, status do workspace e atalhos operacionais.
- Página de produção por projeto: acompanhamento de etapa, endereço de preview/publicação e dados confirmados do cliente.
- Upload de logo, fotos, vídeos MP4 e PDFs por projeto, com limite de 25 MB por arquivo.
- Arquivos em bucket privado `arcany-client-assets`, com políticas de acesso por organização.
- Tabela `project_assets` com RLS habilitado.
- RLS habilitado nas tabelas públicas já existentes; políticas de negócio usam associação à organização.
- Função pública de bootstrap de organização teve execução revogada para PUBLIC, anon e authenticated.
- Advisor de segurança do Supabase sem findings na verificação após a migração de arquivos.

## Limites ainda não resolvidos

- A conta proprietária `wchagas73@gmail.com` ainda não existe em `auth.users`. A consulta retornou zero usuários com esse e-mail.
- A organização interna e a associação owner ainda não foram provisionadas.
- Não há ferramenta administrativa de Auth disponível nesta integração para convidar/criar o usuário de forma segura. Não criar registros diretamente em `auth.users` por SQL.
- A configuração de signup público do Supabase Auth precisa ser conferida e desabilitada no painel do projeto. A interface não oferece cadastro, mas isso isoladamente não desativa a API pública de signup.
- Login real, CRUD com usuário autenticado e fluxo de recuperação de sessão ainda não foram testados.
- Empresas e leads ainda usam armazenamento local com sincronização manual em telas existentes. Não considerar sincronização entre dispositivos automática.
- A biblioteca de modelos é estática e versionada no Git.
- Upload de materiais e gestão de etapas do projeto estão implementados, mas ainda precisam de teste funcional com a conta proprietária.
- O editor visual completo, geração automática de aplicações/repositórios, provisionamento de hospedagem e publicação automática ainda não estão implementados.
- Registrar uma URL no projeto não publica o site. Publicação depende de gerar/validar a aplicação do cliente e implantar no provedor escolhido.
- Instagram, Google Business Profile, avaliações, Google Places e IA de análise ainda não estão integrados por completo.
- O fluxo público de loja e pedidos não está pronto; a tabela `public_storefronts` não existe e a rota antiga não deve ser tratada como produção.
- Não há dados de clientes, leads ou projetos fictícios criados no banco.

## Segurança

- O middleware usa `ARCANY_OWNER_EMAIL` no servidor e falha fechado quando não configurado.
- Não usar `SUPABASE_SERVICE_ROLE_KEY` no navegador.
- A tabela `project_assets` e o bucket privado usam autorização vinculada à organização.
- Arquivos aceitos: JPEG, PNG, WEBP, PDF e MP4.
- Não inserir dados diretamente em `auth.users`.
- Não habilitar signup público para este modelo de produto.
- Não mesclar a PR nem publicar em produção antes de validar autenticação, políticas, upload, persistência e rotas.

## Próximas verificações obrigatórias

1. Criar/invitar a conta proprietária pelo fluxo seguro do Supabase Auth.
2. Provisionar uma única organização interna e a associação owner por procedimento administrativo controlado.
3. Desabilitar signup público no painel Auth.
4. Entrar com a conta real e testar navegação, CRUD, upload, download e exclusão de arquivos.
5. Corrigir os fluxos de empresas e leads para persistência cloud-first, mantendo backup local.
6. Implementar editor/geração do projeto do cliente e pipeline de publicação.
7. Executar testes automatizados, validar preview e revisar o diff da PR.
8. Somente após aprovação técnica, mesclar e publicar.

## Regra de segurança operacional

Nenhuma etapa desta documentação autoriza modificar dados ou configurações do projeto do Açougue Bom Jardim. Não criar clientes fictícios, não apagar dados existentes e não publicar em produção sem validação.
