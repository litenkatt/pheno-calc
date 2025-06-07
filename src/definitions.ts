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
    label: "Albumin",
    units: [
      { label: "g/L", value: "g_l", toModel: (v) => v, min: 25, max: 55 },
      { label: "g/dL", value: "g_dl", toModel: gdl_to_gL, min: 2.5, max: 5.5 },
    ],
  },
  {
    id: "creatinine",
    label: "Kreatinin",
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
    label: "Glukos",
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
    label: "CRP (hs)",
    units: [
      { label: "mg/L", value: "mg_l", toModel: mgL_to_mgdl, min: 0, max: 20 },
      { label: "mg/dL", value: "mg_dl", toModel: (v) => v, min: 0, max: 2 },
    ],
  },
  {
    id: "alp",
    label: "ALP",
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
    label: "Lymfocyter",
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
    label: "MCV (fL)",
    units: [{ label: "fL", value: "fl", toModel: (v) => v, min: 70, max: 110 }],
  },
  {
    id: "rdw",
    label: "RDW (%)",
    units: [{ label: "%", value: "pct", toModel: (v) => v, min: 10, max: 20 }],
  },
  {
    id: "wbc",
    label: "WBC (vita)",
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
