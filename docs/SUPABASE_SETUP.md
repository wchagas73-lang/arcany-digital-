# Configuração e estado atual da Arcany Digital

## 1. Projeto Supabase correto

Este guia se refere exclusivamente ao projeto Supabase da Arcany Digital:

- Project ref: `kiwhtyuqgvcczwtafzcn`
- Não execute estes passos em projetos de clientes.
- O banco já possui a estrutura inicial aplicada. **Não execute novamente** a migração `initial_saas_schema`.

A conferência atual do histórico do banco encontrou estas migrações aplicadas:

1. `20261107194126_initial_saas_schema`
2. `20261107194405_restrict_function_execute_permissions`
3. `20261107203829_harden_tenant_rls_and_index_foreign_keys`

O banco possui 15 tabelas públicas com RLS habilitado. A contagem inclui `store_orders`, criada na estrutura inicial. A migração opcional de storefronts `20261107210000_public_storefronts.sql` **não está aplicada** e não deve ser executada para habilitar cadastro, login, empresas ou leads.

## 2. Variáveis da Vercel

Para autenticação e os módulos atuais de empresas/leads, são necessárias somente:

- `NEXT_PUBLIC_SUPABASE_URL`: Project URL do Supabase Arcany.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: chave publicável atual. Se a conta ainda usar a chave anon legada, o código aceita `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

A chave pública pode aparecer no navegador. Ela não substitui as políticas RLS.

`GOOGLE_PLACES_API_KEY` é opcional para os recursos de prospecção que usam Places e deve permanecer somente no servidor, sem prefixo `NEXT_PUBLIC_`.

**Não configure nem exponha `SUPABASE_SERVICE_ROLE_KEY` para os módulos de autenticação, empresas ou leads.** Uma chave service-role só poderá ser considerada quando existir uma operação de servidor que realmente precise ignorar RLS, com endpoint revisado e escopo mínimo. Nunca a coloque em código cliente, em variável `NEXT_PUBLIC_`, no GitHub ou em mensagens.

Depois de alterar variáveis na Vercel, publique um novo deployment e confira se ele está associado ao projeto correto.

## 3. Cadastro, login e organização

O fluxo implementado é:

1. O cadastro chama `supabase.auth.signUp`.
2. Se o Supabase devolver uma sessão imediatamente, a aplicação consulta `organization_members` e chama `public.bootstrap_organization` se ainda não houver associação.
3. Se a confirmação de e-mail estiver habilitada, o callback `/auth/callback` troca o código por sessão, valida o usuário e executa o mesmo processo de associação.
4. O login valida a sessão e procura a organização do usuário.
5. O middleware protege as rotas internas; `/acesso`, `/auth/callback` e `/loja/:slug` permanecem públicas.

A função de bootstrap está liberada para usuários autenticados e negada a usuários anônimos. O banco ainda precisa de uma restrição única para garantir uma organização por usuário e de uma revisão dos privilégios de tabela antes de liberar a persistência multiusuário.

Ainda faltam testes reais de cadastro, confirmação, login, logout e isolamento entre duas contas independentes. Não considere a autenticação validada apenas porque o build passou.

No Supabase Auth, a URL de retorno precisa incluir o endereço publicado da Arcany terminado em `/auth/callback`. Configure também a URL base do site para os links de confirmação.

## 4. Situação dos módulos de empresas e leads

- **Empresas:** continuam no `localStorage`; ainda não há sincronização completa com o banco.
- **Leads:** continuam no `localStorage`; existe uma ação manual de sincronização para a tabela `public.leads`, mas ela é parcial e não representa uma migração completa.
- Os caches atuais usam chaves separadas por usuário autenticado.
- Chaves antigas sem identificação de conta não são importadas automaticamente, para evitar misturar dados de pessoas diferentes em aparelhos compartilhados.
- O botão **Backup JSON** exporta as chaves antigas conhecidas e as chaves da conta atualmente autenticada. O arquivo é gerado no aparelho, sem enviar dados ao servidor e sem apagar o armazenamento local.

Antes da migração definitiva:
1. Gere e guarde o backup JSON.
2. Confira se os dados antigos pertencem à conta correta.
3. Valide cadastro, associação organizacional e RLS com duas contas reais.
4. Implemente importação idempotente com relatório de registros inseridos, ignorados e conflitantes.
5. Compare a contagem e os dados no Supabase com o backup.
6. Mantenha o `localStorage` até a conferência final e aprovação da substituição.

## 5. Storefronts e pedidos públicos

A migração `20261107210000_public_storefronts.sql` não é necessária para autenticação, prospecção, empresas ou leads. Ela permanece fora do banco aplicado e não deve ser executada sem necessidade demonstrada e autorização específica.

Não configure chave administrativa para habilitar funcionalidades futuras por antecipação. Primeiro implemente e revise o endpoint servidor correspondente, as validações de entrada, o cálculo de preços no servidor e os controles de abuso.

## 6. Critérios para considerar a integração pronta

- [ ] Build de produção aprovado.
- [ ] Cadastro com confirmação de e-mail validado.
- [ ] Login e logout validados.
- [ ] Uma organização por usuário garantida no banco.
- [ ] Duas contas independentes sem acesso cruzado aos dados.
- [ ] Privilégios de tabela e sequência revisados e endurecidos.
- [ ] Backup JSON testado em aparelho real.
- [ ] Migração idempotente de empresas e leads testada sem apagar o cache local.
- [ ] Reconciliação concluída antes de trocar a fonte principal de dados.

Até esses critérios serem atendidos, a integração deve ser considerada em andamento, não pronta para produção.
