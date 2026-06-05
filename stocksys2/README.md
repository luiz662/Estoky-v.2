# StockSys — Sistema de Gestão de Estoque

> Sistema de controle de estoque moderno, responsivo e 100% client-side, desenvolvido com HTML5, CSS3 e JavaScript puro.

![StockSys](https://img.shields.io/badge/Status-Online-00ff99?style=flat-square)
![Tech](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20JavaScript-00d4ff?style=flat-square)
![Storage](https://img.shields.io/badge/Storage-localStorage-7b2fff?style=flat-square)
![Dependências](https://img.shields.io/badge/Depend%C3%AAncias-Nenhuma-00ff99?style=flat-square)

---

## Visão Geral

O **StockSys** é um sistema de controle de estoque desenvolvido inteiramente com tecnologias web nativas — sem frameworks, sem backend, sem banco de dados externo. Os dados são persistidos no `localStorage` do navegador, tornando o sistema funcional sem qualquer infraestrutura de servidor.

O design segue uma estética **futurista e tecnológica** com animações Canvas 2D, grade de partículas com conexões dinâmicas, tipografia estilo HUD e paleta neon sobre fundo escuro.

---

## Páginas

| Página | Arquivo | Descrição |
|---|---|---|
| **Home** | `index.html` | Dashboard com KPIs, últimos produtos, gráfico de categorias e ações rápidas |
| **Produtos** | `registro.html` | CRUD completo: cadastrar, editar, excluir e buscar produtos |

---

## Funcionalidades

| Módulo | Descrição |
|---|---|
| **Dashboard** | KPIs em tempo real: total de produtos, categorias ativas, unidades e valor total do inventário |
| **Cadastro de Produtos** | Formulário completo com validação de campos obrigatórios e feedback visual |
| **Edição de Produtos** | Edição inline com pre-preenchimento automático do formulário |
| **Exclusão com Confirmação** | Modal de segurança antes de remover qualquer item |
| **Busca em tempo real** | Filtro instantâneo por nome, código, categoria ou fornecedor |
| **Filtros combinados** | Filtragem por categoria e por status de estoque simultaneamente |
| **Alertas de Estoque** | Indicadores automáticos: Normal 🟢, Estoque Baixo 🟡, Sem Estoque 🔴 |
| **Gráfico de Categorias** | Donut chart desenhado nativamente via Canvas API |
| **Exportação CSV** | Download do inventário completo com encoding UTF-8 (suporte a acentos) |
| **Design Responsivo** | Layout adaptável para mobile, tablet e desktop |
| **Animação de Fundo** | Grade tecnológica com partículas e conexões dinâmicas (Canvas 2D puro) |

---

## Estrutura de Arquivos

```
stocksys/
├── index.html       → Página Home (Dashboard + KPIs)
├── registro.html    → Página de Produtos (CRUD completo)
├── style.css        → Design System (CSS3 com variáveis, Grid, Flexbox, animações)
├── app.js           → Lógica da aplicação (CRUD, localStorage, filtros, exportação)
├── canvas-bg.js     → Animação de fundo (partículas + grade tecnológica)
└── README.md        → Documentação
```

---

## Tecnologias Utilizadas

- **HTML5** — Estrutura semântica com formulários, tabelas e canvas
- **CSS3** — Custom Properties, Grid Layout, Flexbox, animações `@keyframes`, `backdrop-filter`
- **JavaScript ES6+** — Módulos funcionais, Arrow Functions, Template Literals, Destructuring
- **localStorage API** — Persistência de dados no navegador sem backend
- **Canvas 2D API** — Gráfico donut e animação de partículas renderizados nativamente
- **Google Fonts** — Orbitron (HUD), Share Tech Mono (código), Exo 2 (corpo)

---

## Instalação e Uso

### Requisitos
Nenhum. Basta um navegador moderno (Chrome, Firefox, Edge, Safari).

### Rodando localmente

```bash
# Clone ou baixe os arquivos
git clone https://github.com/seu-usuario/stocksys.git
cd stocksys

# Opção 1: VSCode com extensão Live Server
# Clique com botão direito em index.html → "Open with Live Server"

# Opção 2: Node.js
npx serve .

# Opção 3: Python
python -m http.server 3000
```

Acesse `http://localhost:3000` ou abra o `index.html` diretamente no navegador.

---

## Modelo de Dados

Cada produto é armazenado como objeto JSON no `localStorage` sob a chave `stocksys_produtos`:

```json
{
  "id": "abc123xyz",
  "nome": "Monitor 27pol",
  "codigo": "MON-27-001",
  "categoria": "Eletrônicos",
  "unidade": "un",
  "quantidade": 15,
  "minimo": 5,
  "precoCusto": 800.00,
  "precoVenda": 1200.00,
  "fornecedor": "TechSupply Ltda",
  "descricao": "Monitor Full HD IPS 75Hz",
  "criadoEm": "2025-01-15T10:00:00.000Z",
  "atualizadoEm": "2025-01-15T10:00:00.000Z"
}
```

### Campos do Produto

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | string | Auto | ID único gerado automaticamente |
| `nome` | string | ✅ | Nome do produto |
| `codigo` | string | ✅ | Código/SKU único |
| `categoria` | string | ✅ | Categoria do produto |
| `unidade` | string | — | Unidade de medida (un, cx, kg, l, m) |
| `quantidade` | number | ✅ | Quantidade atual em estoque |
| `minimo` | number | — | Limite mínimo para alerta (padrão: 5) |
| `precoCusto` | number | — | Preço de custo |
| `precoVenda` | number | — | Preço de venda |
| `fornecedor` | string | — | Nome do fornecedor |
| `descricao` | string | — | Descrição adicional |
| `criadoEm` | ISO 8601 | Auto | Data/hora de criação |
| `atualizadoEm` | ISO 8601 | Auto | Data/hora da última edição |

---

## Regras de Negócio

### Status de Estoque

| Status | Critério | Badge |
|---|---|---|
| **Normal** | `quantidade > mínimo` | 🟢 Verde |
| **Estoque Baixo** | `0 < quantidade ≤ mínimo` | 🟡 Amarelo |
| **Sem Estoque** | `quantidade = 0` | 🔴 Vermelho |

### Validações

- Código SKU deve ser único (validação contra duplicatas)
- Nome, código, categoria e quantidade são campos obrigatórios
- Quantidade e preços aceitam apenas valores numéricos ≥ 0

---

## Design System

### Paleta de Cores

| Variável CSS | Valor | Uso |
|---|---|---|
| `--accent` | `#00d4ff` | Cor principal, destaques, glow |
| `--accent2` | `#7b2fff` | Cor secundária, categorias |
| `--accent3` | `#00ff99` | Sucesso, status online |
| `--danger` | `#ff3a5e` | Erros, exclusão, sem estoque |
| `--warn` | `#ffb700` | Alertas, estoque baixo |
| `--bg` | `#050a12` | Fundo principal |
| `--bg-card` | `#0b1525` | Fundo de cards/painéis |

### Fontes

| Fonte | Uso |
|---|---|
| Orbitron | Títulos, navbar, labels HUD |
| Share Tech Mono | Código, dados, valores, tabelas |
| Exo 2 | Corpo de texto, descrições |

---

## Exportação CSV

O CSV exportado inclui todos os campos do produto com:
- Encoding UTF-8 com BOM (compatível com Excel)
- Delimitação por vírgula, valores entre aspas duplas
- Nome do arquivo: `stocksys_export_[timestamp].csv`

---

## Arquitetura do Código

```
app.js
├── STORAGE        → getProducts(), saveProducts(), genId()
├── HOME PAGE      → initHome(), updateHomeStats(), renderHomeProductList(), renderCategoryChart()
├── REGISTRO PAGE  → initRegistro(), handleSubmit(), buildProduct(), renderTable()
│                    editProduct(), cancelEdit(), confirmDelete(), closeModal()
│                    populateCategoryFilter()
├── EXPORT         → exportData()
└── UTILITÁRIOS    → getStatus(), val(), setVal(), esc(), showMsg()

canvas-bg.js
├── Partículas     → Geração, movimento e colisão com bordas
├── Conexões       → Linhas dinâmicas entre partículas próximas
├── Grade          → Grid estático de fundo
└── Data Streams   → Efeito de "chuva de dados" vertical
```

---

## Roadmap

- [ ] Histórico de movimentações (entradas e saídas)
- [ ] Relatório de produtos com estoque crítico
- [ ] Importação via CSV
- [ ] Suporte a múltiplos depósitos/localizações
- [ ] Modo PWA (Service Worker + instalação offline)
- [ ] Tema claro alternativo

---

## Licença

MIT License — livre para uso, modificação e distribuição com atribuição.

---

*Desenvolvido com HTML5, CSS3 e JavaScript puro — sem frameworks, sem dependências externas.*
