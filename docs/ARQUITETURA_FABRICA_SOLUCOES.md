# Arquitetura da fábrica de soluções da Arcany

## Objetivo

A Arcany é um workspace privado de uma agência digital. A biblioteca de modelos serve para acelerar a produção de entregáveis para clientes. Clientes não recebem acesso à Arcany por padrão e não são usuários autenticáveis do workspace.

## Biblioteca inicial

A primeira versão mantém os modelos como conteúdo versionado no repositório, sem registros fictícios no banco. A interface fica em `/modelos` e permite:
- Pesquisar por nome, segmento, tipo e objetivo.
- Filtrar por nicho e tipo de solução.
- Consultar objetivo, estrutura de páginas e funcionalidades.
- Copiar um prompt-base de produção para usar em ferramentas de desenvolvimento.
- Personalizar conteúdo, identidade, fotos, preços, contatos e regras após receber dados reais do cliente.

A biblioteca inicial inclui modelos para pet, beleza, moda, calçados, comércio varejista, alimentação, mercado/hortifruti, açougue, saúde e bem-estar, automotivo, imobiliário, serviços profissionais, B2B e soluções multissetoriais.

Tipos cobertos: landing pages, sites institucionais, catálogos, vitrines, e-commerce, cardápios, agendamentos, estoque, ordens de serviço e dashboards operacionais.

## Regras de qualidade

1. Um modelo é uma estrutura de partida, não uma solução publicada pronta.
2. Conteúdo de demonstração deve ser identificado e nunca apresentado como fato real.
3. Não inventar preços, avaliações, depoimentos, certificações, disponibilidade ou credenciais.
4. Regras de negócio precisam ser confirmadas com o cliente antes de implementar.
5. Integrações externas exigem credenciais e validação de permissões, custos e limites.
6. Cada projeto deve ter escopo, aceite, testes, backup e plano de entrega.
7. O cliente deve manter propriedade e acesso aos seus repositórios, hospedagem e dados, conforme o contrato de entrega.
8. Segredos de clientes não devem ser guardados em texto puro no workspace.

## Próximas evoluções

### Biblioteca e configurador
- Persistir modelos administráveis no Supabase da Arcany, com RLS restrito ao proprietário.
- Permitir duplicar, versionar, arquivar e editar modelos.
- Campos de configuração por projeto: marca, paleta, tipografia, imagens, conteúdo, catálogo, regras e integrações.
- Componentes por nicho e blocos intercambiáveis.
- Galeria de referências visuais e critérios de qualidade.

### Produção
- Criar projeto a partir do modelo selecionado.
- Gerar checklist de briefing e itens pendentes do cliente.
- Gerar estrutura inicial do repositório do cliente.
- Pré-visualizar em ambiente isolado.
- Rodar testes funcionais, responsividade, acessibilidade, SEO e segurança.
- Publicar somente após aprovação humana e autorização explícita do proprietário.

### Operação da agência
- CRM, propostas e contratos vinculados ao cliente.
- Tarefas, prazos, revisões e entregáveis.
- Registro de domínios, hospedagem, repositório e responsáveis, sem armazenar segredos desprotegidos.
- Financeiro, rentabilidade e recorrência.
- Suporte, manutenção, monitoramento e renovações.

## Limites da primeira entrega

A primeira versão da biblioteca é um catálogo de modelos e prompts-base versionados no código. Ela não gera automaticamente aplicações completas, não provisiona projetos GitHub/Vercel, não publica sites e não salva projetos ou modelos no banco. Essas capacidades exigem fases adicionais, testes e integração segura.
