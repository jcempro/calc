import { Constructor, TFieldType, TTypeDefs, TypeHint, TypeHintNested } from '../scripts/ts/common/evalTypes';
import { Enumerate, TRange100, TValidarNumero, TValidarNumeroCLBack, numberRange } from '../scripts/ts/common/numbers';
import { INumberType, IPercent, Icurrency, TIOF, TIOFC, TIOFP } from '../scripts/ts/common/interfaces';
import { IParams, TIOFPartial, TIOF_PJ } from '../scripts/ts/common/params';
import { Listener, LoadEvent, LoadOptions } from '../scripts/ts/ResourceLoader.types';
import { MatchWithGroups, TupleFromObjectOrdered } from '../scripts/ts/common/generic';
import { Meta } from '../scripts/ts/common/MetaTurple';
import { TComputed, TCreditoAlvo, TCustos, TDemandaCredito, TFinanciado, TFlatTAC, TLiberado, TParcelaRecord, TRCredito } from '../scripts/ts/credito/pj/credito';
import { TDate, TDiaMes } from '../scripts/ts/common/datas';
import { registerType } from '../scripts/ts/common/evalTypes';

registerType({name: "Constructor",  fieldTypes:{

}});
registerType({name: "Enumerate",  fieldTypes:{

}});
registerType({name: "INumberType",  fieldTypes:{
  value: 'number',
}});
registerType({name: "IParams",  fieldTypes:{
  iof: { credito: { pf: { diario: 'any', adicional: 'any', teto: 'any' }, pj: 'any' } },
  custos: { teto: { flat: {  }, tac: {  } } },
}});
registerType({name: "IPercent",  fieldTypes:{
  value: 'number',
}});
registerType({name: "Icurrency",  fieldTypes:{
  value: 'number',
}});
registerType({name: "Listener",  fieldTypes:{

}});
registerType({name: "LoadEvent",  fieldTypes:{
  url: 'string',
  success: 'boolean',
  error: 'any',
  durationMs: 'any',
}});
registerType({name: "LoadOptions",  fieldTypes:{
  timeoutMs: 'any',
  retries: 'any',
  condition: 'any',
}});
registerType({name: "MatchWithGroups",  fieldTypes:{
  groups: { value: 'string' },
  index: 'any',
  input: 'any',
  length: 'number',
}});
registerType({name: "Meta",  fieldTypes:{
  length: 'number',
}});
registerType({name: "TComputed",  fieldTypes:{
  diasUteis: 'number',
  iof: 'any',
  custos: { flat: { v: 'any', teto: 'any' }, tac: { v: 'any', teto: 'any' } },
  i: { datas: { primeira: 'Date', ultima: 'Date' }, pgtoTotal: 'number', pgtoAMais: 'number', maiorParcela: 'number', menorParcela: 'number' },
  extrato: 'any',
}});
registerType({name: "TCreditoAlvo",  fieldTypes:{

}});
registerType({name: "TCustos",  fieldTypes:{
  flat: { v: 'any', teto: 'any' },
  tac: { v: 'any', teto: 'any' },
}});
registerType({name: "TDate",  fieldTypes:{

}});
registerType({name: "TDemandaCredito",  fieldTypes:{
  data_operacao: 'Date',
  diabase: 'any',
  jurosAm: 'any',
  prazoMeses: 'number',
  carenciaDias: 'number',
  custos: { flat: { v: 'any', teto: 'any' }, tac: { v: 'any', teto: 'any' } },
  tipo: 'any',
  jurosNaCarencia: 'boolean',
  simplesn: 'boolean',
}});
registerType({name: "TDiaMes",  fieldTypes:{

}});
registerType({name: "TFieldType",  fieldTypes:{

}});
registerType({name: "TFinanciado",  fieldTypes:{
  financiado: 'any',
}});
registerType({name: "TFlatTAC",  fieldTypes:{
  v: 'any',
  teto: 'any',
}});
registerType({name: "TIOF",  fieldTypes:{
  p: { diario: 'any', adicional: 'any', teto: 'any' },
  c: 'any',
}});
registerType({name: "TIOFC",  fieldTypes:{
  diario: 'any',
  adicional: 'any',
}});
registerType({name: "TIOFP",  fieldTypes:{
  diario: 'any',
  adicional: 'any',
  teto: 'any',
}});
registerType({name: "TIOFPartial",  fieldTypes:{

}});
registerType({name: "TIOF_PJ",  fieldTypes:{
  simples: { ate30000: 'any', maior30000: 'any' },
  diario: 'any',
  adicional: 'any',
  teto: 'any',
}});
registerType({name: "TLiberado",  fieldTypes:{
  liquido: 'any',
}});
registerType({name: "TParcelaRecord",  fieldTypes:{
  amortizacao: 'any',
  juros: 'any',
  pagamento: 'any',
  saldoDevedor: 'any',
  data: 'Date',
  dias: 'number',
}});
registerType({name: "TRCredito",  fieldTypes:{
  data_operacao: 'Date',
  diabase: 'any',
  jurosAm: 'any',
  prazoMeses: 'number',
  carenciaDias: 'number',
  custos: { flat: { v: 'any', teto: 'any' }, tac: { v: 'any', teto: 'any' } },
  tipo: 'any',
  jurosNaCarencia: 'boolean',
  simplesn: 'boolean',
  computed: { diasUteis: 'number', iof: 'any', custos: { flat: { v: 'any', teto: 'any' }, tac: { v: 'any', teto: 'any' } }, i: { datas: { primeira: 'Date', ultima: 'Date' }, pgtoTotal: 'number', pgtoAMais: 'number', maiorParcela: 'number', menorParcela: 'number' }, extrato: 'any' },
}});
registerType({name: "TRange100",  fieldTypes:{

}});
registerType({name: "TTypeDefs",  fieldTypes:{
  name: 'any',
  detalhe: 'any',
}});
registerType({name: "TValidarNumero",  fieldTypes:{

}});
registerType({name: "TValidarNumeroCLBack",  fieldTypes:{

}});
registerType({name: "TupleFromObjectOrdered",  fieldTypes:{
  length: 'number',
}});
registerType({name: "TypeHint",  fieldTypes:{

}});
registerType({name: "TypeHintNested",  fieldTypes:{

}});
registerType({name: "numberRange",  fieldTypes:{

}});
