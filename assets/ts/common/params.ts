import { TIOFP } from './interfaces';
import { deserialize } from './evalTypes';
import { registerType } from './evalTypes';
import { TCurrency, TNumberTypes } from './numbers';

export type TIOFPartial = Partial<TIOFP>;

export interface TIOF_PJ extends TIOFP {
	simples: {
		ate30000: TIOFPartial;
		maior30000: TIOFPartial;
	};
}

export interface IParams {
	iof: {
		credito: {
			pf: TIOFP;
			pj: TIOF_PJ;
		};
	};
	custos: {
		teto: {
			flat: {
				[k: string]: TNumberTypes;
			};
			tac: {
				[k: string]: TNumberTypes;
			};
		};
	};
}

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
	custos: {
		teto: {
			tac: {},
			flat: {},
		},
	},
});
