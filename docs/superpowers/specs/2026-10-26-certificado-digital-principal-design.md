# Certificado digital A1 no sistema principal

## Intenção

Substituir o armazenamento global do certificado A1 em `NFE_CERT_BASE64` e `NFE_CERT_PASSWORD` por um cofre criptografado para a matriz (`apps/main`). O objetivo é permitir cadastro, substituição, consulta de metadados e remoção sem expor o PFX ou a senha ao navegador, aos logs ou ao banco em texto puro.

## Escopo

- Incluir somente o sistema principal e a emissão de NF-e da unidade `main`.
- Não criar tela, rota de administração ou armazenamento específico para franquias e fábrica nesta etapa.
- Manter os dados fiscais da emissão no fluxo atual.
- Fazer migração única do certificado legado configurado por ambiente, sem continuar dependendo dele depois da importação.

## Abordagens consideradas

1. **Cofre no banco com AES-256-GCM — escolhida.** Permite separação por unidade, troca pelo sistema, metadados de validade e rotação de chave. É a abordagem mais próxima do Concilo e prepara a evolução para franquias sem obrigar essa etapa agora.
2. **Arquivo ou secret manager por instalação.** Reduz mudanças no banco, mas mantém um certificado global, não oferece gerenciamento pelo sistema e não resolve a evolução multiunidade.

## Desenho escolhido

- Criar um modelo singleton para o certificado da matriz, com PFX e senha armazenados em campos criptografados separadamente.
- Usar AES-256-GCM com IV aleatório, autenticação e chave de 64 caracteres hexadecimais em `ENCRYPTION_KEY`; nenhum segredo será colocado no código ou retornado pela API.
- Guardar apenas metadados de operação: configurado em, validade, CNPJ, titular e status de configuração.
- Criar serviço de cofre que valida o PFX, confere validade e CNPJ quando aplicável, criptografa, descriptografa somente durante a emissão e limpa o certificado na remoção.
- Criar rotas protegidas para administrador autenticado da unidade `main`: consultar resumo, salvar/substituir e remover.
- Criar tela no `apps/main` para enviar `.pfx/.p12`, informar senha, visualizar resumo e remover o certificado. O conteúdo bruto nunca volta para o frontend.
- Na primeira execução, importar uma única vez os valores legados do ambiente se ainda não houver configuração. Registrar a conclusão da migração para que uma remoção intencional não reimporte o segredo. Depois da confirmação, `NFE_CERT_BASE64` e `NFE_CERT_PASSWORD` poderão ser retirados do ambiente.
- Alterar a emissão NF-e para usar o cofre da matriz em vez do cache global de `cert.ts`. NFS-e via Asaas não será alterada.
- Registrar auditoria sem incluir certificado, senha, Base64 ou chave privada.

## Critérios de sucesso

- O banco não contém PFX ou senha em texto puro.
- Usuário de franquia, fábrica ou usuário não administrador não consegue consultar ou alterar o cofre principal.
- A emissão NF-e da matriz continua assinando e comunicando com a SEFAZ usando o certificado descriptografado apenas em memória.
- Certificado expirado ou inválido impede a emissão com mensagem operacional clara.
- Testes cobrem criptografia, isolamento da rota, migração única, remoção e integração do emissor com o cofre.
