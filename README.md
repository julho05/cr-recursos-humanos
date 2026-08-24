# CR Recursos Humanos — Site Institucional

Site institucional da **CR Recursos Humanos**, consultoria especializada em
recrutamento e seleção, consultoria de RH, gestão de benefícios e folha de pagamento.

**🔗 Site ao vivo:** https://julho05.github.io/cr-recursos-humanos/

---

## Sobre o projeto

Site estático construído em **HTML, CSS e JavaScript puros** — sem build,
sem dependências e sem framework. Basta subir a pasta inteira para qualquer
hospedagem de arquivos estáticos.

### Páginas

| Página | Arquivo |
|---|---|
| Home | `index.html` |
| Quem somos, valores e metodologia | `sobre.html` |
| Hub de serviços | `servicos.html` |
| Recrutamento e Seleção | `recrutamento-e-selecao.html` |
| Consultoria de RH | `consultoria-de-rh.html` |
| Gestão de Benefícios | `gestao-de-beneficios.html` |
| Folha de Pagamento | `folha-de-pagamento.html` |
| Trabalhe Conosco | `trabalhe-conosco.html` |
| Contato | `contato.html` |
| Política de Privacidade (LGPD) | `politica-de-privacidade.html` |
| Erro 404 | `404.html` |

### Estrutura

```
assets/
├── css/style.css   Design system + estilos de todas as páginas
├── js/main.js      Módulos de interação independentes
└── img/            Logos, favicon e imagem de compartilhamento
```

Inclui `robots.txt`, `sitemap.xml` e `site.webmanifest` para SEO e PWA.

---

## Rodando localmente

Abra o `index.html` direto no navegador, ou sirva a pasta:

```bash
python -m http.server 8000
# depois acesse http://localhost:8000
```

---

## Documentação

A documentação técnica completa — design system, cores, tipografia, módulos de
JavaScript e instruções de publicação — está em [LEIA-ME.md](LEIA-ME.md).
