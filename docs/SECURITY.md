# Segurança da Arcany Digital

## Modelo de contas

- Cada assinante da Arcany é um profissional com sua própria conta e organização.
- Empresas prospectadas, leads, diagnósticos, propostas e projetos pertencem à organização do profissional.
- Os negócios prospectados não recebem contas Arcany por padrão.
- As políticas RLS usam a associação entre `auth.uid()` e `organization_members` para isolar registros.

## Banco de dados

- RLS está habilitado em todas as tabelas do schema `public`.
- O helper `private.is_org_member(uuid)` fica no schema privado, fora da API pública do PostgREST.
- O helper é `SECURITY DEFINER` para consultar a associação sem recursão de RLS; seu `search_path` é restrito e os objetos são referenciados por schema.
- `public.bootstrap_organization(text)` é a única função `SECURITY DEFINER` intencionalmente exposta como RPC autenticada. Ela precisa criar a primeira organização e associação do usuário, antes de existir uma linha de membership que permita inserções comuns. A execução é negada para `anon` e `public`; o corpo valida `auth.uid()` e impede que a mesma conta crie organizações adicionais.
- O aviso do Supabase sobre essa função é esperado enquanto o cadastro self-service estiver habilitado. Não conceder execução a usuários anônimos.
- Índices de chaves estrangeiras foram adicionados para apoiar filtros e joins.

## Cache local

- Os caches locais de empresas e leads usam chaves com o ID do usuário autenticado.
- Chaves antigas sem escopo não são importadas automaticamente, pois isso poderia misturar dados de contas diferentes em aparelhos compartilhados.
- O cache local não substitui a persistência multi-dispositivo no Supabase. A sincronização completa dos módulos ainda está no roadmap.

## Segredos e implantação

- Chaves públicas do Supabase podem usar variáveis `NEXT_PUBLIC_`.
- Chaves administrativas/service-role nunca devem ser expostas ao navegador ou versionadas no Git.
- A chave do Google Places deve permanecer no servidor.
- Configurar no Vercel as variáveis de ambiente e no Supabase Auth as URLs de retorno permitidas, incluindo `/auth/callback`.
- Antes de produção, testar confirmação de e-mail, login, logout, recuperação de acesso e isolamento com duas contas independentes.

## Migrações

As migrações versionadas refletem a sequência aplicada ao projeto Arcany. A migração opcional de páginas públicas é posterior ao helper privado e permanece separada; não é necessária para autenticação, prospecção ou CRM. Não aplicar migrações de storefront sem necessidade do módulo.
