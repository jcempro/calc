/**
 * FooterZone — Moldura do Rodapé da Página.
 *
 * @description
 * Container destinado ao rodapé da página. Pode conter toolbars,
 * botões, informações institucionais, links, copyright ou
 * qualquer conteúdo relacionado ao footer.
 *
 * @structure
 * ```
 * ├── (FooterZone)
 * │     └── [AnyComponent+]
 * ```
 *
 * @integration
 * - Compatibilidade com:
 *   • AnyComponent
 *   • NavIcon
 *   • MenuX / ButtonX
 * - Faz parte da hierarquia da página:
 *   • HeaderZone → ContentWrapper → FooterZone
 * - Extende SectionWrapperBase
 *
 * @layout
 * - Modos:
 *   • Fixed: Fixa no rodapé (opcional)
 *   • Static: Fluxo normal no documento (padrão) mas força ficar alinhado ao bottom da janela visível quando conteúdo for insuficiente
 * - Largura:
 *   • Full (100%)
 *   • Container (centralizado, máx. 1280px)
 * - Altura:
 *   • Adaptável ao conteúdo
 *
 * @style
 * - Arquitetura CSS:
 *   • Base: DaisyUI + Tailwind Variants.
 *   • Wrapper: `footer-jcem`.
 *   • Escopo: classes `footer-jcem-{escopo}`.
 * - Composição segura com `tailwind-merge` e `clsx`.
 * - Temas:
 *   • Segue os tokens/temas do Tailwind + DaisyUI
 * - Customização:
 *   • Classes podem ser sobrescritas
 * - Estados:
 *   • Controlados via data-attributes e pseudo-classes
 *   • Transições CSS-only
 *
 * @props
 * - `shadow`: boolean (default true)
 * - `container`: boolean (default false) → ativa largura limitada
 * - `escopo`: string (namespace de dados e classes)
 * - `className`: classes adicionais
 * - `wrapperClass`: classes do container interno
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
import {
	SectionWrapperBase,
	ISectionWrapperBase,
} from '../SectionWrapperBase/SectionWrapperBase';

/** Props do FooterZone */
export interface IFooterZone
	extends Omit<ISectionWrapperBase, 'as' | 'stack'> {}

/** 🔥 FooterZone */
export function FooterZone({
	escopo = 'footer',
	shadow = true,
	container = false,
	debug = false,
	children,
	...props
}: IFooterZone) {
	return (
		<SectionWrapperBase
			{...props}
			escopo={escopo}
			as="footer"
			stack={true}
			shadow={shadow}
			container={container}
			className="fzone-jcem"
			debug={debug}
		>
			{children}
		</SectionWrapperBase>
	);
}

FooterZone.displayName = 'FooterZone';
