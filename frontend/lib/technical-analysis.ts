export interface OHLCEntry {
  date: string; // "YYYY-MM-DD"
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
}

export interface DataSufficiency {
  days: number;
  candlestick: boolean; // ≥ 5  days
  atr: boolean;         // ≥ 14 days
  rsi: boolean;         // ≥ 15 days
  bb20: boolean;        // ≥ 20 days
  ema20: boolean;       // ≥ 20 days
  macd: boolean;        // ≥ 35 days
  adx: boolean;         // ≥ 28 days
  ema50: boolean;       // ≥ 50 days
  fibonacci: boolean;   // ≥ 20 days
  marketStructure: boolean; // ≥ 15 days
  ema200: boolean;      // ≥ 200 days
  goldenCross: boolean; // ≥ 200 days
}

export function getDataSufficiency(history: OHLCEntry[]): DataSufficiency {
  const n = history.length;
  return {
    days: n,
    candlestick: n >= 5,
    atr: n >= 14,
    rsi: n >= 15,
    bb20: n >= 20,
    ema20: n >= 20,
    macd: n >= 35,
    adx: n >= 28,
    ema50: n >= 50,
    fibonacci: n >= 20,
    marketStructure: n >= 15,
    ema200: n >= 200,
    goldenCross: n >= 200,
  };
}

export interface TechnicalAnalysisResult {
  symbol: string;
  price: number;
  date: string;
  sufficiency: DataSufficiency;
  
  // Phase 1 (Single day)
  pivotPoint: number;
  support1: number;
  resistance1: number;
  dailyRangePct: number;
  priceVsVwapSignal: "Bullish (Above VWAP)" | "Bearish (Below VWAP)" | "Neutral";
  vwapVal: number;

  // Phase 2/3 (Historical indicators - null if insufficient data)
  rsi14: number | null;
  macd: { macdLine: number; signalLine: number; histogram: number } | null;
  ema20: number | null;
  ema50: number | null;
  ema200: number | null;
  bollingerBands: { upper: number; middle: number; lower: number } | null;
  atr14: number | null;
  crossSignal: "Golden Cross (Bullish)" | "Death Cross (Bearish)" | "None" | null;
  candlestickPattern: string | null;
  fibonacci: { level236: number; level382: number; level500: number; level618: number } | null;
  marketStructure: "Higher Highs / Higher Lows (Uptrend)" | "Lower Highs / Lower Lows (Downtrend)" | "Consolidating" | null;

  // Final Confluence AI Signal
  overallSignal: "STRONG BUY" | "BUY" | "HOLD" | "SELL" | "STRONG SELL";
  confidence: number;
  signalRationale: string[];
}

/* ── EMA Calculation ───────────────────────────────────── */
export function calculateEMA(closes: number[], period: number): number | null {
  if (closes.length < period) return null;
  const k = 2 / (period + 1);
  let ema = closes.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
  for (let i = period; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
  }
  return +ema.toFixed(2);
}

/* ── RSI Calculation ───────────────────────────────────── */
export function calculateRSI(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change >= 0) gains += change;
    else losses -= change;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change >= 0 ? change : 0;
    const loss = change < 0 ? -change : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);
  return +rsi.toFixed(2);
}

/* ── MACD Calculation ──────────────────────────────────── */
export function calculateMACD(closes: number[]): { macdLine: number; signalLine: number; histogram: number } | null {
  if (closes.length < 35) return null; // 26 + 9
  
  // Calculate MACD line series
  const macdSeries: number[] = [];
  const k12 = 2 / (12 + 1);
  const k26 = 2 / (26 + 1);

  let ema12 = closes.slice(0, 12).reduce((s, v) => s + v, 0) / 12;
  let ema26 = closes.slice(0, 26).reduce((s, v) => s + v, 0) / 26;

  for (let i = 26; i < closes.length; i++) {
    ema12 = closes[i] * k12 + ema12 * (1 - k12);
    ema26 = closes[i] * k26 + ema26 * (1 - k26);
    macdSeries.push(ema12 - ema26);
  }

  if (macdSeries.length < 9) return null;

  const signalLine = calculateEMA(macdSeries, 9);
  if (signalLine === null) return null;

  const currentMACD = macdSeries[macdSeries.length - 1];
  const histogram = currentMACD - signalLine;

  return {
    macdLine: +currentMACD.toFixed(2),
    signalLine: +signalLine.toFixed(2),
    histogram: +histogram.toFixed(2),
  };
}

/* ── Bollinger Bands ───────────────────────────────────── */
export function calculateBollingerBands(closes: number[], period = 20): { upper: number; middle: number; lower: number } | null {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  return {
    upper: +(mean + 2 * stdDev).toFixed(2),
    middle: +mean.toFixed(2),
    lower: +(mean - 2 * stdDev).toFixed(2),
  };
}

/* ── ATR Calculation ───────────────────────────────────── */
export function calculateATR(history: OHLCEntry[], period = 14): number | null {
  if (history.length < period + 1) return null;
  const trs: number[] = [];
  for (let i = 1; i < history.length; i++) {
    const cur = history[i];
    const prev = history[i - 1];
    const tr = Math.max(
      cur.high - cur.low,
      Math.abs(cur.high - prev.close),
      Math.abs(cur.low - prev.close)
    );
    trs.push(tr);
  }
  const slice = trs.slice(-period);
  const atr = slice.reduce((a, b) => a + b, 0) / period;
  return +atr.toFixed(2);
}

/* ── Candlestick Pattern Detection ─────────────────────── */
export function detectCandlestickPattern(history: OHLCEntry[]): string | null {
  if (history.length < 3) return null;
  const curr = history[history.length - 1];
  const prev = history[history.length - 2];
  const prev2 = history[history.length - 3];

  const body = Math.abs(curr.close - curr.open);
  const range = curr.high - curr.low;
  if (range === 0) return null;

  const isBullish = curr.close > curr.open;
  const lowerShadow = isBullish ? curr.open - curr.low : curr.close - curr.low;
  const upperShadow = isBullish ? curr.high - curr.close : curr.high - curr.open;

  // Bullish Engulfing
  if (prev.close < prev.open && curr.close > curr.open && curr.close > prev.open && curr.open < prev.close) {
    return "Bullish Engulfing (Reversal)";
  }
  // Bearish Engulfing
  if (prev.close > prev.open && curr.close < curr.open && curr.open > prev.close && curr.close < prev.open) {
    return "Bearish Engulfing (Reversal)";
  }
  // Hammer
  if (lowerShadow >= 2 * body && upperShadow <= 0.2 * body) {
    return isBullish ? "Bullish Hammer" : "Inverted Hammer";
  }
  // Three White Soldiers
  if (
    prev2.close > prev2.open &&
    prev.close > prev.open &&
    curr.close > curr.open &&
    curr.close > prev.close &&
    prev.close > prev2.close
  ) {
    return "Three White Soldiers (Strong Bullish)";
  }

  return null;
}

/* ── Full Analysis Confluence Engine ────────────────────── */
export function performFullTechnicalAnalysis(
  symbol: string,
  history: OHLCEntry[],
  currentStock?: any
): TechnicalAnalysisResult {
  const sufficiency = getDataSufficiency(history);
  
  // Use today's values from currentStock if available, otherwise latest from history
  const latestHistory = history.length > 0 ? history[history.length - 1] : null;

  const high = currentStock?.high || latestHistory?.high || 0;
  const low = currentStock?.low || latestHistory?.low || 0;
  const close = currentStock?.ltp || latestHistory?.close || 0;
  const prevClose = currentStock?.prevClose || (history.length >= 2 ? history[history.length - 2].close : close);
  const vwap = currentStock?.vwap || latestHistory?.vwap || close;

  // Single-day metrics (Pivot, VWAP, Range)
  const pivotPoint = +((high + low + close) / 3).toFixed(2);
  const support1 = +(2 * pivotPoint - high).toFixed(2);
  const resistance1 = +(2 * pivotPoint - low).toFixed(2);
  const dailyRangePct = prevClose > 0 ? +(((high - low) / prevClose) * 100).toFixed(2) : 0;
  const priceVsVwapSignal = close > vwap ? "Bullish (Above VWAP)" : close < vwap ? "Bearish (Below VWAP)" : "Neutral";

  const closes = history.map((h) => h.close);

  // Multi-day indicators (calculated if sufficient data)
  const rsi14 = sufficiency.rsi ? calculateRSI(closes) : null;
  const macd = sufficiency.macd ? calculateMACD(closes) : null;
  const ema20 = sufficiency.ema20 ? calculateEMA(closes, 20) : null;
  const ema50 = sufficiency.ema50 ? calculateEMA(closes, 50) : null;
  const ema200 = sufficiency.ema200 ? calculateEMA(closes, 200) : null;
  const bollingerBands = sufficiency.bb20 ? calculateBollingerBands(closes, 20) : null;
  const atr14 = sufficiency.atr ? calculateATR(history, 14) : null;
  const candlestickPattern = sufficiency.candlestick ? detectCandlestickPattern(history) : null;

  // Golden / Death Cross
  let crossSignal: TechnicalAnalysisResult["crossSignal"] = null;
  if (ema50 !== null && ema200 !== null) {
    if (ema50 > ema200) crossSignal = "Golden Cross (Bullish)";
    else if (ema50 < ema200) crossSignal = "Death Cross (Bearish)";
    else crossSignal = "None";
  }

  // Fibonacci Retracement
  let fibonacci = null;
  if (sufficiency.fibonacci && history.length >= 20) {
    const recent = history.slice(-20);
    const swingHigh = Math.max(...recent.map((r) => r.high));
    const swingLow = Math.min(...recent.map((r) => r.low));
    const diff = swingHigh - swingLow;
    if (diff > 0) {
      fibonacci = {
        level236: +(swingHigh - 0.236 * diff).toFixed(2),
        level382: +(swingHigh - 0.382 * diff).toFixed(2),
        level500: +(swingHigh - 0.500 * diff).toFixed(2),
        level618: +(swingHigh - 0.618 * diff).toFixed(2),
      };
    }
  }

  // Market Structure
  let marketStructure: TechnicalAnalysisResult["marketStructure"] = null;
  if (sufficiency.marketStructure && history.length >= 15) {
    const p1 = history[history.length - 1].close;
    const p5 = history[history.length - 5].close;
    const p10 = history[history.length - 10].close;

    if (p1 > p5 && p5 > p10) marketStructure = "Higher Highs / Higher Lows (Uptrend)";
    else if (p1 < p5 && p5 < p10) marketStructure = "Lower Highs / Lower Lows (Downtrend)";
    else marketStructure = "Consolidating";
  }

  // Confluence Weighted Signal
  let score = 0;
  const rationale: string[] = [];

  // 1. VWAP check (+1/-1)
  if (close > vwap) {
    score += 1;
    rationale.push("Price above VWAP (institutional buying)");
  } else if (close < vwap) {
    score -= 1;
    rationale.push("Price below VWAP (selling pressure)");
  }

  // 2. Pivot check (+1/-1)
  if (close > pivotPoint) {
    score += 1;
    rationale.push("Trading above daily Pivot Point");
  } else {
    score -= 1;
    rationale.push("Trading below daily Pivot Point");
  }

  // 3. RSI check (+2/-2) if available
  if (rsi14 !== null) {
    if (rsi14 < 30) {
      score += 2;
      rationale.push(`RSI (${rsi14}) is Oversold`);
    } else if (rsi14 > 70) {
      score -= 2;
      rationale.push(`RSI (${rsi14}) is Overbought`);
    } else if (rsi14 >= 50) {
      score += 1;
      rationale.push(`RSI (${rsi14}) in bullish zone`);
    } else {
      score -= 1;
      rationale.push(`RSI (${rsi14}) in bearish zone`);
    }
  }

  // 4. MACD (+2/-2) if available
  if (macd !== null) {
    if (macd.histogram > 0) {
      score += 2;
      rationale.push("MACD histogram positive (bullish momentum)");
    } else {
      score -= 2;
      rationale.push("MACD histogram negative (bearish momentum)");
    }
  }

  // 5. EMAs (+2/-2) if available
  if (ema20 !== null && close > ema20) {
    score += 1;
    rationale.push("Price above 20 EMA");
  }
  if (crossSignal === "Golden Cross (Bullish)") {
    score += 2;
    rationale.push("50 EMA above 200 EMA (Golden Cross)");
  } else if (crossSignal === "Death Cross (Bearish)") {
    score -= 2;
    rationale.push("50 EMA below 200 EMA (Death Cross)");
  }

  // Determine overall signal
  let overallSignal: TechnicalAnalysisResult["overallSignal"] = "HOLD";
  if (score >= 4) overallSignal = "STRONG BUY";
  else if (score >= 2) overallSignal = "BUY";
  else if (score <= -4) overallSignal = "STRONG SELL";
  else if (score <= -2) overallSignal = "SELL";

  const maxPossible = (rsi14 !== null ? 2 : 0) + (macd !== null ? 2 : 0) + 4;
  const confidence = Math.min(95, Math.max(50, Math.round(60 + (Math.abs(score) / (maxPossible || 4)) * 35)));

  return {
    symbol,
    price: close,
    date: latestHistory?.date || new Date().toISOString().split("T")[0],
    sufficiency,
    pivotPoint,
    support1,
    resistance1,
    dailyRangePct,
    priceVsVwapSignal,
    vwapVal: vwap,
    rsi14,
    macd,
    ema20,
    ema50,
    ema200,
    bollingerBands,
    atr14,
    crossSignal,
    candlestickPattern,
    fibonacci,
    marketStructure,
    overallSignal,
    confidence,
    signalRationale: rationale,
  };
}
