# Plano de implementação — LimerGesso

## Objetivo

Construir o site institucional público e o painel administrativo da LimerGesso como uma aplicação React/Express/tRPC, com banco de dados persistente, autenticação real e gerenciamento de conteúdo. A implementação prioriza, nesta ordem: persistência e segurança dos dados, formulário de orçamento, administração de fotos/serviços/projetos, edição de conteúdo e apresentação visual.

## Plataforma e arquitetura

A infraestrutura disponível para este projeto é a alternativa equivalente ao Supabase solicitada no briefing:

- **Frontend:** React, TypeScript, Tailwind CSS, Wouter e Framer Motion.
- **Backend:** Express + tRPC, com validação Zod em todos os procedimentos de escrita.
- **Banco persistente:** MySQL gerenciado pela plataforma, acessado por Drizzle ORM e migrations versionadas.
- **Autenticação administrativa:** Manus OAuth, com sessão validada no servidor. O proprietário do projeto recebe papel `admin` no primeiro login; não haverá cadastro público de administradores.
- **Armazenamento persistente:** objeto storage da plataforma, com URLs estáveis no formato `/manus-storage/<chave>`. O servidor validará tipo, tamanho, autorização e nomeará arquivos com chaves aleatórias antes de emitir URLs de upload.
- **Publicação:** contêiner Node com endpoint `/api/health`; frontend e APIs serão servidos pela mesma aplicação.

O banco e os uploads persistem entre recargas, dispositivos, reinícios e publicação. Desenvolvimento e produção compartilham o mesmo banco, portanto os testes serão identificáveis e não serão realizados sobre conteúdo real fornecido pelo cliente sem necessidade.

## Limite conhecido do storage

A API de runtime de storage permite criar URLs de upload e leitura, mas não disponibiliza exclusão física de objetos ao aplicativo. Por isso, a exclusão no painel será uma **remoção lógica**: a foto deixa de ser publicada e seu registro deixa de aparecer no site. A prevenção de arquivos órfãos será feita registrando cada upload finalizado imediatamente na base e descartando uploads incompletos no fluxo de interface; a remoção física posterior depende da superfície administrativa da plataforma ou de uma ferramenta de operador, que será documentada como pendência operacional caso não esteja disponível ao projeto.

## Modelo de dados

Além da tabela de usuários e papéis administrativos, serão criadas tabelas relacionadas:

- `companySettings`: nome, responsável, logo, telefones/WhatsApps, e-mail, Instagram, endereço, mapa, textos institucionais e preferências de apresentação.
- `siteSections`: conteúdo editável da home, Quem Somos, seção de história, títulos, CTAs e diferenciais.
- `categories`: categorias de fotos, projetos e serviços, com ordem e publicação.
- `services`: nome, descrição, categoria, imagem de capa, ordem e publicação.
- `projects`: título, categoria, descrição, cliente/cidade condicionados à autorização, publicação e destaque na home.
- `photos`: título, descrição, alt text, chave do storage, URL estável, categoria, projeto associado, ordem, destaque, publicação, data e remoção lógica.
- `quoteRequests`: código público único, dados de contato, serviço, mensagem, estado, hash de deduplicação, data e remoção lógica.
- `quoteAttachments`: referências persistentes das fotos enviadas em cada orçamento.
- `quoteNotes`: observações internas, autor e data; nunca expostas publicamente.

As relações e índices de publicação/ordem serão declarados em migrations. Os status de atendimento são: Novo, Em análise, Orçamento enviado, Aprovado, Recusado e Concluído.

## Site público

A página inicial será uma narrativa editorial de acabamento arquitetônico premium, com as rotas/seções:

- Header fixo: marca LimerGesso, navegação Início, Serviços, Projetos, Quem Somos e Contato, CTA de orçamento e menu móvel acessível.
- Hero com o texto obrigatório “Há mais de 40 anos transformando ambientes através do gesso.”, CTAs funcionais para orçamento e WhatsApp.
- Atalhos para Serviços, Fotos, Quem Somos e Contato; apresentação de serviços, projetos em destaque, diferenciais, história e CTA.
- Seção Quem Somos com o conteúdo institucional fornecido e os quatro pilares editáveis.
- Serviços carregados do banco, cards por categoria e destaque específico para molduras clássicas com a frase fornecida.
- Galeria filtrável, com lightbox, navegação entre imagens e metadados somente quando autorizados.
- Seção de diferenciais e seção “40 anos de história, milhares de ambientes transformados.”.
- Formulário de orçamento com uploads opcionais, proteção contra reenvio acidental, confirmação apenas após persistência e aviso de privacidade/LGPD.
- Contato oficial, links `wa.me` para ambos os números, `mailto`, campos configuráveis para Instagram/endereço/mapa e botão flutuante de WhatsApp.

As imagens de ambientes usadas durante a criação serão assumidamente **conceituais/ilustrativas**, nunca identificadas como obras da LimerGesso. Fotos reais, logo e dados ainda não fornecidos serão administráveis e poderão substituir os conteúdos iniciais pelo painel.

## Painel administrativo em `/admin`

O painel será protegido no cliente e no servidor, verificando a sessão e o papel `admin` em toda mutação. Terá:

- Login, logout, estado de acesso negado e primeiro administrador baseado no proprietário do projeto.
- Dashboard calculado a partir do banco: pedidos totais, novos, em análise, enviados, aprovados, serviços e projetos publicados.
- Gestão de orçamentos: lista, busca por nome/código, filtro, detalhes, contatos, mudança de status, notas privadas e exclusão confirmada.
- Gestão de fotos: upload, prévia, título, descrição, alt text, categoria, projeto/álbum, ordem, destaque, publicação, substituição e remoção lógica confirmada.
- Gestão de serviços e projetos: criação, edição, ordenação, publicação, destaque, associações de fotos e remoção confirmada.
- Conteúdo e contatos: edição da home, Quem Somos, pilares, diferenciais, seção histórica, logo, telefones, e-mail, Instagram, endereço, mapa e imagens de destaque.

## Segurança, acessibilidade e experiência

Sessões e funções administrativas serão verificadas pelo backend; os visitantes só poderão ler conteúdo publicado e enviar pedidos. Nenhum procedimento público devolverá pedidos, anexos ou observações internas. As credenciais permanecerão em variáveis de ambiente e nunca no frontend. As entradas serão validadas no servidor; uploads terão limites de formato e tamanho; a aplicação usará estados de carregamento, mensagens de erro sem detalhes sensíveis e prevenção de duplicidade por token/idempotência.

A interface terá contraste apropriado, foco visível, navegação por teclado, labels e feedback acessíveis, textos alternativos, imagens responsivas/lazy loading e layout adaptado para celular, tablet e desktop.

## Direção visual

**Movimento de design:** editorial contemporâneo para arquitetura e interiores de alto padrão.

**Princípios:** composição arejada; materiais e detalhes em primeiro plano; hierarquia tipográfica serena; informação institucional com presença e sem excessos.

**Cores:** off-white e pedra para transmitir acabamento e matéria; grafite para confiança e leitura; vermelho LimerGesso como acento preciso para CTAs, a flor-de-lis e estados ativos.

**Layout:** grandes faixas narrativas alternando foto e conteúdo, recortes assimétricos suaves, linhas finas e blocos de dados compactos — evitando aparência de template em grade repetitiva.

**Elementos de assinatura:** uma flor-de-lis tipográfica provisória, molduras de cantos finos que remetem a trabalhos clássicos e linhas de cota vermelhas discretas.

**Interação e animação:** movimentos curtos e sutis na entrada, hover de elevação mínima em cards e transições que não prejudicam foco/teclado; `prefers-reduced-motion` será respeitado.

**Tipografia:** Cormorant Garamond para títulos de expressão editorial e Manrope para texto/UI; contraste entre tradição e precisão contemporânea.

**Essência de marca:** acabamentos em gesso que unem tradição artesanal e precisão arquitetônica. Personalidade: refinada, confiável e detalhista.

**Voz:** segura, direta e acolhedora. Exemplos: “O detalhe é onde um ambiente se torna memorável.” e “Conte a ideia. Nós cuidamos da precisão.”

**Logo e cor de assinatura:** enquanto a logo oficial não for fornecida, a identidade visual usará um lockup provisório de texto e flor-de-lis, claramente substituível pelo painel. Vermelho Limer `#B71C2B` será o sinal de marca.

## Estrutura de pastas

- `client/src/pages/`: páginas públicas, orçamento e área administrativa.
- `client/src/components/`: componentes reutilizáveis do site, galeria, formulários e dashboard.
- `client/src/lib/`: cliente tRPC e utilitários.
- `server/routers.ts`: procedimentos públicos e administrativos tRPC.
- `server/db.ts`: consultas e comandos tipados do domínio.
- `server/storage.ts`: emissão de URLs seguras e fluxo de finalização de uploads.
- `drizzle/schema.ts`: modelo relacional.
- `drizzle/`: migrations versionadas.
- `public/manus-routes.json`: manifesto de rotas navegáveis.
- `TODO.md`: outcomes rastreáveis após aprovação deste plano.

## Fluxo de entrega

1. Criar schema, migrations, consultas, autenticação/autorizações e API de uploads.
2. Implementar a interface pública conectada à base, com dados institucionais iniciais claramente editáveis.
3. Implementar o painel e todos os fluxos de CRUD administrativo.
4. Aplicar responsividade, acessibilidade, tratamento de estados e regras de privacidade.
5. Executar migrations, typecheck, testes automatizados e testes manuais reais que não dependam de credenciais externas pendentes.
6. Corrigir problemas confirmados, criar checkpoint e, somente se solicitado/autorizado, publicar.

## Dependências do cliente

Para encerrar toda a personalização comercial, serão necessários posteriormente: logo oficial em arquivo, fotos reais autorizadas, Instagram se existir, endereço/mapa se desejado e uma decisão sobre quem terá conta Manus para acessar o painel administrativo. A ausência desses itens não impede a construção da aplicação, mas impede afirmar que tais informações reais já estão configuradas.
