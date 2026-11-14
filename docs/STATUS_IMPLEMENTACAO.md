# Status de implementação da Arcany Digital

## Modelo do produto

A Arcany Digital é o workspace privado de uma única agência, operado pelo proprietário. Clientes e empresas prospectadas são registros comerciais e projetos, sem contas ou acesso administrativo à Arcany.

## Ambiente

- Repositório: \`wchagas73-lang/arcany-digital-\`.
- Branch de integração: \`feat/supabase-auth-protection\`.
- Branch principal: \`main\`.
- Supabase exclusivo da Arcany: \`kiwhtyuqgvcczwtafzcn\`.
- Projeto Vercel: \`arcany-digital\`, ID \`prj_jDvLrke7SJOL5nVaw12jaWCvjQ11\`.
- Não modificar o Supabase do Açougue Bom Jardim (\`tbpxqtwlmpifuazmzihe\`).
- As alterações permanecem na branch de integração. Não foram mescladas em \`main\` nem publicadas em produção.

## Implementado na branch

### Administrativo e comercial
- Painel de administração com indicadores reais do banco e status de conexão/workspace.
- Biblioteca de modelos por nicho e tipo de solução.
- Briefing personalizado, com campos para identidade visual, materiais, regras e integrações.
- Cadastro e listagem de projetos no workspace.
- CRM e módulos comerciais existentes; empresas e leads ainda têm partes locais e sincronização manual, portanto não são cloud-first em todos os fluxos.

### Produção e entrega
- Página de produção por projeto com etapas: planejamento, produção, revisão, aprovado, publicado, entregue e pausado.
- Upload e gerenciamento de logos, fotos, vídeos MP4 e PDFs por projeto, limite de 25 MB.
- Bucket privado \`arcany-client-assets\` e tabela \`project_assets\`, com RLS e políticas por organização.
- Editor de landing page por projeto, com nome, título, descrição, cidade, WhatsApp, Instagram, link do Google, cor, serviços e endereço público.
- Prévia de conteúdo no editor.
- Publicação em rota compartilhável \`/p/[slug]\`.
- Imagens privadas do projeto são copiadas para \`arcany-published-media\` somente quando o proprietário publica.
- Conteúdo publicado é lido publicamente apenas quando \`published = true\`.
- O link público fica registrado no projeto.

### Segurança
- Middleware e callback validam o e-mail proprietário no servidor.
- O primeiro acesso é restrito ao e-mail \`wchagas73@gmail.com\`.
- Trigger de Auth cria/reutiliza a organização interna e a associação owner somente para o e-mail permitido; qualquer outro e-mail é rejeitado.
- \`public.bootstrap_organization(text)\` está com EXECUTE revogado para \`PUBLIC\`, \`anon\` e \`authenticated\`.
- Advisor de segurança Supabase sem findings na última consulta.
- Nenhum cliente, lead ou projeto fictício foi criado.

## Pendências reais

- A conta proprietária ainda não existe no Supabase Auth e a organização ainda não foi criada. O novo fluxo de primeiro acesso está preparado para criar ambos após confirmação do e-mail.
- A lista de URLs permitidas no Supabase Auth precisa aceitar a origem da Arcany e \`/auth/callback\`, se confirmação de e-mail estiver ativa.
- A configuração global de signups do Supabase Auth ainda precisa ser conferida no painel. O trigger do banco já bloqueia qualquer e-mail diferente do proprietário.
- Login real, CRUD de projeto, upload/download/exclusão de arquivos e publicação real ainda precisam ser testados com a conta proprietária.
- A geração automática por IA de aplicações e repositórios não está integrada. O editor atual produz uma landing page configurável e publicável, mas não é um editor visual drag-and-drop nem um gerador IA.
- O domínio público usa a hospedagem da Arcany. Domínio próprio do cliente e implantação em Cloudflare Pages ainda não são automáticos.
- Instagram, Google Business Profile, avaliações e análise automática de presença digital ainda não estão totalmente integrados.
- \`GOOGLE_PLACES_API_KEY\` está cadastrado na Vercel, mas vazio; a descoberta via Google Places não está operacional até configurar uma chave válida e habilitar APIs/billing no Google Cloud.
- Empresas e leads ainda dependem de sincronização manual em algumas telas.
- A rota antiga \`/loja/[slug]\` não deve ser tratada como publicação de produção; a tabela \`public_storefronts\` não existe.
- Build e validação automatizada do commit final ainda precisam terminar. O PR permanece em rascunho e não foi mesclado.

## Próximos passos de validação

1. Abrir o primeiro acesso, criar a senha e confirmar o e-mail proprietário.
2. Entrar no workspace e verificar se a organização foi provisionada automaticamente.
3. Testar criar projeto, anexar arquivos, montar landing page, salvar e publicar.
4. Abrir a página pública em janela anônima e validar WhatsApp, imagens e responsividade.
5. Concluir os testes automatizados e revisar os logs do preview.
6. Só então considerar a Arcany pronta para uso operacional do primeiro cliente.
