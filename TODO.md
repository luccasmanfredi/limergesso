# TODO — LimerGesso

## 1. Site institucional público responsivo
- [x] A página pública tem header com lockup LimerGesso, menu Início, Serviços, Projetos, Quem Somos e Contato, CTA “Solicite seu orçamento”, menu móvel funcional e links corretos para as seções.
- [x] A home exibe o título “Há mais de 40 anos transformando ambientes através do gesso.”, texto institucional, CTA de orçamento e CTA de WhatsApp, além de serviços, projetos em destaque, diferenciais, história e chamada final.
- [x] O conteúdo usa branco/off-white, cinza, grafite e vermelho, tipografia editorial, fotografias grandes, animações suaves, hover discreto e layout responsivo sem aparência genérica; a captura visual desktop foi revisada.

## 2. Conteúdo institucional e contatos oficiais
- [x] A seção Quem Somos contém o texto institucional fornecido, os quatro pilares 40+ ANOS, QUALIDADE, PRECISÃO e CONFIANÇA e a seção “40 anos de história, milhares de ambientes transformados.”.
- [x] Os contatos oficiais estão configurados como Junior Felizatti, (19) 98266-3443, (19) 98121-4643 e limergesso@gmail.com; os WhatsApps abrem conversas e o e-mail usa link funcional.
- [x] Instagram, endereço e mapa permanecem configuráveis e não foram inventados.

## 3. Serviços dinâmicos
- [x] Serviços são carregados do banco, com nome, descrição, categoria, imagem, ordem e estado de publicação; os 10 serviços iniciais solicitados foram seedados.
- [x] A apresentação de molduras clássicas usa “A tradição das molduras clássicas, um diferencial da LimerGesso na região.” sem ampliar a afirmação de exclusividade.

## 4. Projetos e galeria de fotos
- [x] A galeria permite filtros por categoria, visualização ampliada, navegação, títulos/descrições opcionais, destaques, responsividade, lazy loading e alt text.
- [x] Fotos ilustrativas estão marcadas como conceituais e não são apresentadas como obras realizadas; nome de cliente/cidade só aparece quando autorizado.

## 5. Orçamento persistente
- [x] O formulário contém nome completo, WhatsApp, cidade, tipo de serviço, mensagem e upload opcional de fotos, com validação, aviso LGPD, confirmação somente após persistência, identificador único, retry de interface e prevenção de duplicidade.
- [x] Cada pedido fica disponível no painel com status Novo, Em análise, Orçamento enviado, Aprovado, Recusado ou Concluído.

## 6. Painel administrativo protegido
- [x] `/admin` exige autenticação real e autorização administrativa no backend, sem cadastro público de administradores nem senhas fixas no código; o teste sem autenticação retornou 403.
- [x] O dashboard consulta e exibe números reais de orçamentos, novos, em análise, enviados, aprovados, serviços e projetos publicados.
- [x] O admin pode pesquisar/filtrar por dados disponíveis na lista, ver detalhes, alterar status, registrar observações privadas e excluir com confirmação; a validação ponta a ponta depende de login de uma conta Manus autorizada.

## 7. Gestão de fotos, serviços e projetos
- [x] Admin pode enviar fotos, editar metadados, destaque e publicação; as mudanças invalidam o cache tRPC e refletem no site sem edição de código.
- [x] Admin pode cadastrar, editar, publicar, ordenar e remover serviços e projetos e selecionar destaques.
- [x] Uploads têm validação de formato/tamanho, prévia, permissões e remoção lógica, pois a API de runtime não oferece exclusão física direta.

## 8. Edição de conteúdo, segurança e acessibilidade
- [ ] Admin deve editar textos institucionais, pilares, diferenciais, contatos, logo e imagens de destaque sem editar HTML/CSS/JS.
- [ ] Visitantes só podem ler conteúdo público e enviar orçamento; não podem consultar pedidos, anexos ou notas internas.
- [ ] Aplicar validação de servidor, variáveis de ambiente, mensagens sem dados sensíveis, foco/teclado, contraste, labels, alt text, estados de loading/erro e `prefers-reduced-motion`.

## 9. Verificação e entrega
- [ ] Executar migrations, typecheck, build e testes automatizados.
- [ ] Verificar links, WhatsApps, e-mail, responsividade, persistência após refresh e bloqueio do painel sem autenticação.
- [ ] Entregar relatório com recursos implementados, testes executados, banco/storage utilizados e configurações ainda dependentes de logo, fotos reais, Instagram, endereço e conta autorizada.
