export interface BiomarkerDefinition {
  id: string;
  label: string;
  group: "Immune" | "Liver" | "Kidney" | "Metabolic" | "Inflammation";
  units: {
    label: string;
    value: string;
    toModel: (v: number, ctx?: any) => number;
    min: number;
    max: number;
  }[];
}

export interface PhenoFormValues {
  birthDate: string;
  albuminValue: string;
  albuminUnit: "g_l" | "g_dl";
  creatinineValue: string;
  creatinineUnit: "umol_l" | "mg_dl";
  glucoseValue: string;
  glucoseUnit: "mg_dl" | "mmol_l";
  crpValue: string;
  crpUnit: "mg_l" | "mg_dl";
  lymphValue: string;
  lymphUnit: "pct" | "abs";
  mcvValue: string;
  mcvUnit: "fl";
  rdwValue: string;
  rdwUnit: "pct";
  alpValue: string;
  alpUnit: "ukat_l";
  wbcValue: string;
  wbcUnit: "giga";
}
