import { TIOF } from './interfaces';
import { deserialize } from './evalTypes'
import { registerType } from './evalTypes'

export type TIOFPartial = Partial<TIOF>;

export interface TIOF_PJ extends TIOF {
	simples: {
		ate30000: TIOFPartial;
		maior30000: TIOFPartial;
	};
}

registerType('TIOF_PJ', Object, {
	teto: 'number',
	diario: 'number',
	fixo: 'number',
	simples: {
		ate30000: 'TIOF',      // TIOFPartial = Partial<TIOF> => mesma estrutura
		maior30000: 'TIOF',
	},
});

export interface IParams {
	iof: {
		credito: {
			pf: TIOF;
			pj: TIOF_PJ;
		};
	};
}

registerType('IParams', Object, {
	iof: {
		credito: {
			pf: 'TIOF',
			pj: 'TIOF_PJ',
		},
	},
});

export const _PRMs_: IParams = deserialize<IParams>('IParams', {
	iof: {
		credito: {
			pf: {
				teto: 3,
				diario: 0.0082,
				fixo: 0.38,
			},
			pj: {
				teto: 1.5,
				diario: 0.00559,
				fixo: 0.38,
				simples: {
					ate30000: {
						diario: 0.00137,
						fixo: 0.38,
					},
					maior30000: {
						diario: 0.00559,
						fixo: 0.38,
					},
				},
			},
		},
	},
});
