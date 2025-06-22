/**
 * ContentWrapper Container que envolve o conteúdo da pagina/app.
 *
 * @description
 * Container ContentWrapper
 * @structure
 * ```
 * ├── [ContentWrapper]
 * │     └── (AnyComponent*)
 * ```
 *
 * @integration
 * - Compatibilidade com:
 *   • AnyComponent
 *   • NavIcon
 *   • MenuX / ButtonX
 * - Faz parte da hierarquia da página:
 *   • HeaderZone → ContentWrapper
 * - Suporta qualquer conteúdo estrutural ou semântico.
 * - Extende SectionWrapperBase
 *
 *
 * @style
 * - Arquitetura CSS:
 *   • Base: DaisyUI + Tailwind Variants.
 *   • Wrapper: `section-jcem`.
 *   • Escopo: classes `section-jcem-{escopo}`.
 * - Composição segura com `tailwind-merge` e `clsx`.
 * - Temas:
 *   • Segue os tokens/temas do Tailwind + DaisyUI
 * - Customização:
 *   • Classes podem ser sobrescritas
 * - Estados:
 *   • Controlados via data-attributes e pseudo-classes
 *   • Transições CSS-only
 *
 * @behavior
 * - Prioridades:
 *   1. Acessibilidade (aria-label quando aplicável)
 *   2. Consistência visual (estados :hover, :active , ..., via CSS)
 *   3. Performance (zero JS para estado/animações/transições)
 *
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
 * - Preact + Vite (core)
 * - tailwind-variants + tailwind-merge + clsx
 */
import { JSX } from 'preact';
import {
	ISectionWrapperBase,
	SectionWrapperBase,
} from '@ext/SectionWrapperBase/SectionWrapperBase';

export interface IContentWrapper extends ISectionWrapperBase {}

export function ContentWrapper({
	escopo = 'content',
	stack = false,
	shadow = false,
	container = false,
	className,
	wrapperClass,
	...props
}: IContentWrapper) {
	return (
		<SectionWrapperBase
			as="section"
			escopo={escopo}
			stack={stack}
			shadow={shadow}
			container={container}
			className={`contentwrapper-jcem-className`}
			wrapperClass={wrapperClass}
			{...props}
		/>
	);
}
