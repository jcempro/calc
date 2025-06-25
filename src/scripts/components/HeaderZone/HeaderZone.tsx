/**
 * HeaderZone — Moldura do Cabeçalho Principal da Página.
 *
 * @description
 * Container que envolve o HeaderBar e, opcionalmente, breadcrumbs,
 * barras auxiliares, toolbars ou qualquer conteúdo relacionado ao cabeçalho.
 *
 * @structure
 * ```
 * ├── (HeaderZone)  // Pelo menos um destes ↓ deve existir (AnyComponent* ou HeaderBar*)
 * │     ├── (AnyComponent*) // stack
 * │     └── (HeaderBar*)  //^2
 * │           ├── [LeftZone] //^3
 * │           │     ├── (breadcrumbs*) //^2
 * │           │     ├── (AnyComponents*) //^2
 * │           │     └── (ButtonX+/MenuX+)  //^1
 * │           ├── [MiddleZone] //^3
 * │           │     ├── (breadcrumbs*) //^2
 * │           │     ├── (AnyComponents*) //^2
 * │           │     └── (ButtonX+/MenuX+)  //^1
 * │           └── [RightZone] //^3
 * │                 ├── (breadcrumbs*) //^2
 * │                 ├── (AnyComponents*) //^2
 * │                 └── (ButtonX+/MenuX+)  //^1
 * 
 * Legenda:
 * - (A): componente não obrigatório
 * - [A]: exatamente 1 elemento do tipo A
 * - [A+]: 1+ elementos (obrigatório)
 * - [A*]: 0+ elementos (opcional)
 * - [A/B] ou [A] / [B]: OR (pode ter A, B ou ambos)
 * - [A^B] ou [A] ^ [B]: XOR (apenas A ou apenas B)
 * - [AnyComponent]: qualquer componente válido
 * - [breadcrumbs]: readcrumb navigation, que é um elemento de interface do usuário em sites e aplicativos.
 * - //^1: ButtonX/MenuX não podem aparecer sequencialmente fora de NavIcon
 * - //^2: Componentes empilhados verticalmente
 * - //^3: empilhados horizontalmente - ocupam,juntos, toda a área horizontal
 * ```
 *
 * @integration
 * - Composição com:
 *   • HeaderBar
 *   • NavIcon
 *   • MenuX / ButtonX
 * - Faz parte da hierarquia da página:
 *   • HeaderZone → MainZone → FootZone
 *
 * @layout
 * - Modos:
 *   • Fixed: Fixa no topo da página
 *   • Static: Fluxo normal no documento
 * - Largura:
 *   • Full (100%)
 *   • Container (centralizado, máx. 1280px)
 * - Altura:
 *   • Adaptável ao conteúdo
 *   • Pode ser compactado via props
 *
 * @behavior
 * - Responsivo, fluido e adaptável
 * - Suporte a shadow, border e background
 * - Integra temas e skins
 * - Extende SectionWrapperBase
 * 
 * @behavior
 * - Prioridades:
 *   1. Acessibilidade (aria-label quando aplicável)
 *   2. Consistência visual (estados :hover, :active , ..., via CSS)
 *   3. Performance (zero JS para estado/animações/transições)     
 * 
 * @props
 * - `fixed`: boolean (default false)
 * - `shadow`: boolean (default true)
 * - `container`: boolean (default false) → ativa largura limitada
 * - `escopo`: string (namespace de dados e classes)
 * - `className`: classes adicionais
 * - `wrapperClass`: classes do container interno
 *
 * @style
* - Arquitetura CSS:
 *   • Base: DaisyUI + Tailwind Variants.
 *   • Wrapper: `hzone-jcem-`. 
 *   • Escopo: classes `hzone-jcem-{escopo}`.
 *   • Classe base: `hzone-jcem`
 * - Temas:
 *   • Segue os tokens do Tailwind + DaisyUI
 * - Customização:
 *   • Classes podem ser sobrescritas
 * - Estados:
 *   • Controlados via data-attributes e pseudo-classes
 *   • Transições CSS-only
 
 * @development
 * - Mantém consistência total com HeaderBar, NavIcon, ButtonX e MenuX.
 * - Usa helper `resolveClassName()` para tratamento de classes.
 * - Boas práticas:
 *   • Mensagens de log/warn/error via Logger
 *   • Manutenção git-friendly (evitar breaking changes)
 *   • Comentários objetivos para mudanças complexas
 *   • Manter esta documentação no topo código com ajustes mínimos pertinentes
 *   • Comentário de uma única linha preferíveis, exceto quando para jsDoc
 *
 * @dependencies
 * - ButtonX
 * - MenuX
 * - NavIcon
 * - HaederBar
 * - Preact + Vite (core)
 * - ButtonX (botão principal)
 * - NavIcon (container dos itens)
 * - tailwind-variants + tailwind-merge + clsx
 * @see {@link HeaderBar}
 */

import { JSX, toChildArray, VNode } from 'preact';
import { useEffect } from 'preact/hooks';
import {
	SectionWrapperBase,
	ISectionWrapperBase,
} from '../SectionWrapperBase/SectionWrapperBase';
import Logger from '../../ts/utils/logger';

/** Props do HeaderZone */
export interface IHeaderZone
	extends Omit<ISectionWrapperBase, 'as' | 'stack'> {}

/** 🔥 HeaderZone */
export function HeaderZone({
	escopo = 'header',
	shadow = true,
	container = false,
	debug = false,
	children,
	...props
}: IHeaderZone) {
	const parsedChildren = toChildArray(children) as VNode[];

	/** ✅ Validação estrutural */
	useEffect(() => {
		const hasHeaderBar = parsedChildren.some(
			(child) =>
				child &&
				typeof child === 'object' &&
				(child.type as any)?.displayName === 'HeaderBar',
		);

		if (!hasHeaderBar) {
			Logger.warn(
				`[HeaderZone] Nenhum HeaderBar encontrado em escopo "${escopo}". Recomenda-se incluir um HeaderBar para melhor conformidade visual e estrutural.`,
			);
		}
	}, [parsedChildren, escopo]);

	return (
		<SectionWrapperBase
			{...props}
			escopo={escopo}
			as="header"
			stack={true}
			shadow={shadow}
			container={container}
			className="hzone-jcem"
		>
			{children}
		</SectionWrapperBase>
	);
}

HeaderZone.displayName = 'HeaderZone';
