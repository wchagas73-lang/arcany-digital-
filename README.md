# Arcany Digital

A Arcany Digital é o workspace privado de operação de uma agência digital, usado pelo proprietário para prospectar empresas, organizar oportunidades, preparar propostas, produzir soluções digitais e acompanhar entregas.

Empresas prospectadas e clientes contratantes são registros comerciais e projetos atendidos. Eles não recebem contas nem acesso administrativo à Arcany.

## Modelo operacional

- Uma conta administrativa do proprietário.
- Cadastro de empresas, contatos e leads na carteira comercial.
- Diagnóstico de presença digital, preparação de propostas e acompanhamento de negociações.
- Projetos com briefing, escopo, etapas, arquivos, links, publicação e entrega.
- Modelos de sites, catálogos, cardápios, lojas e sistemas operacionais para acelerar a produção.
- Sem autoatendimento ou login de clientes finais nesta arquitetura.

## Segurança e dados

O workspace usa Supabase Auth, PostgreSQL, Row Level Security (RLS), middleware e callback com validação server-side do proprietário. O banco provisiona a organização Arcany por um trigger restrito no cadastro da conta autorizada.

A aplicação não chama `public.bootstrap_organization` no navegador. A função antiga está bloqueada para `PUBLIC`, `anon` e `authenticated`.

Chaves privilegiadas nunca devem ser colocadas em variáveis `NEXT_PUBLIC_`, no navegador ou no repositório. O fluxo atual não requer `SUPABASE_SERVICE_ROLE_KEY`.

## Tecnologias

- Next.js 15 (App Router)
- React 19 e TypeScript
- Supabase Auth, PostgreSQL e RLS
- `@supabase/ssr` para sessão por cookies
- Tailwind CSS e Lucide React
- Google Places API opcional para prospecção, com chave somente no servidor

## Configuração

Configure no ambiente de implantação:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ou `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ARCANY_OWNER_EMAIL`
- `GOOGLE_PLACES_API_KEY`, se a prospecção real via Google Places for utilizada

A chave publicável/anon é própria para o cliente. As políticas RLS continuam obrigatórias.

## Desenvolvimento

Requer Node.js 22 ou superior.

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Validação

O GitHub Actions executa auditoria de dependências, testes automatizados, build de produção e lint. A conclusão do CI não substitui o teste real do primeiro acesso, confirmação de e-mail, login, operações com arquivos e publicação.

## Banco de dados

Consulte [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) para o histórico aplicado, variáveis, regras de segurança e migrações que não devem ser executadas sem revisão.

Consulte [docs/ROADMAP.md](docs/ROADMAP.md) para o plano de evolução.
