# Arcany Digital

A Arcany Digital é uma plataforma SaaS para profissionais e empreendedores que prospectam empresas e desenvolvem soluções digitais sob medida.

O assinante da Arcany é o profissional que presta serviços digitais. As empresas prospectadas são clientes desse profissional: elas recebem sites, catálogos, lojas, automações ou sistemas desenvolvidos, mas não precisam criar conta na Arcany para operar o próprio negócio.

## O que a plataforma organiza

- Prospecção de empresas por cidade, estado e segmento.
- Cadastro de empresas, leads e contatos.
- Diagnóstico de presença digital e oportunidades.
- Preparação de abordagens comerciais e propostas.
- CRM, etapas de negociação e acompanhamentos.
- Briefings, projetos, demonstrações e entregas digitais.
- Evolução futura para manutenção, suporte e relacionamento pós-entrega.

## Isolamento entre assinantes

Cada profissional possui sua própria conta e organização. Empresas prospectadas, contatos, diagnósticos, propostas e projetos devem ficar isolados por organização. Um assinante não pode consultar os dados de outro.

O banco usa Supabase Auth, PostgreSQL e Row Level Security (RLS). As rotas privadas exigem sessão válida. As chaves privilegiadas nunca devem ser colocadas em variáveis `NEXT_PUBLIC_` ou no navegador.

## Tecnologias

- Next.js 15 (App Router)
- React 19
- TypeScript
- Supabase Auth, PostgreSQL e RLS
- Tailwind CSS
- Lucide React
- Google Places API para pesquisa de negócios, com chave somente no servidor

## Configuração

Configure no ambiente de implantação:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (preferencial) ou `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GOOGLE_PLACES_API_KEY` (para prospecção pelo Google Places)

`SUPABASE_SERVICE_ROLE_KEY` só deve existir no servidor quando houver uma necessidade administrativa comprovada. A aplicação não deve expor essa chave ao cliente.

No Supabase Auth, configure a URL do site e permita os endereços de retorno usados pelo ambiente publicado, incluindo `/auth/callback`.

## Desenvolvimento

Requer Node.js 22 ou superior.

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Validação

O GitHub Actions executa auditoria de dependências, build de produção e lint. A conclusão da compilação não substitui o teste real de cadastro, confirmação de e-mail, login, isolamento entre organizações e publicação na Vercel.

## Banco de dados

As migrações ficam em `supabase/migrations`. Não remova tabelas antigas apenas por estarem sem registros: primeiro confirme dependências, dados e referências no código. As tabelas operacionais que eventualmente forem usadas nas soluções entregues aos clientes não transformam a Arcany em um ERP de lojistas.

Consulte [docs/ROADMAP.md](docs/ROADMAP.md) para o plano de evolução.
