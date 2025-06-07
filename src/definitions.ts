import type { BiomarkerDefinition, PhenoFormValues } from "./types";
import {
  gdl_to_gL,
  mgdl_to_mmolL_gluc,
  mgdl_to_umolL,
  mgL_to_mgdl,
  ukatL_to_UL,
} from "./utils";

export const defaultValues: PhenoFormValues = {
  albuminValue: "42",
  albuminUnit: "g_l",
  alpValue: "0.93",
  alpUnit: "ukat_l",
  birthDate: "1990-12-26",
  creatinineValue: "60",
  creatinineUnit: "umol_l",
  crpValue: "0.2",
  crpUnit: "mg_l",
  glucoseValue: "4.9",
  glucoseUnit: "mmol_l",
  lymphValue: "40",
  lymphUnit: "pct",
  mcvValue: "101",
  mcvUnit: "fl",
  rdwValue: "12.6",
  rdwUnit: "pct",
  wbcValue: "3.5",
  wbcUnit: "giga",
};

export const BIOMARKERS: BiomarkerDefinition[] = [
  {
    id: "albumin",
    units: [
      { label: "g/L", value: "g_l", toModel: (v: number) => v }, // modell-enhet direkt
      { label: "g/dL", value: "g_dl", toModel: gdl_to_gL },
    ],
    label: "albumin",
  },
  {
    id: "creatinine",
    units: [
      { label: "µmol/L", value: "umol_l", toModel: (v: number) => v },
      { label: "mg/dL", value: "mg_dl", toModel: mgdl_to_umolL },
    ],
    label: "creatinine",
  },
  {
    id: "glucose",
    units: [
      { label: "mmol/L", value: "mmol_l", toModel: (v: number) => v },
      { label: "mg/dL", value: "mg_dl", toModel: mgdl_to_mmolL_gluc },
    ],
    label: "glucose",
  },
  {
    id: "crp",
    units: [
      { label: "mg/L", value: "mg_l", toModel: mgL_to_mgdl }, // ln tas senare
      { label: "mg/dL", value: "mg_dl", toModel: (v: number) => v },
    ],
    label: "crp",
  },
  {
    id: "alp",
    units: [
      { label: "U/L", value: "u_l", toModel: (v: number) => v },
      { label: "µkat/L", value: "ukat_l", toModel: ukatL_to_UL },
    ],
    label: "ALP",
  },

  {
    id: "lymph",
    label: "Lymfocyter",
    units: [
      { label: "%", value: "pct", toModel: (v: number) => v }, // direkt i %
      {
        label: "10^9/L",
        value: "abs", // abs-antal ➜ %
        toModel: (v: number, ctx?: any) =>
          ctx?.wbc ? (v / ctx.wbc) * 100 : NaN,
      },
    ],
  },
  {
    id: "mcv",
    label: "MCV (fL)",
    units: [{ label: "fL", value: "fl", toModel: (v: number) => v }],
  },
  {
    id: "rdw",
    label: "RDW (%)",
    units: [{ label: "%", value: "pct", toModel: (v: number) => v }],
  },
  {
    id: "alp",
    label: "ALP",
    units: [
      { label: "U/L", value: "u_l", toModel: (v: number) => v }, // koefficient → U/L
      { label: "µkat/L", value: "ukat_l", toModel: ukatL_to_UL },
    ],
  },
  {
    id: "wbc",
    label: "WBC (vita)",
    units: [{ label: "10^9/L", value: "giga", toModel: (v: number) => v }], // modell-enhet
  },
];
