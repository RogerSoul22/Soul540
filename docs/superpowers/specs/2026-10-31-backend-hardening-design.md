# Endurecimento e correção do backend — Soul540

## Intenção

Corrigir os pontos de segurança, autorização, escopo de dados, consistência da fábrica, tratamento de erros, limites operacionais e textos corrompidos identificados na revisão do backend.

O sistema continuará usando Express, MongoDB/Mongoose e o envelope de respostas já consumido pelo `packages/api-client`.

## Objetivos

- Impedir falsificação de JWT quando a configuração estiver incompleta.
- Restringir administração de franquias e leitura de auditoria a administradores.
- Fazer a API validar permissões, sem depender da visibilidade do menu no frontend.
- Permitir que a fábrica administre campos operacionais de eventos do principal e das franquias sem permitir alterações financeiras indevidas.
- Mostrar no portal e no dashboard da fábrica os eventos das franquias Sorocaba e Itu; manter o financeiro da fábrica em seu próprio escopo.
- Restringir operações de produção por permissão explícita.
- Padronizar erros públicos sem vazar detalhes internos.
- Reduzir abuso de login/chat e limitar payloads grandes às rotas que realmente precisam deles.
- Substituir textos mojibake por UTF-8 correto.
- Preservar isolamento por unidade/franquia e a compatibilidade dos clientes atuais.

## Não objetivos

- Migrar Express/Mongoose para Node HTTP/Prisma nesta etapa.
- Alterar o modelo de dados ou fazer migração destrutiva.
- Dar ao administrador da fábrica acesso ao login ou ao sistema visual da franquia.
- Permitir que a fábrica exclua ou altere dados financeiros de eventos de outras unidades.

## Abordagens consideradas

1. **Correção incremental no backend atual — escolhida**: centraliza regras pequenas e reutilizáveis, adiciona testes de regressão e preserva contratos existentes.
2. **Migração arquitetural completa**: resolveria a dívida estrutural, mas aumentaria o risco e o escopo sem ser necessária para os problemas atuais.
3. **Correção mínima de segurança**: seria mais rápida, mas deixaria inconsistências funcionais da fábrica e permissões incompletas.

## Decisões de implementação

### Autenticação e autorização

- Criar um leitor único de `JWT_SECRET` que falha no boot quando o segredo não está definido ou é fraco; remover o fallback literal.
- Fazer `/api/auth/me` validar o sistema solicitado da mesma forma que as demais rotas.
- Adicionar middleware de permissões com nomes estáveis por módulo e separar leitura de escrita quando necessário.
- Proteger criação, edição e exclusão de franquias com administrador global.
- Proteger auditoria com administrador e manter filtro por escopo.
- Validar permissões também nas ações de mutação iniciadas pelo chat.

### Fábrica e acesso operacional a eventos

- Para uma requisição administrativa da fábrica, localizar o evento pelo `source`/unidade solicitado e aplicar o filtro de franquia correto.
- Permitir apenas o conjunto operacional já definido para a fábrica.
- Eventos exibidos e contados na Fábrica são os vinculados às franquias Sorocaba e Itu; tarefas, equipe e contratantes continuam usando os modelos da unidade `factory`.
- O financeiro da Fábrica usa somente o modelo `FactoryFinance`; o consolidado financeiro do Principal contém Principal e franquias.
- O escopo `combined` do Principal contém somente os dados principais e das franquias; a Fábrica não entra nesse consolidado.
- A consolidação de eventos e financeiro das franquias fica no sistema Principal, acessível ao administrador global.
- A fábrica pode localizar eventos confirmados de Sorocaba e Itu para vinculá-los a pedidos de produção e atualizar somente os campos operacionais permitidos.
- Não permitir leitura de relatórios financeiros combinados nem mutações financeiras cruzadas a partir do sistema Fábrica.
- O dashboard da Fábrica conta eventos de Sorocaba e Itu e dados operacionais da própria Fábrica.
- Exigir permissão específica para criação, edição, exclusão e reconciliação de pedidos de produção.

### Erros, limites e histórico

- Normalizar falhas para `{ success: false, error: { code, message, requestId } }`, preservando detalhes apenas nos logs internos.
- Aplicar limite menor ao JSON global e limite maior somente em upload/importação que necessite dele.
- Adicionar rate limit para login e chat sem bloquear uso normal.
- Trocar exclusões físicas de entidades históricas por inativação quando o modelo suportar; preservar o comportamento de itens operacionais descartáveis quando não houver histórico relevante.

### Qualidade

- Criar testes unitários/regressivos antes de cada grupo de mudanças.
- Corrigir os textos corrompidos identificados no backend.
- Rodar typecheck, testes da API, testes de escopo/autorização, checagem de encoding e build ao final.

## Ordem proposta

1. Testes e núcleo de autenticação/autorização.
2. Proteção das rotas de franquias, auditoria e módulos.
3. Correção do escopo isolado de eventos/financeiro da fábrica e dos acessos consolidados do Principal.
4. Produção, chat e histórico.
5. Erros, limites, rate limit e correção de textos.
6. Verificação completa e revisão final.

## Critério de aceite

- Nenhuma rota protegida permite mutação sem autenticação e permissão correspondente.
- JWT não funciona sem segredo configurado e não aceita segredo padrão.
- Eventos combinados da fábrica podem ser visualizados e ter apenas campos operacionais atualizados.
- Dashboard/financeiro da fábrica não apresentam dados vazios por usar o modelo errado.
- Erros públicos não expõem mensagens internas.
- Testes e verificações do projeto passam sem regressões conhecidas.
