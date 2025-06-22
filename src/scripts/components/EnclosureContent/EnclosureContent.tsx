/**
 * enclousure — Wrapper de Conteúdo com NavIcon Laterais.
 *
 * @description
 * Controla o layout de navegação lateral (NavIcon) e conteúdo principal,
 * garantindo altura mínima para que FooterZone fique alinhado ao bottom da janela,
 * mesmo quando o conteúdo é insuficiente.
 *
 * @structure
 * ```
 * ├── EnclosureContent
 * │   ├── (NavIcon)  // left
 * │   │     └── [ButtonX+]
 * │   ├── ContentWrapper   [obrigatório]
 * │   │    └── (PageZone) ⊕ [AnyComponent+]  // XOR
 * │   └── (NavIcon) // right
 * │         └── [ButtonX+]
 * ```
 *
 * @behavior
 * - Prioridades:
 *   1. Acessibilidade (aria-label quando aplicável)
 *   2. Consistência visual (estados :hover, :active , ..., via CSS)
 *   3. Performance (zero JS para estado/animações/transições)
 * - Se nenhum Nav → ocupa 100%
 * - Se 1 Nav → content se adapta
 * - Se 2 Nav → content centralizado entre eles
 * - Altura mínima: sempre preenche até a base da janela visível
 * - NavIcon: sempre ocupa 100% da altura disponível do conteúdo
 *
 * @style
 * - Wrapper: `enclousure-jcem`
 * - Arquitetura CSS:
 *   • DaisyUI + Tailwind Variants + Tailwind Merge + clsx
 *   • Totalmente responsivo
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
 * - MenuX
 * - NavIcon
 * - HaederBar
 * - Preact + Vite (core)
 * - ButtonX (botão principal)
 * - NavIcon (container dos itens)
 * - tailwind-variants + tailwind-merge + clsx
 */
import { ComponentChildren } from 'preact';

export interface IEnclosureContent {
	navLeft?: ComponentChildren;
	navRight?: ComponentChildren;
	children: ComponentChildren;
}

export function EnclosureContent({
	navLeft,
	navRight,
	children,
}: IEnclosureContent) {
	return (
		<section class="enclousure-jcem flex w-full flex-1 min-h-full gap-2">
			{/* Nav Esquerda */}
			{navLeft && <>{navLeft}</>}

			{/* Conteúdo */}
			<div class="flex-grow">{children}</div>

			{/* Nav Direita */}
			{navRight && <> {navRight} </>}
		</section>
	);
}
