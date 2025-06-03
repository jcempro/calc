export const _PRMs_ = {
	iof: {
		credito: {
			pf: {
				padrao: {
					teto: 3,
					diario: 0.0082,
					adicional: 0.38,
				},
			},
			pj: {
				padrao: {
					teto: 1.5,
					diario: 0.00559,
					adicional: 0.38,
				},
				simples: {
					ate30000: {
						diario: 0.00137,
						adicional: 0.38,
					},
					maior30000: {
						diario: 0.00559,
						adicional: 0.38,
					},
				},
			},
		},
	},
};
