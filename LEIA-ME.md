# CR Recursos Humanos — site institucional

Site estático em **HTML, CSS e JavaScript puros**. Sem build, sem dependências, sem framework.
Basta subir a pasta inteira para qualquer hospedagem.

---

## 1. Estrutura de arquivos

```
/
├── index.html                      Home
├── sobre.html                      Quem somos, valores e metodologia
├── servicos.html                   Hub dos 4 serviços
├── recrutamento-e-selecao.html     Serviço 01
├── consultoria-de-rh.html          Serviço 02
├── gestao-de-beneficios.html       Serviço 03
├── folha-de-pagamento.html         Serviço 04
├── trabalhe-conosco.html           Cadastro de currículo
├── contato.html                    Formulário, canais e mapa
├── politica-de-privacidade.html    LGPD
├── 404.html                        Página de erro
├── robots.txt
├── sitemap.xml
├── site.webmanifest
└── assets/
    ├── css/style.css               Todo o CSS (design system + páginas)
    ├── js/main.js                  Todo o JS (19 módulos independentes)
    └── img/
        ├── logo-cr.svg             Monograma CR
        ├── logo-cr-full.svg        Logo com assinatura
        ├── favicon.svg             Ícone da aba
        └── og-image.png            1200×630, compartilhamento em redes
```

---

## 2. Como publicar

Qualquer hospedagem de arquivos estáticos serve — Hostinger, Locaweb, Netlify, Vercel,
GitHub Pages, KingHost. Envie o conteúdo da pasta para a raiz do domínio (`public_html`).

**Configure o 404 no servidor.** Em Apache, crie um `.htaccess` na raiz:

```apache
ErrorDocument 404 /404.html

# Compressão
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml
</IfModule>

# Cache dos assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
</IfModule>
```

---

## 3. O que PRECISA ser revisado antes de ir ao ar

Estes pontos foram preenchidos a partir do site antigo e de premissas razoáveis.
**Confirme cada um com o cliente:**

| Onde | O que verificar |
|---|---|
| Faixa de números da home | **"48h — prazo médio para o primeiro retorno"** é uma promessa comercial. Confirme se a CR sustenta esse prazo ou troque o número. |
| Faixa de números da home | **"+15 anos"** veio do texto do site antigo. Confirme o ano de fundação. |
| Horário de atendimento | **8h30 às 18h, seg. a sex.** foi assumido. Aparece no rodapé, no contato e no `schema.org`. |
| Endereço | `Rua José Paulo Cândido, 747 — Jardim Silveira, São Paulo/SP`. O **CEP 04892-010** foi deduzido pelo nome da rua — confirme. |
| Setores atendidos | A lista do carrossel (Indústria, Saúde, Tecnologia…) é genérica. Ajuste para os setores reais. |
| Ilustrações | As páginas Home e Sobre usam um **gráfico vetorial como marcador de lugar** (`.figure-ph`). Substitua por fotos reais da equipe/escritório — ver seção 6. |
| Depoimentos | **Não foram incluídos.** Não invento depoimentos. Assim que houver citações reais autorizadas, dá para montar a seção. |

### Contatos usados no site (extraídos do site antigo)

- WhatsApp / celular: **(11) 94264-8699**
- Telefone fixo: **(11) 5920-4973**
- E-mail: **claudio.felix@crassessoriarh.com.br**
- Instagram: **instagram.com/crassesoria**
- LinkedIn: perfil de Cláudio Roberto Félix
- YouTube: **@crcalculojuridico**

> Você não chegou a colar o link do Instagram na mensagem — usei o que estava no site antigo
> (`@crassesoria`). Se o perfil ativo for outro, troque em `assets/js` não; troque nos rodapés
> (busque por `instagram.com` nos `.html`).

---

## 4. Formulários — como funcionam hoje

Existem dois formulários: **contato** e **trabalhe conosco**.

**Comportamento atual (funciona sem servidor):** o formulário valida os campos e, ao enviar,
abre o WhatsApp com a mensagem já formatada. Zero configuração, funciona desde o primeiro dia.

**Para receber por e-mail**, use um serviço de formulário e troque só o atributo `action`:

```html
<!-- em contato.html e trabalhe-conosco.html -->
<form class="form" data-form="contato" action="https://formspree.io/f/SEU_ID" method="post" ...>
```

O JavaScript detecta o `action` preenchido e passa a enviar por `fetch`, exibindo mensagem de
sucesso ou erro na própria página. Opções recomendadas:

- **FormSubmit** (`https://formsubmit.co/seu@email.com`) — gratuito e **aceita anexo de arquivo**,
  ideal para o formulário de currículo.
- **Formspree** (`https://formspree.io`) — plano gratuito com limite mensal.

Se usar FormSubmit no *Trabalhe Conosco*, dá para adicionar um campo de upload real:

```html
<div class="field">
  <label for="t-cv">Currículo (PDF ou DOC)</label>
  <input type="file" id="t-cv" name="curriculo" accept=".pdf,.doc,.docx">
</div>
```

---

## 5. SEO — o que já está implementado

- `<title>` e `meta description` **únicos** em cada página, dentro do tamanho ideal.
- `link rel="canonical"` em todas as páginas.
- **Open Graph** e **Twitter Card** completos, com imagem 1200×630 pronta.
- **JSON-LD (schema.org)** em `@graph` por página:
  - `Organization` + `ProfessionalService` (endereço, telefones, horário, redes, área atendida)
  - `WebSite`, `WebPage`
  - `BreadcrumbList` em todas as páginas internas
  - `Service` + `OfferCatalog` em cada página de serviço
  - `FAQPage` na home (elegível para rich snippet de perguntas no Google)
  - `ContactPage` e `AboutPage`
- `sitemap.xml` e `robots.txt` (com a 404 fora do índice).
- Um único `<h1>` por página e hierarquia `h2`/`h3` coerente.
- HTML semântico: `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`.
- Links internos cruzados entre serviços, sobre e contato.
- `lang="pt-BR"`, `geo.region`, `theme-color`, manifesto PWA.
- Fontes com `preconnect` + `preload` e carregamento não bloqueante.
- **Sem JavaScript o conteúdo aparece normalmente** — as animações só escondem elementos
  quando há JS ativo. Isso protege a indexação.

### Depois de publicar

1. Cadastre o domínio no **Google Search Console** e envie o `sitemap.xml`.
2. Crie/reivindique o **Perfil da Empresa no Google** (Google Meu Negócio) com o mesmo
   nome, endereço e telefone do site — a consistência NAP pesa muito no SEO local.
3. Rode o **Teste de Resultados Aprimorados** do Google para conferir o FAQ da home.
4. Se o site antigo tinha URLs indexadas (`/sobre`, `/home2`, `/contato`,
   `/entre-em-contato`), configure redirecionamentos 301 no `.htaccess`:

```apache
Redirect 301 /home2 /servicos.html
Redirect 301 /sobre /sobre.html
Redirect 301 /contato /trabalhe-conosco.html
Redirect 301 /entre-em-contato /contato.html
```

---

## 6. Trocar as ilustrações por fotos

Nas páginas Home e Sobre há um bloco `<div class="figure-ph">…</div>`.
Para usar uma foto real, substitua o bloco inteiro por:

```html
<figure class="frame frame--tall">
  <img src="assets/img/equipe-cr.jpg"
       alt="Consultores da CR Recursos Humanos em reunião de alinhamento de vaga"
       width="900" height="1125" loading="lazy" decoding="async">
</figure>
```

O `alt` descritivo importa para SEO e acessibilidade. Use imagens em **WebP** quando possível
e mantenha `width`/`height` para evitar deslocamento de layout (CLS).

---

## 7. Animações e interações (assets/js/main.js)

Cada bloco é independente e só roda se o elemento existir na página:

| # | Módulo | O que faz |
|---|---|---|
| 01 | `initYear` | Ano automático no rodapé |
| 02 | `initHeader` | Header fixo que encolhe e se esconde ao rolar para baixo |
| 03 | `initProgress` | Barra dourada de progresso de leitura |
| 04 | `initMobileNav` | Menu em tela cheia, cascata, Esc e foco preso (acessível) |
| 05 | `initReveal` | Revelação ao rolar via `IntersectionObserver` |
| 06 | `initLineReveal` | Título revelado linha a linha |
| 07 | `initCounters` | Contagem animada dos números |
| 08 | `initRotator` | Palavras que se alternam no selo do hero |
| 09 | `initAccordion` | FAQ acessível com altura animada |
| 10 | `initSpotlight` | Brilho que segue o cursor no hero e nos cartões |
| 11 | `initParallax` | Parallax suave nos orbes do fundo |
| 12 | `initTilt` | Inclinação 3D leve no cartão do hero |
| 13 | `initMarquee` | Carrossel infinito de setores, sem emenda |
| 14 | `initBackToTop` | Botão de voltar ao topo |
| 15 | `initPhoneMask` | Máscara `(11) 91234-5678` |
| 16 | `initForms` | Validação campo a campo + envio |
| 17 | `initSmoothAnchors` | Rolagem suave com desconto do header |
| 18 | `initScrollSpy` | Destaque do menu conforme a seção |
| 19 | `initImages` | `loading="lazy"` e `decoding="async"` automáticos |

**Todas as animações respeitam `prefers-reduced-motion`.** Quem configurou o sistema para
reduzir movimento vê o site estático — exigência de acessibilidade.

---

## 8. Personalizar cores e fontes

Tudo está em variáveis CSS no topo do `assets/css/style.css`:

```css
:root{
  --gold-400:#C9A227;   /* dourado principal, tirado do logotipo */
  --ink-900:#080B10;    /* fundo escuro */
  --paper:#FBFAF7;      /* fundo claro */
  --font-display:"Sora", …;          /* títulos */
  --font-body:"Inter", …;            /* texto */
  --font-serif:"Instrument Serif", …;/* palavras em destaque, itálico dourado */
}
```

Mudar `--gold-400` propaga para botões, ícones, links e gradientes do site inteiro.

---

## 9. Qualidade verificada

Rodei uma checagem automatizada em **11 páginas × 5 larguras** (360, 390, 768, 1024, 1440 px):

- ✅ Nenhum link interno quebrado, nenhuma âncora sem destino
- ✅ Nenhum `title` ou `description` duplicado
- ✅ Exatamente um `<h1>` por página
- ✅ Todo JSON-LD válido
- ✅ Nenhum `<img>` sem `alt`, nenhum `<iframe>` sem `title`
- ✅ Todo campo de formulário com `<label for>`
- ✅ **Zero overflow horizontal** em qualquer largura
- ✅ `aria-controls` sempre com destino existente
- ✅ Alvos de toque adequados (restam apenas links inline dentro de frases, isentos pela WCAG 2.5.8)
