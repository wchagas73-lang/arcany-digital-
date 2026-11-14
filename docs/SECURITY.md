# Segurança da Arcany Digital

## Modelo de acesso

- A Arcany é um workspace privado de uma única agência, operado pelo proprietário.
- Clientes e empresas são registros de CRM e projetos. Eles não recebem contas na Arcany.
- As rotas internas exigem sessão Supabase e validação server-side do e-mail em \`ARCANY_OWNER_EMAIL\`.
- O middleware e o callback encerram sessões de contas que não correspondem ao proprietário autorizado.
- A tela de acesso oferece login e primeiro acesso apenas para \`wchagas73@gmail.com\`.

## Primeiro acesso e Auth

- O primeiro acesso usa Supabase Auth \`signUp\`, sem enviar senha para terceiros.
- Um trigger em \`auth.users\` chama \`private.arcany_owner_signup_provision()\`.
- A função é \`SECURITY DEFINER\`, usa \`search_path\` vazio e fica no schema privado.
- O trigger rejeita qualquer e-mail diferente de \`wchagas73@gmail.com\`.
- Para o e-mail autorizado, cria ou reutiliza a organização interna \`Arcany Digital\` e associa o usuário como \`owner\`.
- A função não concede EXECUTE a \`PUBLIC\`, \`anon\` ou \`authenticated\`; ela só é executada pelo trigger.
- \`public.bootstrap_organization(text)\` teve EXECUTE revogado para \`PUBLIC\`, \`anon\` e \`authenticated\`.
- A opção global de signups do Supabase Auth ainda precisa ser revisada no painel depois de concluir o primeiro acesso. O trigger já rejeita outros e-mails, mas isso não substitui a configuração global.

## Banco e isolamento

- RLS está habilitado nas tabelas públicas de negócio e nas tabelas de projetos e publicações.
- As políticas de negócio validam \`private.is_org_member(organization_id)\` em leitura e escrita.
- Não usar \`user_metadata\` como fonte de autorização.
- Chaves administrativas/service-role nunca devem ser expostas no navegador ou versionadas.
- O bucket \`arcany-client-assets\` é privado. Upload, leitura e exclusão exigem associação à organização.
- O bucket \`arcany-published-media\` é público somente para servir imagens escolhidas para páginas publicadas. Upload e alteração continuam restritos a membros da organização.
- A tabela \`project_publications\` permite leitura anônima somente quando \`published = true\`; leitura autenticada também respeita publicação ou associação à organização.

## Publicação de landing pages

- O conteúdo público é salvo em \`project_publications\`.
- As páginas públicas usam a rota \`/p/[slug]\`.
- Imagens anexadas ao projeto ficam privadas até a ação explícita de publicar; nessa ação, imagens são copiadas para o bucket público de mídia.
- Não publicar fotos, avaliações, dados pessoais ou informações comerciais sem autorização do cliente.
- A página pública não processa pagamentos. O CTA direciona para o WhatsApp informado pelo proprietário.

## Limites e verificações

- A conta real do proprietário, login, recuperação de sessão e CRUD ainda precisam ser testados no navegador após o primeiro acesso.
- A lista de URLs de redirecionamento do Supabase Auth deve incluir a origem usada pela Arcany e \`/auth/callback\`, caso a confirmação de e-mail esteja ativa.
- Não inserir dados diretamente em \`auth.users\` por SQL.
- Não modificar o Supabase do Açougue Bom Jardim.
- Não publicar o código da Arcany em produção sem validar o preview e o fluxo real do proprietário.
