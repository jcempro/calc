# 🗂️ Documentação de Layout e Componentes UI

<img src="ui.svg" alt="Diagrama Layout" style="max-height:30vh;">

## 🔷 Arquitetura Geral

Toda a interface é composta pelo componente raiz `PageZone`.

O `PageZone` pode conter os seguintes subcomponentes:

- `[1] HeaderZone` (máximo 1)
- `[2] NavIcon` (máximo 2)
- `[3] FootZone` (máximo 1)
- `[4] ContentWrapper` (máximo 1, permite nesting infinito de `PageZone`)

### 📜 Layout em texto

- Layout geral:

```
[PageZone]
├── (HeaderZone)  // Pelo menos um destes ↓ deve existir (AnyComponent* ou HeaderBar*)
│     ├── (AnyComponent*) // stack
│     └── (HeaderBar*)  //^2
│           ├── [LeftZone] //^3
│           │     ├── (breadcrumbs*) //^2
│           │     ├── (AnyComponents*) //^2
│           │     └── (ButtonX+/MenuX+)  //^1
│           ├── [MiddleZone] //^3
│           │     ├── (breadcrumbs*) //^2
│           │     ├── (AnyComponents*) //^2
│           │     └── (ButtonX+/MenuX+)  //^1
│           └── [RightZone] //^3
│                 ├── (breadcrumbs*) //^2
│                 ├── (AnyComponents*) //^2
│                 └── (ButtonX+/MenuX+)  //^1
├── EnclosureContent
│   ├── (NavIcon)  // left
│   │     └── [ButtonX+]
│   ├── ContentWrapper   [obrigatório]
│   │    └── (PageZone) ^ [AnyComponent+]  // XOR
│   └── (NavIcon) // right
│         └── [ButtonX+]
└── (FooterZone)
      └── [AnyComponent+]  //#2
```

#### Em designer:

```
+----------------------------------+
| [PageZone]                       |
| ╔══════════════════════════════╗ |
| ║ [HeaderZone]                 ║ |
| ║ • [AnyComponent*] (V)        ║ |
| ║ • [HeaderBar*]:              ║ |
| ║   > [LftZ][MidZ][RgtZ]       ║ |
| ║   >> [ButonX*]/[MenuX*]...   ║ |
| ╚══════════════════════════════╝ |
| ╔══════════════════════════════╗ |
| ║ [EnclosureContent]           ║ |
| ║┌─────┐ +────────────+ ┌─────┐║ |
| ║│[NAV]│ |[ContentWr] │ │[NAV]│║ |
| ║│ •BX │ | •(PageZ)^  │ │ •BX │║ |
| ║│ •BX │ | •[AnyComp+]│ │ •BX │║ |
| ║└─────┘ +────────────+ └─────┘║ |
| ╚══════════════════════════════╝ |
| ╔══════════════════════════════╗ |
| ║ [FooterZone]                 ║ |
| ║ • [AnyComponent+] (V)        ║ |
| ╚══════════════════════════════╝ |
+----------------------------------+
```

#### Legenda:

```
- (A): componente não obrigatório
- [A]: exatamente 1 elemento do tipo A
- [A+]: 1+ elementos (obrigatório)
- [A*]: 0+ elementos (opcional)
- [A/B] ou [A] / [B]: OR (pode ter A, B ou ambos)
- [A^B] ou [A] ^ [B]: XOR (apenas A ou apenas B)
- [AnyComponent]: qualquer componente válido
- [breadcrumbs]: readcrumb navigation, que é um elemento de interface do usuário em sites e aplicativos.
- //#1: ButtonX/MenuX não podem aparecer sequencialmente fora de NavIcon
- //#2: Componentes empilhados verticalmente
- //#3: empilhados horizontalmente - ocupam,juntos, toda a área horizontal
```

#### 🧩 Fluxograma de Composição

```mermaid
graph LR
    %% Nó raiz
    P([PageZone])

    %% Subgrupos
    subgraph HeaderZone
        H[HeaderZone]
        T[HeaderBar]
        L[Left Zone]
        M[Middle Zone]
        R[Right Zone]
    end

    subgraph EnclosureContent
        E[EnclosureContent]
        N[Navicon]
        C[ContentWrapper]
    end

    A[AnyContent]

    subgraph Actions
        B[ButtonX]
        X[MenuX]
    end

    F[FootZone]

    %% Hubs invisíveis
    Hub[" "]
    Hub2[" "]

    %% Ligações principais
    P --> H
    P --> E
    P --> F

    %% Header detalhado
    H --> T
    T --> L
    T --> M
    T --> R

    %% EnclosureContent detalhado
    E --> N
    E --> C
    C --> A
    C -.-> P

    N --> Hub2
    Hub2 --> B
    Hub2 --> X

    %% Footer
    F --> A

    %% Convergência única (L, M, R → Hub → A, X, B)
    L --> Hub
    M --> Hub
    R --> Hub
    Hub --> A
    Hub --> X
    Hub --> B
```

## 🔍 Overflow

- `HeaderBar` e `NavIcon` **não usam scroll**.
- Overflow tratado com submenus ou agrupamentos de forma automática.

---

## Desenvolvimento

### Estilos

- Totalmente CSS/SCSS/DaisyUI.
- Transições suaves e rápidas.
- Estados controlados via CSS puro (`input`, `:checked`, `:has`, `data-*`, `:focus`,...).

### Prioridades

- Acessibilidade (aria-label quando aplicável)
- Performance (zero JS para estado/animações/transições)
- Usa helper `resolveClassName()` para tratamento de classes
- Componentes removem duplicidade e conflitos de estilos (DaisyUI ou classes)

## Icones

- Font: fontawesome, incluindo brands, regular e solids.
- Uso de @fortawesome/react-fontawesome;
- Se ícone fornecido como string: interprete para lidar corretamente, mas emita logger.warn.

### Boas práticas

- Mensagens de log/warn/error via `Logger`
- Manutenção git-friendly (evitar breaking changes)
- Comentários objetivos para mudanças complexas
- Manter a documentação de topo do código com ajustes mínimos e pontuais quando necessários
- Comentários de uma única linha são preferíveis, exceto quando para jsDoc
- Todos os componentes permitem sobrescrever estilos (DaisyUI ou classes)
- Layout otimizado para modularidade, performance e clareza de estados

### Projeto base

- DaisyUI
- `tailwind-merge`
- `tailwind-variants`
- `clsx`
- `.tsx`
- `PeacJS`
- `vite`
- `TypeScript`
