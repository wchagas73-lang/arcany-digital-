# Especificação funcional completa da Arcany Digital

**Status:** especificação de produto para orientar implementação e testes.  
**Escopo:** workspace privado de uma única agência, operado pelo proprietário.  
**Regra:** empresas e clientes são registros comerciais e projetos atendidos; não recebem conta nem acesso administrativo à Arcany.

## 1. Objetivo do produto

A Arcany Digital deve ser o centro de operação da agência: prospecção, CRM, vendas, contratos, financeiro, produção de soluções digitais, edição, publicação, atendimento, manutenção, automações, relatórios e assistência por IA.

A interface deve reduzir a necessidade de alternar entre ferramentas. Serviços externos só serão usados quando forem tecnicamente indispensáveis, com custo, finalidade, dependência e alternativa documentados.

A Arcany não deve prometer que hospedagem, domínio, APIs oficiais, provedores de IA, e-mail transacional ou plataformas de terceiros serão gratuitos. O objetivo é centralizar a gestão e evitar assinaturas duplicadas, não ocultar custos inevitáveis.

## 2. Perfis e acesso

### Proprietário
- Único usuário administrativo autorizado.
- Acesso a todos os módulos e dados da operação.
- Pode criar, editar, arquivar e exportar registros.
- Pode configurar integrações e permissões.
- Ações críticas devem exigir confirmação e gerar registro de auditoria.

### Clientes atendidos
- Não possuem login na Arcany por padrão.
- São cadastrados como empresas/contatos e vinculados a projetos.
- Recebem entregas e links externos específicos quando necessário.
- Não podem acessar CRM, dados financeiros, arquivos internos ou informações de outros clientes.

## 3. Módulos e requisitos funcionais

### 3.1 Painel central
- Indicadores reais de leads, propostas, contratos, projetos em andamento, entregas, chamados, contas a receber, despesas e receita recorrente.
- Atividades recentes e tarefas vencidas.
- Próximos vencimentos e follow-ups.
- Filtros por período e situação.
- Não exibir números fictícios ou métricas calculadas com dados de demonstração.

### 3.2 Prospecção
- Pesquisa por cidade, região e segmento, quando houver fonte de dados permitida.
- Registrar origem, data da pesquisa e evidências.
- Analisar presença digital pública e apontar oportunidades sem tratar ausência de evidência como defeito confirmado.
- Permitir revisão manual antes de converter resultado em empresa ou lead.
- Deduplicar por identificadores disponíveis, domínio, telefone e nome normalizado.
- Registrar custos, cotas e limites de APIs externas.
- Não automatizar disparos em massa nem violar termos de plataformas.

### 3.3 Empresas, contatos e CRM
Campos mínimos da empresa:
- Nome comercial e razão social, quando aplicável.
- Segmento, cidade/UF, endereço comercial opcional.
- Site, Instagram, telefone, WhatsApp e e-mail.
- Origem do cadastro, observações e responsável pelo relacionamento.
- Situação: prospectada, qualificada, em negociação, cliente ativo, inativa ou perdida.

Campos mínimos do contato:
- Nome, função, telefone, e-mail e canal preferido.
- Empresa vinculada e observações.

Pipeline configurável:
1. Novo lead.
2. Primeiro contato.
3. Aguardando resposta.
4. Diagnóstico.
5. Demonstração.
6. Proposta enviada.
7. Negociação.
8. Fechado ganho.
9. Fechado perdido.

Cada mudança deve persistir no banco e registrar data, autor e valor anterior/novo quando aplicável. Deve existir histórico de ligações, mensagens, reuniões, notas, tarefas e próximos passos. Empresas duplicadas devem ser sinalizadas antes de criar novo registro.

### 3.4 Diagnóstico comercial
- Checklist por segmento e tipo de serviço.
- Separar fatos observados, hipóteses e itens não verificados.
- Vincular diagnóstico à empresa e à oportunidade.
- Gerar resumo e recomendações revisáveis pelo proprietário.
- Permitir transformar necessidades confirmadas em itens de proposta.

### 3.5 Catálogo e precificação
- Cadastro de serviços, descrição, escopo padrão, faixa de implantação, mensalidade, prazo de referência e itens não incluídos.
- Planos de manutenção Essencial, Profissional e Avançado.
- Valores editáveis pelo proprietário, com histórico de alterações.
- Projetos personalizados exigem briefing e orçamento individual.
- A proposta salva uma fotografia dos preços e condições vigentes na data de emissão, para que mudanças futuras no catálogo não alterem propostas antigas.

### 3.6 Propostas e contratos
- Gerar proposta a partir de empresa, contato, diagnóstico e catálogo.
- Itens, quantidades, descontos autorizados, implantação, mensalidade, prazo, validade, escopo, exclusões e condições de pagamento.
- Status: rascunho, pronta, enviada, em revisão, aceita, recusada, vencida ou cancelada.
- Registrar data de envio, validade e resultado.
- Gerar contrato a partir da proposta aprovada, preservando o escopo.
- Exportar documento para PDF e manter cópia no histórico do cliente.
- Não assinar em nome do proprietário nem enviar documentos juridicamente vinculantes sem revisão/ação autorizada.

### 3.7 Financeiro
- Contas a receber: sinal, saldo de entrega, mensalidades e serviços extras.
- Contas a pagar e despesas operacionais.
- Categorias, competência, vencimento, pagamento, forma de pagamento e comprovante.
- Recorrências mensais com prevenção de duplicidade.
- Status: previsto, pendente, pago, atrasado, cancelado ou estornado.
- Fluxo de caixa, receita de implantação, receita recorrente, despesas e resultado estimado.
- Relatórios por período e por cliente.
- Não integrar movimentação bancária ou iniciar pagamentos sem autorização e avaliação de segurança.
- Não tratar faturamento como lucro: custos e taxas devem ser registrados.

### 3.8 Clientes e pós-venda
- Ficha única por cliente com contatos, propostas, contratos, projetos, financeiro, arquivos, suporte e histórico.
- Plano contratado, início, renovação e situação.
- Lembretes de renovação e revisão de relacionamento.
- Encerramento com checklist de pendências, exportação e transferência de ativos conforme contrato.
- Não misturar informações entre clientes.

### 3.9 Gestão de projetos
- Criar projeto a partir de proposta aceita.
- Vincular cliente, contrato, briefing, escopo, orçamento, prazo, responsáveis e entregáveis.
- Etapas padrão: planejamento, produção, revisão interna, aprovação do cliente, publicação e entrega.
- Tarefas com prioridade, prazo, dependências, checklist e histórico.
- Registrar mudanças de escopo e aprovação de orçamento adicional.
- Anexar arquivos, links, versões e evidências de testes.
- Alertar sobre atrasos e bloqueios.

### 3.10 Fábrica de soluções digitais
- Biblioteca versionada de modelos por segmento e tipo de solução.
- Reutilizar componentes sem compartilhar dados ou arquivos privados entre clientes.
- Criar uma instância independente por projeto.
- Configurar marca, cores, conteúdo, imagens, catálogo, formulários, CTAs e integrações.
- Pré-visualização antes da publicação.
- Registrar tecnologias, dependências, custos e instruções de manutenção por projeto.
- Não copiar credenciais, dados reais ou ativos protegidos de outro cliente.

### 3.11 Editor de conteúdo
- Editar textos, imagens, links, serviços, produtos e informações de contato.
- Salvar rascunho, visualizar alterações e publicar explicitamente.
- Mostrar estado de salvamento e erro; nunca indicar sucesso antes da persistência.
- Atualizações de mídia devem preservar a versão publicada até que o novo arquivo esteja armazenado e validado.
- Otimizar imagens e validar formatos/tamanho.
- Histórico de versões e opção de restaurar uma versão anterior.
- Publicação deve refletir o conteúdo persistido, com revalidação/cache controlado.

### 3.12 Publicação e infraestrutura
- Registrar URL de preview, URL pública, domínio, provedor, repositório, branch e commit.
- Distinguir preview de produção.
- Mostrar estado do deploy e resultado de verificação HTTP.
- Preservar projetos já em produção; nenhuma migração de provedor sem plano e autorização.
- Domínios e contas principais devem pertencer preferencialmente ao cliente.
- Custos de domínio, hospedagem, armazenamento e APIs devem aparecer no cadastro do projeto.

### 3.13 Atendimento e manutenção
- Abrir solicitação vinculada ao cliente e projeto.
- Categorias: dúvida, correção, conteúdo, melhoria, incidente e cobrança.
- Prioridade: crítica, alta, normal ou baixa.
- Status: aberta, em triagem, em andamento, aguardando cliente, resolvida ou encerrada.
- Registrar mensagens, anexos, responsável, prazo e tempo gasto.
- Controlar franquia mensal de pequenas alterações por plano.
- Diferenciar defeito coberto, manutenção incluída e novo escopo faturável.
- Manter histórico de atendimento e satisfação.

### 3.14 Automações
- Regras baseadas em eventos: novo lead, proposta vencendo, tarefa atrasada, mensalidade próxima do vencimento, chamado sem atualização e renovação próxima.
- Criar tarefas e notificações internas automaticamente.
- Mensagens externas só com integração oficial, consentimento/base legal, limites e aprovação humana quando necessário.
- Toda automação deve possuir logs, opção de pausar e prevenção de execução duplicada.

### 3.15 Assistente de IA
- Consultar dados autorizados da Arcany para resumir empresas, oportunidades, projetos e resultados.
- Preparar rascunhos de propostas, contratos, briefings, mensagens, conteúdos e relatórios.
- Sugerir próximos passos com justificativa e fonte dos dados.
- Auxiliar a criar páginas e soluções a partir de briefing e modelos.
- Executar ações de baixo risco somente após validação de permissões.
- Exigir confirmação antes de enviar mensagens externas, publicar, excluir, alterar dados financeiros ou realizar ações irreversíveis.
- Registrar prompt resumido, ação, resultado, data e usuário.
- Permitir escolher provedor/modelo, limitar consumo e desligar a IA.
- Não enviar dados pessoais ou confidenciais a provedores sem avaliação, transparência e configuração apropriada.
- IA é recurso assistivo; não inventar fatos, preços, disponibilidade ou conclusões.

### 3.16 Arquivos, segurança e auditoria
- Arquivos organizados por cliente e projeto.
- Controle de tipo, tamanho, origem, data e classificação.
- Armazenamento privado por padrão; mídia pública somente quando selecionada para publicação.
- Credenciais não devem ser guardadas em campos de texto comuns. Usar mecanismo seguro de segredos ou acesso delegado.
- Log de ações administrativas importantes.
- Backup automático conforme capacidade da infraestrutura e exportação manual disponível.
- Teste documentado de restauração.
- Proteção contra exclusão acidental, com confirmação e recuperação quando tecnicamente possível.
- Revisão de permissões, RLS, autenticação e dependências antes de produção.

### 3.17 Relatórios
- Conversão por etapa do funil.
- Origem de leads e taxa de fechamento.
- Receita de implantação e receita recorrente mensal.
- Despesas, margem estimada e inadimplência.
- Rentabilidade por cliente e projeto.
- Tempo médio de produção e entrega.
- Volume de chamados e cumprimento de prazos.
- Retenção e cancelamentos.
- Todos os relatórios devem informar período, filtros e origem dos dados.

## 4. Fluxos integrados obrigatórios

### Fluxo A: prospecção até venda
Pesquisa -> revisão -> empresa/lead -> atividade -> diagnóstico -> oportunidade -> proposta -> negociação -> aceite -> contrato.

### Fluxo B: venda até entrega
Contrato -> cobrança inicial -> projeto -> briefing -> produção -> revisão -> aprovação -> cobrança final -> publicação -> entrega -> manutenção.

### Fluxo C: manutenção e renovação
Cliente ativo -> mensalidade -> solicitações -> consumo do plano -> relatório -> alerta de renovação -> renovação ou encerramento.

### Fluxo D: solicitação adicional
Chamado -> classificação -> verificar contrato/plano -> estimar esforço -> orçamento adicional quando necessário -> aprovação -> execução -> registro.

## 5. Regras transversais

1. A fonte oficial de dados de negócio deve ser o banco, não apenas o armazenamento local do navegador.
2. Operações devem mostrar carregamento, sucesso confirmado e erro recuperável.
3. Não apagar dados existentes durante migração; primeiro exportar, reconciliar e comparar.
4. Não criar dados fictícios em indicadores reais.
5. Não executar migrações de banco sem revisão de impacto, backup e plano de reversão.
6. Toda alteração de código deve ocorrer em branch de desenvolvimento e passar por CI.
7. Não mesclar PR nem publicar em produção automaticamente.
8. Não alterar projetos de clientes já entregues como parte da evolução da Arcany.
9. Não usar o banco ou credenciais de um cliente para outro.
10. Interface responsiva para notebook e celular, com prioridade de produtividade no notebook.
11. Ações críticas devem ter confirmação explícita.
12. O sistema deve manter acessibilidade, estados vazios úteis e mensagens em português claro.

## 6. Estratégia de ferramentas e custos

- Manter a Arcany como interface central e centro de controle.
- Preferir ferramentas já disponíveis e planos gratuitos adequados.
- GitHub permanece como versionamento.
- Cloudflare Pages é a preferência para novas publicações, sem migrar projetos existentes que funcionam.
- Supabase é utilizado quando necessário para autenticação, banco e armazenamento.
- Vercel permanece nos projetos já conectados até decisão técnica específica.
- APIs de pesquisa, WhatsApp oficial, IA, e-mail, domínios e armazenamento podem gerar custos. Cada dependência deve ser opcional quando possível e ter estimativa de custo.
- Não adicionar assinatura externa sem necessidade comprovada.

## 7. Critérios de aceite para considerar a Arcany pronta

- Primeiro acesso, confirmação de e-mail, login, logout e recuperação testados.
- Nenhuma conta não autorizada consegue entrar.
- Empresas, leads, propostas, contratos, projetos, arquivos e financeiro persistem corretamente.
- Backup e restauração testados.
- Migração de dados locais reconciliada sem perda.
- Fluxos completos A, B, C e D executados com dados de teste claramente identificados e depois removidos de forma controlada.
- Editor salva e publica conteúdo corretamente; a versão anterior é preservada em caso de falha.
- Publicações verificadas em preview e produção, sem confusão entre os dois.
- IA testada com permissões, limites, logs e confirmações.
- Custos externos identificados.
- Testes em notebook e celular.
- CI aprovado e auditoria de segurança concluída.
- Nenhum projeto de cliente existente foi afetado.

## 8. Fora do escopo automático

Não presumir que a Arcany terá:
- Envio ilimitado de WhatsApp sem custos ou regras da Meta.
- Hospedagem e domínios gratuitos para todos os clientes.
- Integração bancária automática sem provedor.
- Geração de IA ilimitada sem custo.
- Publicação automática em qualquer plataforma sem credenciais e integração.
- Acesso de clientes ao painel administrativo.

Esses recursos dependem de análise, integração, autorização e custo específico.

## 9. Ordem de implementação

1. Concluir autenticação, publicação e primeiro acesso seguro.
2. Tornar empresas, leads e atividades persistentes e reconciliar dados locais.
3. Integrar CRM, diagnóstico, propostas e contratos.
4. Consolidar clientes, projetos, arquivos e tarefas.
5. Integrar financeiro, recorrências e relatórios.
6. Completar fábrica de soluções, editor, versionamento e publicação.
7. Implementar atendimento, manutenção e renovação.
8. Adicionar automações internas.
9. Implementar assistente de IA com controles de custo e segurança.
10. Executar testes de ponta a ponta e auditoria final.

**Esta especificação define o resultado desejado. Marcar um item como concluído exige implementação e evidência de teste, não apenas documentação ou existência de uma tela.**
