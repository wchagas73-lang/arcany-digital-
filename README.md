# Arcany Digital

A Arcany Digital é o sistema interno de operação da agência digital do proprietário. Não é um SaaS para clientes finais nem uma plataforma de autoatendimento para outras agências.

Somente o proprietário deve acessar a Arcany. Empresas prospectadas e clientes contratantes são registros comerciais e projetos atendidos, não usuários da plataforma. O trabalho acontece dentro da Arcany: prospecção, diagnóstico, proposta, criação, publicação, entrega e histórico de serviços.

## Modelo operacional obrigatório

- Uma conta administrativa do proprietário, sem cadastro público ou convite de empresas/clientes.
- Empresas e contatos ficam na carteira comercial da Arcany, sem login próprio.
- Cada serviço contratado vira um projeto com briefing, escopo, etapas, arquivos, links, publicação e entrega.
- Estoque, financeiro, pedidos, e-commerce, cardápio e outros sistemas são modelos de soluções a serem configurados e entregues aos clientes, não módulos de ERP da própria agência.
- Manter histórico de clientes e serviços prestados, sem criar áreas de acesso para os clientes.
- A autenticação atual ainda possui fluxo de cadastro e a arquitetura de organizações precisa ser simplificada/restrita ao proprietário antes de ser considerada concluída.

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
