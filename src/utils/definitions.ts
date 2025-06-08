import type { BiomarkerDefinition, PhenoFormValues } from "./types";
import {
  gdl_to_gL,
  mgdl_to_mmolL_gluc,
  mgdl_to_umolL,
  mgL_to_mgdl,
  ukatL_to_UL,
} from "./utils";

// Coefficients (Levine 2018)
export const coefficiants = {
  albumin: -0.0336,
  creatinine: 0.0095,
  glucose: 0.1953,
  crp: 0.0954,
  lymph: -0.012,
  mcv: 0.0268,
  rdw: 0.3306,
  alp: 0.0019,
  wbc: 0.0554,
  age: 0.0804,
  b0: -19.9067,
};

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
    label: "Albumin",
    group: "Liver",
    units: [
      { label: "g/L", value: "g_l", toModel: (v) => v, min: 25, max: 55 },
      { label: "g/dL", value: "g_dl", toModel: gdl_to_gL, min: 2.5, max: 5.5 },
    ],
  },
  {
    id: "creatinine",
    label: "Creatinine",
    group: "Kidney",
    units: [
      {
        label: "µmol/L",
        value: "umol_l",
        toModel: (v) => v,
        min: 30,
        max: 200,
      },
      {
        label: "mg/dL",
        value: "mg_dl",
        toModel: mgdl_to_umolL,
        min: 0.3,
        max: 2.3,
      },
    ],
  },
  {
    id: "glucose",
    label: "Glucose",
    group: "Metabolic",
    units: [
      {
        label: "mmol/L",
        value: "mmol_l",
        toModel: (v) => v,
        min: 2.5,
        max: 15,
      },
      {
        label: "mg/dL",
        value: "mg_dl",
        toModel: mgdl_to_mmolL_gluc,
        min: 45,
        max: 270,
      },
    ],
  },
  {
    id: "crp",
    label: "C-reactive protein (CRP)",
    group: "Inflammation",
    units: [
      { label: "mg/L", value: "mg_l", toModel: mgL_to_mgdl, min: 0, max: 20 },
      { label: "mg/dL", value: "mg_dl", toModel: (v) => v, min: 0, max: 2 },
    ],
  },
  {
    id: "alp",
    label: "Alkaline phosphatase (ALP)",
    group: "Liver",
    units: [
      { label: "U/L", value: "u_l", toModel: (v) => v, min: 20, max: 200 },
      {
        label: "µkat/L",
        value: "ukat_l",
        toModel: ukatL_to_UL,
        min: 0.3,
        max: 3.3,
      },
    ],
  },
  {
    id: "lymph",
    label: "Lymphocytes",
    group: "Immune",
    units: [
      { label: "%", value: "pct", toModel: (v) => v, min: 10, max: 60 },
      {
        label: "10^9/L",
        value: "abs",
        toModel: (v, ctx) => (ctx?.wbc ? (v / ctx.wbc) * 100 : NaN),
        min: 0.5,
        max: 6,
      },
    ],
  },
  {
    id: "mcv",
    label: "Mean cell volume (MCV)",
    units: [{ label: "fL", value: "fl", toModel: (v) => v, min: 70, max: 110 }],
    group: "Immune",
  },
  {
    id: "rdw",
    label: "Red cell distribution width	(RDW)",
    units: [{ label: "%", value: "pct", toModel: (v) => v, min: 10, max: 20 }],
    group: "Immune",
  },
  {
    id: "wbc",
    label: "White blood cell count (WBC)",
    group: "Immune",
    units: [
      {
        label: "10^9/L",
        value: "giga",
        toModel: (v) => v,
        min: 2,
        max: 15,
      },
    ],
  },
];
