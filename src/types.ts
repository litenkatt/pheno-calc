export interface BiomarkerDefinition {
  id: string;
  label: string;
  units: {
    label: string;
    value: string;
    toModel: (v: number, ctx?: any) => number;
  }[];
}

export interface PhenoFormValues {
  birthDate: string;
  albuminValue: string;
  albuminUnit: string;
  creatinineValue: string;
  creatinineUnit: string;
  glucoseValue: string;
  glucoseUnit: string;
  crpValue: string;
  crpUnit: string;
  lymphValue: string;
  lymphUnit: string;
  mcvValue: string;
  mcvUnit: string;
  rdwValue: string;
  rdwUnit: string;
  alpValue: string;
  alpUnit: string;
  wbcValue: string;
  wbcUnit: string;
}
