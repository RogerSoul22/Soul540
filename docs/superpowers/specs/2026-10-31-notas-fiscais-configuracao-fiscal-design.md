# Notas Fiscais com Configuração Fiscal Integrada

## Intenção

Concentrar a emissão e a configuração do certificado digital na página principal de Notas Fiscais do sistema principal, evitando duas entradas fiscais separadas no menu.

## Objetivos

- Exibir a configuração do certificado dentro de `/notas-fiscais`.
- Reutilizar o fluxo existente de upload, substituição e remoção do certificado.
- Remover a rota e o item de menu exclusivos de configuração fiscal.
- Manter a configuração disponível apenas para administradores.

## Fora do escopo

- Alterar o armazenamento ou a API do certificado.
- Liberar configuração fiscal para franquias ou fábrica.
- Alterar o fluxo de emissão, cancelamento ou download de notas.

## Abordagem escolhida

Extrair o formulário/cartão atual para um componente reutilizável dentro da área de Notas Fiscais. A página `NotasFiscais` renderizará esse componente junto da listagem; a rota `/configuracao-fiscal`, sua entrada no menu e o carregamento da página independente serão removidos.

## Verificação

Será adicionada uma verificação estrutural garantindo que a configuração fiscal é renderizada na página de notas e que a rota/menu independentes não existem. Depois serão executados os testes, o typecheck, as checagens de arquitetura e o build.
