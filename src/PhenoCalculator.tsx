// PhenoAgeCalculator.tsx (updated)
// React component with visible validation feedback using React Hook Form + Material UI

import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BIOMARKERS, defaultValues } from "./definitions";
import type { PhenoFormValues } from "./types";

export default function PhenoCalculator() {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange", defaultValues });

  const [result, setResult] = useState<{
    chrono: number;
    pheno: number;
    accel: number;
  } | null>(null);

  /** ---- kalkyl ---- */
  const onSubmit = (data: PhenoFormValues) => {
    // Build a context with WBC first (needed for abs lymph conversion)
    console.log(data);
    const wbcInputRaw = parseFloat(data["wbcValue"]);
    const wbcUnitKey = data["wbcUnit"];
    const wbcModel = BIOMARKERS.find((b) => b.id === "wbc")!
      .units.find((u) => u.value === wbcUnitKey)!
      .toModel(wbcInputRaw);

    // Convert each biomarker to model unit
    const modelVals: Record<string, number> = { wbc: wbcModel };

    BIOMARKERS.forEach((b) => {
      const raw = parseFloat(data[`${b.id}Value`]);
      const unitKey = data[`${b.id}Unit`];
      // debugger;
      const unitObj = b.units.find((u) => u.value === unitKey)!;
      const converted =
        unitObj.toModel.length === 2
          ? unitObj.toModel(raw, { wbc: wbcModel })
          : unitObj.toModel(raw);
      modelVals[b.id] = converted;
    });

    // Age in years
    const ageYears = (() => {
      const diff = Date.now() - new Date(data.birthDate).getTime();
      return diff / (1000 * 60 * 60 * 24 * 365.25);
    })();

    console.log(modelVals);

    // Coefficients (Levine 2018)
    const coef = {
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

    // Linear predictor xb
    const xb =
      coef.albumin * modelVals.albumin +
      coef.creatinine * modelVals.creatinine +
      coef.glucose * modelVals.glucose +
      coef.crp * Math.log(Math.max(modelVals.crp, 0.001)) + // ln(mg/dL)
      coef.lymph * modelVals.lymph +
      coef.mcv * modelVals.mcv +
      coef.rdw * modelVals.rdw +
      coef.alp * modelVals.alp +
      coef.wbc * modelVals.wbc +
      coef.age * ageYears +
      coef.b0;

    // Mortality score & PhenoAge
    const mort =
      1 -
      Math.exp((-Math.exp(xb) * (Math.exp(0.0076927 * 120) - 1)) / 0.0076927);

    const mortSafe = Math.min(Math.max(mort, 1e-12), 0.999999);
    const pheno =
      141.50225 + Math.log(-0.00553 * Math.log(1 - mortSafe)) / 0.090165;

    setResult({ chrono: ageYears, pheno, accel: pheno - ageYears });
  };

  /** ---- render ---- */
  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        PhenoAge-kalkylator
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Födelsedatum */}
        <Controller
          name="birthDate"
          control={control}
          rules={{ required: "Obligatoriskt" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Födelsedatum"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              margin="normal"
              error={!!errors.birthDate}
              helperText={errors.birthDate?.message as string}
            />
          )}
        />

        {/* Biomarker grid */}
        <Grid container spacing={2}>
          {BIOMARKERS.map((b) => (
            <Grid size={{ xs: 12, sm: 6 }} key={b.id}>
              <Controller
                name={`${b.id}Value`}
                control={control}
                rules={{
                  required: "Obligatoriskt",
                  // min: { value: b.min, message: `Min ${b.min}` },
                  // max: { value: b.max, message: `Max ${b.max}` },
                  validate: (v) =>
                    v === "" || isNaN(Number(v)) ? "Måste vara ett tal" : true,
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={b.label}
                    type="number"
                    fullWidth
                    error={!!errors[`${b.id}Value`]}
                    helperText={(errors[`${b.id}Value`] as any)?.message}
                    InputProps={{
                      endAdornment: (
                        <Controller
                          name={`${b.id}Unit`}
                          control={control}
                          render={({ field: unitField }) => (
                            <TextField select {...unitField} variant="standard">
                              {b.units.map((u) => (
                                <MenuItem key={u.value} value={u.value}>
                                  {u.label}
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                        />
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          ))}
        </Grid>

        <Button
          sx={{ mt: 3 }}
          variant="contained"
          color="primary"
          type="submit"
          disabled={!isValid}
        >
          Beräkna
        </Button>
      </Box>

      {result && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Resultat</Typography>
          <Typography>
            Kronologisk ålder: {result.chrono.toFixed(1)} år
          </Typography>
          <Typography>PhenoAge: {result.pheno.toFixed(1)} år</Typography>
          <Typography>
            Skillnad (Accel): {result.accel.toFixed(1)} år
          </Typography>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[{ name: "Accel", värde: result.accel }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="värde"
                fill={result.accel < 0 ? "#4caf50" : "#e53935"}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
}
