# Preparação do banco e autenticação da Arcany

A migração `supabase/migrations/202610310001_initial_saas_schema.sql` cria a estrutura multiempresa e políticas de segurança por organização. Ela **não cria um projeto Supabase nem ativa a conexão da aplicação por conta própria**.

## Ativação necessária

1. Crie um projeto no Supabase e guarde a senha do banco em local seguro.
2. Abra **SQL Editor** e execute o conteúdo da migração indicada acima.
3. Em **Project Settings → API**, copie a Project URL e a chave publicável/anon para as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Configure essas duas variáveis também no ambiente de produção da Vercel.
5. Configure `GOOGLE_PLACES_API_KEY` no servidor da Vercel. Nunca exponha essa chave no navegador.
6. Não coloque `SUPABASE_SERVICE_ROLE_KEY` em código de navegador, repositório ou mensagens. A aplicação deve usar RLS e a chave pública para operações normais.
7. Cadastre um usuário pelo Supabase Auth. Depois da autenticação, chame a função RPC `bootstrap_organization` uma vez para criar a organização inicial do usuário.

## Estrutura incluída

- Organizações e membros com papéis owner/admin/member.
- Empresas, leads, atividades e diagnósticos.
- Clientes, fornecedores, produtos e movimentações de estoque com lote/validade.
- Vendas, itens de venda e lançamentos financeiros.
- Projetos digitais e pedidos de lojas.
- RLS para restringir leitura e escrita aos dados da organização do usuário.

## Estado real

A migração prepara o banco e as regras de isolamento, mas os módulos atuais do frontend ainda possuem partes que usam armazenamento local. Não considere a plataforma multiusuário/produção até a aplicação conectar esses módulos ao Supabase, implementar autenticação e testar as políticas com usuários de organizações diferentes. A importação de XML de NF-e, pagamentos, publicação de lojas e WhatsApp oficial exigem fluxos e credenciais adicionais.
