"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import vehicles from "@/data/vehicles.json";

type Variant = {
  name: string;
  otr: number;
  rebate: number;
  range: number;
  battery: number | null;
  chargeCost?: number;
  maxChargePower?: string;
};

const CHARGER_TYPES = [
  { label: "3-Pin Plug", power: 3, type: "ac", desc: "Standard outlet" },
  { label: "Wallbox", power: 7, type: "ac", desc: "Home charger" },
  { label: "AC Public", power: 22, type: "ac", desc: "Shopping mall" },
  { label: "DC Fast", power: 60, type: "dc", desc: "Fast charger" },
  { label: "DC Ultra-fast", power: 180, type: "dc", desc: "Ultra-fast" },
];

const AC_MAX = 7; // Most BYD cars in Malaysia have 7kW onboard AC charger

function parseDCWatts(val: string | undefined): number {
  if (!val) return 50; // fallback
  const num = parseFloat(val);
  return isNaN(num) ? 50 : num;
}

function formatDuration(hours: number): string {
  if (hours < 1) {
    const mins = Math.round(hours * 60);
    return `${mins} min`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function ChargingTimeEstimator() {
  const [selectedModel, setSelectedModel] = useState(vehicles[0].model);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [chargerIdx, setChargerIdx] = useState(1);
  const [fromPct, setFromPct] = useState(20);
  const [toPct, setToPct] = useState(80);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<"from" | "to" | null>(null);

  const currentVehicle = vehicles.find((v) => v.model === selectedModel)!;
  const currentVariant: Variant = currentVehicle.variants[selectedVariantIdx];
  const battery = currentVariant.battery ?? 0;
  const charger = CHARGER_TYPES[chargerIdx];

  // Effective power = min(changer power, car's limit)
  const effectivePower = useMemo(() => {
    if (charger.type === "ac") {
      return Math.min(charger.power, AC_MAX);
    }
    // DC: car's max DC charge power limits the charger
    const carMaxDC = parseDCWatts(currentVariant.maxChargePower);
    return Math.min(charger.power, carMaxDC);
  }, [charger, currentVariant.maxChargePower]);

  const energyNeeded = useMemo(() => {
    if (battery <= 0) return 0;
    return battery * ((toPct - fromPct) / 100);
  }, [battery, fromPct, toPct]);

  const timeHours = useMemo(() => {
    if (energyNeeded <= 0 || effectivePower <= 0) return 0;
    return energyNeeded / effectivePower;
  }, [energyNeeded, effectivePower]);

  const chargeCostLow = useMemo(() => {
    if (energyNeeded <= 0) return 0;
    if (charger.type === "ac") return energyNeeded * 0.30;
    return energyNeeded * 1.00;
  }, [energyNeeded, charger.type]);

  const chargeCostHigh = useMemo(() => {
    if (energyNeeded <= 0) return 0;
    if (charger.type === "ac") return 0;
    return energyNeeded * 1.40;
  }, [energyNeeded, charger.type]);

  // Custom slider pointer handlers
  const getPctFromPointer = useCallback((e: React.PointerEvent | PointerEvent) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    return Math.max(0, Math.min(100, (x / rect.width) * 100));
  }, []);

  const handlePointerDown = useCallback((handle: "from" | "to") => {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      draggingRef.current = handle;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      const pct = getPctFromPointer(e);
      if (handle === "from") {
        setFromPct(Math.min(Math.round(pct), toPct - 2));
      } else {
        setToPct(Math.max(Math.round(pct), fromPct + 2));
      }
    };
  }, [getPctFromPointer, toPct, fromPct]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const handle = draggingRef.current;
    if (!handle) return;
    const pct = getPctFromPointer(e);
    if (handle === "from") {
      setFromPct(Math.min(Math.round(pct), toPct - 2));
    } else {
      setToPct(Math.max(Math.round(pct), fromPct + 2));
    }
  }, [getPctFromPointer, toPct, fromPct]);

  const handlePointerUp = useCallback(() => {
    draggingRef.current = null;
  }, []);

  return (
    <section>
      <h2 className="section-title">Charging Time Estimator</h2>
      <div className="card card-elevated overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
          {/* Controls */}
          <div className="lg:col-span-3 p-4 sm:p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    setSelectedVariantIdx(0);
                  }}
                  className="select"
                >
                  {vehicles.map((v) => (
                    <option key={v.model} value={v.model}>
                      {v.model}
                    </option>
                  ))}
                </select>
              </div>

              {currentVehicle.variants.length > 1 && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Variant
                  </label>
                  <select
                    value={selectedVariantIdx}
                    onChange={(e) => setSelectedVariantIdx(Number(e.target.value))}
                    className="select"
                  >
                    {currentVehicle.variants.map((v, i) => (
                      <option key={v.name} value={i}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Charger Type */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Charger Type
              </label>
              <div className="grid grid-cols-2 sm:flex sm:flex-row gap-1.5">
                {CHARGER_TYPES.map((ct, i) => (
                  <button
                    key={ct.power}
                    type="button"
                    onClick={() => setChargerIdx(i)}
                    className={`pill text-center ${chargerIdx === i ? "pill-active" : ""}`}
                  >
                    <span className="text-[0.6rem] sm:text-xs font-semibold">{ct.label}</span>
                    <span className="text-[0.55rem] sm:text-[0.6rem] text-neutral-400 ml-0.5">| {ct.power}kW</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Charge Range */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Charge Range
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>From: {fromPct}%</span>
                    <span>To: {toPct}%</span>
                  </div>
                  <div
                    ref={trackRef}
                    className="relative h-8 flex items-center select-none touch-none"
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                  >
                    <div className="absolute w-full h-1.5 bg-neutral-200 rounded-full pointer-events-none" />
                    <div
                      className="absolute h-1.5 bg-accent rounded-full pointer-events-none"
                      style={{
                        left: `${fromPct}%`,
                        width: `${toPct - fromPct}%`,
                      }}
                    />
                    {/* From handle */}
                    <div
                      className={`absolute w-5 h-5 -translate-x-1/2 rounded-full shadow-sm cursor-grab active:cursor-grabbing z-10 transition-all ${
                        draggingRef.current === "from"
                          ? "bg-white border-2 border-accent scale-125 shadow-md"
                          : "bg-white border-2 border-neutral-300 hover:border-accent"
                      }`}
                      style={{ left: `${fromPct}%` }}
                      onPointerDown={handlePointerDown("from")}
                    >
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[0.55rem] font-semibold text-accent whitespace-nowrap pointer-events-none">
                        {draggingRef.current === "from" && `${fromPct}%`}
                      </div>
                    </div>
                    {/* To handle */}
                    <div
                      className={`absolute w-5 h-5 -translate-x-1/2 rounded-full shadow-sm cursor-grab active:cursor-grabbing z-10 transition-all ${
                        draggingRef.current === "to"
                          ? "bg-white border-2 border-accent scale-125 shadow-md"
                          : "bg-white border-2 border-neutral-300 hover:border-accent"
                      }`}
                      style={{ left: `${toPct}%` }}
                      onPointerDown={handlePointerDown("to")}
                    >
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[0.55rem] font-semibold text-accent whitespace-nowrap pointer-events-none">
                        {draggingRef.current === "to" && `${toPct}%`}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-[0.6rem] text-neutral-300 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>

            {!currentVariant.battery && (
              <p className="text-xs text-amber-600">
                Battery capacity not available for this variant
              </p>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-2 bg-gradient-to-br from-accent/5 to-[var(--color-bg-secondary)] border-t lg:border-t-0 lg:border-l border-[var(--color-border-primary)]/60 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
                Estimated Charging Time
              </h3>

              <div className="space-y-1.5 text-sm">
                <div className="data-row">
                  <span className="data-row-label">Battery Capacity</span>
                  <span className="data-row-value">
                    {battery > 0 ? `${battery} kWh` : "—"}
                  </span>
                </div>
                <div className="data-row">
                  <span className="data-row-label">Charger</span>
                  <span className="data-row-value">
                    {charger.power}kW {charger.type.toUpperCase()}
                  </span>
                </div>
                <div className="data-row">
                  <span className="data-row-label">Car Limit</span>
                  <span className="data-row-value">
                    {charger.type === "ac"
                      ? `${AC_MAX}kW AC`
                      : currentVariant.maxChargePower || "—"}
                  </span>
                </div>
                <div className="data-row">
                  <span className="data-row-label">Effective Power</span>
                  <span className="data-row-value font-semibold text-accent">
                    {effectivePower > 0 ? `${effectivePower} kW` : "—"}
                  </span>
                </div>
                <div className="data-row">
                  <span className="data-row-label">Energy Needed</span>
                  <span className="data-row-value">
                    {energyNeeded > 0
                      ? `${energyNeeded.toFixed(1)} kWh`
                      : "—"}
                  </span>
                </div>
                <div className="data-row">
                  <span className="data-row-label">Est. Cost</span>
                  <span className="data-row-value">
                    {chargeCostLow > 0
                      ? charger.type === "dc"
                        ? `RM${chargeCostLow.toFixed(2)} – RM${chargeCostHigh.toFixed(2)}`
                        : `RM${chargeCostLow.toFixed(2)}`
                      : "—"}
                    <span className="text-[0.55rem] text-neutral-400 ml-1">
                      {charger.type === "dc" ? "@ RM1.00–1.40/kWh" : "@ RM0.30/kWh"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-accent/20">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-neutral-400 font-medium">
                    Charging Time
                  </p>
                  <p className="text-xs text-neutral-300 mt-0.5">
                    {fromPct}% → {toPct}% · {effectivePower}kW effective
                  </p>
                </div>
                <p className="text-lg sm:text-xl font-extrabold text-accent tracking-tight">
                  {timeHours > 0 ? formatDuration(timeHours) : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
