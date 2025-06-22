eu criei uma imagem que ilustra o layout padrão de página, bem como de componentes, e elenquei o que achei que explica o funcionamento (veja se algo ficou obscuro). Você pode otimizar a explicação, usando junto a imagem de referencia, analise ele junto com o texto abaixo:

Todos os componentes são em tsx e sua estilização, mudança visual ou animações são puramente css/scc exceto, e somente se, tal animação ou estilização não for possível de implementação em css/scc (DaisyUI). Todos os componentes usam DaisyUI e permitir sobrescrever a estilização ou adicionar novas. Todos eles tratam a estilização para evitar duplicação e incompatibilidades entre os estilos fornecidos. Transição de estados são animadas de forma suave e elegante mas rápida em tempo. Tanbto quanto possível, estados são tratadas diretamente via seletores, com input, usando puro DaisyUI ou css.

[0] Page: é um componente pai, que pode ou não conter cada um dos subcomponentes: até um único[1] HeaderZone; até dois [2] NavIcon; até um único FootZone e até um único ContentWrapper;

[1] HeaderZone: um componente que possui altura flexível conforme conteúdo. Ele é uma lista empilhada de componentes HeaderBar.

[2] NavIcon: é uma barra de ferramentas de estilo tradicional (lista de ícones/botões), exibida horizontalmente ou verticalmente; e em modo vertical pode ou não ser fixado nas laterais. É expansível/retrátil - este modo deve ser habilitado. Se habilitado, ao expandir, os componente do ButtonX presentes nela terão uma versão completa mais ampla, tornando a barra também mais larga. No modo horizontal, o NavIcon não muda de largura, apenas os botões (ButtonX). A influência da expansão sobre a NavIcon e sobre os ButtonX inseridos nela, sempre será em puro css/scss, usando seletor de estado de estado (input), isso significa que ButtonX deve saber lidar com isso.

[3] FooZone é um componente genérico, semelhante a ContentWrapper.

HeaderBar: é um componente que tem lor objetivo ser um cabeçalho genérico e customizável, possuindo trez subzonas horizontais, left, Middle e right. Ele pode conter, uma barra horizonta de ferramentas ([2] NavIcon) em qualquer de suas subzonas. Qual quer das subzonas podem conter outros componentes, tais como um componente de busca, ou texto. A subzona left e seu conteúdo sempre são alinhados à esquerda, subzona right e seu conteúdo sempre alinhados à direita, e a subzona middle ocupa a diferença de espaço central, com seu conteúdo podendo ser pode ser alinhado à esquerda, direita ou centralizado. Um HeaderBar pode ser marcado via propriedade como sempre visível. Neste caso, de forma suave, quanto o topo deste componente atingir o topo da janela, ele fica fixável, sem porém causar um salto do scrool deixar seu espaço dentro do conteúdo – ou seja, ele deve ficar fixado no topo sem que sua ausência relativa influencia no tamanho do scroll. Caso mais de um headerBar seja marcado com sempre visível ele será fixado na mesma ordem e imediatamente abaixo do headerBar anterior que esteja marcado como sempre visível.

ButtonX: botão genérico, customizável, totalmente e automaticamente responsível, formado opcionalmente por: um ícone à esquerda (lefticon); um texto (caption) e um ícone à direita (righticon). Righticon somente pode existir se caption for informado. Por padrão tanto lefticone como caption são alinhados à esquerda, mas caso opção seja fornecido parâmetro ficam alinhados no centro. Se somente lefticon for fornecido ou estiver visível, então o alinhamento é no centro. O Botão deve ser capaz de lida com o modo expansível do componente NavIcon. Ele possui um modo que segue estilo inline, em que ele ocupa apenas a largura necessária, e um modo full, em que ele e todos os seus irmãos (filhos do mesmo componente pai) ocupam o mesmo tamanho (como um lista de menu suspenso) – em tal modo, a largura pode ser fixada, limitada ao máximo (e neste caso o irmão com maior largura é que definirá a largura de todos.

Explicação 1: HeaderBar não empilha verticalmente left, midle e right, mas os distribui horizontalmente. Os HeaderBar se fixam na mesma ordem em que foram empilhados. O headerBar deve ser capaz de identificar quanto todos os seus subcomponentes e elementos não cabem na largura. Por isso, o uso de um seletor (preferencialmente input) para identificar que o espaço não é suficiente deve ser ser ativado - o mesmo vale para NavIcon (no modo horizontal), no vertical ele se expande aumentando o scroll da página.

Explicação 2: Importante notar que embora ButtonX use um label, isso nem sempre é verdade. Portando ao definir NaviCon como expansível perceba que ele não deve lidar com label, mas com o componente Button.X Lembre-se do histórico da nossa conversa, incluindo a imagem que te mandei.

Explicação 3: ao gerar a documentação, para especificar o especifique o layout, gere a documentação de forma suscinto, objetivo, curta, mas ao mesmo tempo com todos os recursos/detalhes devidamente explicados e compreensível para humanos e IA;

Adendo 4: ao gerar documentação: imagens, fluxogramas e outros são bem vindos.

adendo 5: CotendWrapper pode conter Page, ou seja PAGE pode (na teoria) aceita ficar nested ao infinito.

Adendo 6: tanto contendWrapper e Footzone podem conter qualquer outros componente não especificados -> \*

Adendo 7: NavIcon no modo horizontal tem 3 formas de tamanho: ou ocupa todo o espaço horizontal disponibilizado para ela, ou ocupa uma largura fixa passada como parâmetro (mas responsível), ou ou ocupa a largura necessária para seus subcomponentes.

Adendo 8: ButonX estrutura é "[LeftIcon]? [Caption]? [RightIcon]?" e, rightIcon sempre fica alinhado à direita.

Adendo 9: ao gerar documentação: mostre a estrutura no estilo "[LeftIcon]? [Caption]? [RightIcon]?"

Adendo 10: NavIcon e HeadBar nunca exibirão scrollbar, ele devem tratar overflow de forma diferente (com criação de submenus por exemplo)

Adendo 11: ao gerar documentação, gere diagrama de layout por texto - mas com cautela por conta do espaço - talvez imagem ou svg seja melhor em alguns casos.

Adendo 12: Não gere códigos de implantação de nenhum tipo (css, scss, js, ts, ...)

Adendo 13: ao gerar documentação: evite explicações que gerem dubiedade ou má compreensão (por similaridade, pressupostos ou comparações incorretas).

adendo 14: quando gerar a documentação, sempre a gere em código .md com link para download.

adendo 15: quando eu digo via input, é via input ou outro método css puro que viabilize isso.

adendo 16: ao gerar a documentação, preveja e ajuste lacunas conceituais, seja explicito e tente ser mais gráfico/explicativo.
