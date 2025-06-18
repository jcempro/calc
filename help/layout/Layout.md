# 🗂️ Documentação de Layout e Componentes UI

![Diagrama Layout](ui.svg)

## 🔷 Arquitetura Geral

LEGENDA:
• [icon] = ButtonX ([🅲]? [Caption]? [🅲]?)
• HEADERBAR: Fixação no scroll via position: sticky
• NAVICON: Overflow → submenus (sem scrollbars)
• Hierarquia: Page > (HeaderZone > HeaderBar) > NavIcon > ButtonX > ContentWrapper > Page (recursivo)

Toda a interface é composta pelo componente raiz `PageZone`.

O `PageZone` pode conter os seguintes subcomponentes:

- `[1] HeaderZone` (máximo 1)
- `[2] NavIcon` (máximo 2)
- `[3] FootZone` (máximo 1)
- `[4] ContentWrapper` (máximo 1, permite nesting infinito de `PageZone`)

---

graph TD
A[PageZone] --> B[HeaderZone]
A --> C[NavIcon]
A --> D[ContentWrapper]
A --> E[FootZone]
B --> F[HeaderBar]
F --> G[Left Zone]
F --> H[Middle Zone]
F --> I[Right Zone]
C --> J[ButtonX]
D --> A

## 🔹 Componentes Principais

### `[0] PageZone`

> Contêiner pai da interface.
> **Comporta:**

- Até 1 `HeaderZone`
- Até 2 `NavIcon` (horizontal ou vertical)
- Até 1 `FootZone`
- Até 1 `ContentWrapper` (que pode conter outro `PageZone` recursivamente)

### `[1] HeaderZone`

> Área de cabeçalho.

- Lista empilhável verticalmente de `HeaderBar`.
- Altura dinâmica, conforme conteúdo.

### `HeaderBar`

> Cabeçalho horizontal com 3 zonas:

- **Left:** alinhado à esquerda.
- **Middle:** ocupa o centro (conteúdo centralizado, à esquerda ou direita).
- **Right:** alinhado à direita.

**Funcionalidades:**

- Suporta `NavIcon` (horizontal) em qualquer zona.
- Suporta qualquer outro componente (`*`).
- Pode ser "**sempre visível**", fixando no topo ao rolar, sem alterar o scroll.
- Múltiplos `HeaderBar` fixados se empilham na ordem.
- Overflow tratado via submenus, sem scroll horizontal.

### `[2] NavIcon`

> Barra de ferramentas (`ButtonX`), com modos:

- **Vertical:** fixa ou flutuante, expansível/retrátil (aumenta largura).
- **Horizontal:** não muda largura, mas ajusta o layout dos botões.

**Largura no Horizontal:**

- 100% do espaço disponível.
- Largura fixa (responsiva).
- Largura mínima necessária.

**Overflow:** Nunca usa scrollbar, resolve via submenus.

### `[3] FootZone`

> Área de rodapé, idêntica ao `ContentWrapper`.

- Pode conter qualquer outro componente (`*`).

### `[4] ContentWrapper`

> Área de conteúdo principal.

- Aceita qualquer componente (`*`), inclusive outro `PageZone` (nesting infinito).

---

## 🔘 Componente Auxiliar

### `ButtonX`

> Botão genérico, responsivo e customizável.

**Estrutura:** `[LeftIcon]? [Caption]? [RightIcon]?`

- `RightIcon` só aparece se `Caption` estiver presente.

**Alinhamento:**

- `LeftIcon` + `Caption` → esquerda (padrão) ou centralizado (opcional).
- Apenas `LeftIcon` → centralizado.
- `RightIcon` → sempre à direita.

**Modos de layout:**

- **Inline:** ocupa o espaço necessário.
- **Full:** todos os irmãos com mesma largura (fixa ou baseada no maior).

**Compatível com expansão de `NavIcon`.**

---

## 🔧 Animações e Estados

- Totalmente CSS/SCSS/DaisyUI.
- Transições suaves e rápidas.
- Estados controlados via CSS puro (`input` ou similar).
- Sem uso de JS para estilos (salvo quando impossível por CSS).

---

## 📜 Diagrama Texto (Layout)

```
[PageZone]
 ├── [HeaderZone]
 │     ├── [HeaderBar]
 │     ├── [HeaderBar] (opcional)
 │     └── ...
 ├── [NavIcon] (esquerda ou direita, até 2)
 ├── [ContentWrapper]
 │     └── [PageZone] (opcional, permite nesting infinito)
 └── [FootZone] (opcional)
```

---

## 🔍 Overflow

- `HeaderBar` e `NavIcon` **não usam scroll**.
- Overflow tratado com submenus ou agrupamentos.

---

## ✔️ Regras Gerais

- Todos os componentes permitem sobrescrever estilos (DaisyUI ou classes).
- `ContentWrapper` e `FootZone` aceitam qualquer componente (`*`).
- Layout otimizado para modularidade, performance e clareza de estados.
