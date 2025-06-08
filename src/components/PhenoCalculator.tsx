import {
  Box,
  Card,
  CardContent,
  CardHeader,
  debounce,
  Divider,
  Grid,
  MenuItem,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { BIOMARKERS, defaultValues } from "../definitions";
import type { PhenoFormValues } from "../utils/types";
import { ResultChart } from "./ResultChart";

export default function PhenoCalculator() {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm({ mode: "onChange", defaultValues });

  const [result, setResult] = useState<{
    chrono: number | undefined;
    pheno: number | undefined;
    accel: number | undefined;
  }>({ chrono: undefined, pheno: undefined, accel: undefined });

  const onSubmit = useCallback((data: PhenoFormValues) => {
    // Build a context with WBC first (needed for abs lymph conversion)
    const wbcInputRaw = parseFloat(data["wbcValue"]);
    const wbcUnitKey = data["wbcUnit"];
    const wbcModel = BIOMARKERS.find((b) => b.id === "wbc")!
      .units.find((u) => u.value === wbcUnitKey)!
      .toModel(wbcInputRaw);

    // Convert each biomarker to model unit
    const modelVals: Record<string, number> = { wbc: wbcModel };

    BIOMARKERS.forEach((b) => {
      const raw = parseFloat(data[`${b.id}Value` as keyof PhenoFormValues]);
      const unitKey = data[`${b.id}Unit` as keyof PhenoFormValues];
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
  }, []);

  const debouncedSubmit = useRef(
    debounce((data: PhenoFormValues) => {
      trigger().then((valid) => {
        if (valid) onSubmit(data);
      });
    }, 300)
  ).current;

  useEffect(() => {
    const subscription = watch((data, { name }) => {
      if (name) debouncedSubmit(data as PhenoFormValues);
    });
    debouncedSubmit(watch());
    return () => subscription.unsubscribe();
  }, [debouncedSubmit, watch, trigger]);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom color="primary">
        PhenoAge calculator
      </Typography>
      <Divider color="primary" />
      <Grid container spacing={4} sx={{ pt: 2 }}>
        <Grid size={{ md: 12, lg: 6 }}>
          <Typography variant="h5" gutterBottom color="primary">
            Biomarkers
          </Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <CardHeader title="Chronological age" />
                  <CardContent>
                    <Controller
                      name="birthDate"
                      control={control}
                      rules={{ required: "Obligatoriskt" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Birth date"
                          type="date"
                          fullWidth
                          margin="normal"
                          error={!!errors.birthDate}
                          helperText={errors.birthDate?.message as string}
                          sx={{ mt: 1, svg: "red", input: "red" }}
                        />
                      )}
                    />
                  </CardContent>
                </Card>
              </Grid>
              {["Kidney", "Metabolic", "Inflammation", "Immune", "Liver"].map(
                (group) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={group}>
                    <Card>
                      <CardHeader title={group} />
                      <CardContent>
                        {BIOMARKERS.filter((b) => b.group === group).map(
                          (b) => {
                            const currentUnit = watch(
                              `${b.id}Unit` as keyof PhenoFormValues
                            );
                            const unitMeta = b.units.find(
                              (u) => u.value === currentUnit
                            );
                            const sliderMin = unitMeta?.min ?? 0;
                            const sliderMax = unitMeta?.max ?? 150;

                            return (
                              <Controller
                                key={b.id}
                                name={`${b.id}Value` as keyof PhenoFormValues}
                                control={control}
                                rules={{
                                  required: "Obligatoriskt",
                                  validate: (v) => {
                                    if (v === "" || isNaN(Number(v)))
                                      return "Måste vara ett tal";
                                    if (unitMeta) {
                                      if (+v < unitMeta.min)
                                        return `Måste vara minst ${unitMeta.min}`;
                                      if (+v > unitMeta.max)
                                        return `Får inte vara större än ${unitMeta.max}`;
                                    }
                                    return true;
                                  },
                                }}
                                render={({ field }) => {
                                  return (
                                    <>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        <TextField
                                          {...field}
                                          label={b.label}
                                          type="number"
                                          fullWidth
                                          margin="dense"
                                          error={
                                            !!errors[
                                              `${b.id}Value` as keyof PhenoFormValues
                                            ]
                                          }
                                          helperText={
                                            (
                                              errors[
                                                `${b.id}Value` as keyof PhenoFormValues
                                              ] as any
                                            )?.message
                                          }
                                        />
                                        <Controller
                                          name={
                                            `${b.id}Unit` as keyof PhenoFormValues
                                          }
                                          control={control}
                                          render={({ field: unitField }) => {
                                            return (
                                              <TextField
                                                select
                                                {...unitField}
                                                label="Enhet"
                                                margin="dense"
                                                sx={{ width: 100, ml: 1 }}
                                              >
                                                {b.units.map((u) => (
                                                  <MenuItem
                                                    key={u.value}
                                                    value={u.value}
                                                  >
                                                    {u.label}
                                                  </MenuItem>
                                                ))}
                                              </TextField>
                                            );
                                          }}
                                        />
                                      </Box>
                                      <Slider
                                        value={Number(field.value)}
                                        onChange={(_, val) =>
                                          field.onChange(val)
                                        }
                                        min={sliderMin}
                                        max={sliderMax}
                                        step={0.1}
                                        valueLabelDisplay="auto"
                                        marks={[
                                          {
                                            value: sliderMin,
                                            label: `${sliderMin}`,
                                          },
                                          {
                                            value: sliderMax,
                                            label: `${sliderMax}`,
                                          },
                                        ]}
                                        sx={{ mt: 1 }}
                                      />
                                    </>
                                  );
                                }}
                              />
                            );
                          }
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )
              )}
            </Grid>
          </Box>
        </Grid>
        <Grid size={{ md: 12, lg: 6 }}>
          <Typography variant="h5" gutterBottom color="primary">
            Results
          </Typography>
          <Card>
            <CardContent>
              <Grid
                container
                spacing={2}
                direction={"column"}
                justifyContent={"center"}
              >
                <Typography variant="h5" align="center">
                  Chronological age
                </Typography>
                <Typography align="center">
                  {result.chrono?.toFixed(1) ?? "-"} years
                </Typography>
                <Typography variant="h5" align="center">
                  PhenoAge
                </Typography>
                <Typography align="center">
                  {result.pheno?.toFixed(1) ?? "-"} years
                </Typography>

                <ResultChart accel={result.accel ?? 0} />
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
