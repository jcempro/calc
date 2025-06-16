// scss.d.ts
declare module '*.scss' {
	const content: { [className: string]: string };
	export default content;
}

declare namespace sass {
	interface Compiler {
		// Adicione esta linha para reconhecer @apply
		__apply: any;
	}
}
