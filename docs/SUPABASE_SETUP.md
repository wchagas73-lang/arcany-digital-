# Ativação do banco e publicação da Arcany Digital

As migrações criam o esquema do banco, mas precisam ser executadas no projeto Supabase. A aplicação não consegue aplicar SQL na sua conta automaticamente.

## 1. Executar as migrações

No Supabase, abra **SQL Editor → New query** e execute, nesta ordem:

1. `supabase/migrations/202610310001_initial_saas_schema.sql`
2. `supabase/migrations/202610310002_public_storefronts.sql`

A primeira cria organizações, membros, leads, CRM, produtos, estoque, vendas, financeiro e projetos. A segunda cria páginas públicas de lojas/cardápios e a política que permite ler apenas vitrines publicadas.

## 2. Variáveis da Vercel

Em **Project → Settings → Environment Variables**, configure:

- `NEXT_PUBLIC_SUPABASE_URL`: Project URL do Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: chave publicável (ou anon legada).
- `SUPABASE_SERVICE_ROLE_KEY`: chave secreta do Supabase, somente no servidor, necessária para gravar pedidos públicos. Nunca use prefixo NEXT_PUBLIC, nunca coloque em código, GitHub ou mensagem.
- `GOOGLE_PLACES_API_KEY`: chave do Google Places, somente no servidor.

Depois de salvar as variáveis, faça um novo deploy na Vercel. Se uma chave secreta já foi compartilhada em conversa, revogue-a e gere outra antes de configurar.

## 3. Conta e organização

Acesse `/acesso`, crie a conta e confirme o e-mail se o Supabase exigir. Ao entrar, a aplicação chama `bootstrap_organization` para criar a organização inicial do usuário. O usuário precisa ter uma associação em `organization_members` para acessar os dados privados.

## 4. Módulos conectados

- **Estoque:** cadastro de produtos e saldo calculado a partir das movimentações gravadas no Supabase.
- **Financeiro:** receitas, despesas, vencimentos e status.
- **CRM:** pipeline ligado ao banco; se encontrar registros locais e o banco estiver vazio, importa esses registros.
- **Leads:** mantém cadastro local e oferece ação explícita para sincronizar com a organização.
- **Criar projetos:** salva um projeto e publica uma vitrine/cardápio/loja no endereço `/loja/[slug]`.
- **Pedidos públicos:** o endpoint valida os itens e recalcula os preços no servidor antes de gravar o pedido. Requer `SUPABASE_SERVICE_ROLE_KEY` configurada apenas na Vercel.

## 5. Limites importantes antes de vender

- A vitrine pública e o pedido ficam hospedados dentro do domínio da Arcany. Domínio próprio por cliente exige configuração de domínio e infraestrutura adicional.
- O checkout atual registra o pedido e abre o WhatsApp da loja; não processa cartão, Pix ou split automaticamente.
- Estoque registra produtos e movimentos; baixa automática de estoque ao receber pedido ainda precisa de integração/validação.
- A prospecção do Google depende de Places API e faturamento ativos.
- WhatsApp oficial, automações, pagamentos, emissão fiscal, importação de NF-e e publicação de sites independentes exigem provedores, credenciais e fluxos próprios.

## Estado real

Os arquivos e módulos estão no repositório, mas **não considere o SaaS totalmente ativado** até executar as duas migrações, configurar as variáveis, publicar a versão atual na Vercel e testar cadastro, isolamento entre organizações, vitrine pública e recebimento de pedidos.
