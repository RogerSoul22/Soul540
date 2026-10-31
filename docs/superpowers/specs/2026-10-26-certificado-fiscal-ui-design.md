# Certificado fiscal — ajuste visual

## Intenção

Reproduzir no sistema principal o padrão visual de certificado digital apresentado pelo usuário, com dois estados claros: certificado configurado e formulário de envio.

## Objetivos

- Exibir status, data de envio, validade, dias restantes, titular e CNPJ quando configurado.
- Exibir área de upload, senha e ação de envio quando não configurado.
- Manter remoção e substituição protegidas por confirmação.
- Preservar o fluxo existente de API, criptografia e escopo exclusivo da matriz.

## Não objetivos

- Alterar armazenamento, API, permissões ou formato do certificado.
- Exibir o arquivo ou a senha depois do envio.

## Abordagens

1. Ajustar apenas o CSS do formulário atual: menor mudança, mas não reproduz bem a área de upload customizada.
2. Criar blocos visuais próprios para os estados configurado/vazio, mantendo o hook e os contratos existentes: escolhida por permitir fidelidade visual sem ampliar o escopo técnico.

## Decisões

- O componente usará input de arquivo nativo visualmente oculto e uma área clicável pontilhada.
- A validade terá cor semântica: verde quando distante, laranja quando próxima e vermelho quando expirada.
- O botão de remoção será destrutivo e o envio ficará destacado em verde.
