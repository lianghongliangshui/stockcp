import { StockApiResponse, StockDataPoint } from '../types';

const BASE_URL = "https://push2his.eastmoney.com/api/qt/stock/kline/get";

// Helper to format date as YYYYMMDD
const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}${m}${d}`;
};

export const fetchStockData = async (code: string, daysLookback: number): Promise<StockDataPoint[]> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - daysLookback);

  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);

  // mcode logic: 1 if code starts with '6', else 0 (for '0' and '3' prefixes mostly)
  const mcode = code.startsWith('6') ? 1 : 0;

  const params = new URLSearchParams({
    fields1: "f1,f2,f3,f4,f5,f6",
    fields2: "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f116",
    ut: "fa5fd1943c7b386f172d6893dbfba10b",
    klt: "101", // Daily
    fqt: "1",   // 1 = Forward Adjusted (前复权), 0 = No Adjust, 2 = Back Adjust
    secid: `${mcode}.${code}`,
    beg: startStr,
    end: endStr,
  });

  try {
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API Request failed: ${response.statusText}`);
    }

    const json: StockApiResponse = await response.json();

    if (!json.data || !json.data.klines) {
      return [];
    }

    const parsedData: StockDataPoint[] = json.data.klines.map((item: string) => {
      const parts = item.split(',');
      // Mapping based on fields2: 
      // f51:Date, f52:Open, f53:Close, f54:High, f55:Low, f56:Vol, f57:Amt, f58:Amp, f59:Pct, f60:AmtChg, f61:Turn
      return {
        date: parts[0],
        open: parseFloat(parts[1]),
        close: parseFloat(parts[2]),
        high: parseFloat(parts[3]),
        low: parseFloat(parts[4]),
        volume: parseFloat(parts[5]),
        amount: parseFloat(parts[6]),
        amplitude: parseFloat(parts[7]),
        pctChange: parseFloat(parts[8]),
        amountChange: parseFloat(parts[9]),
        turnover: parseFloat(parts[10]),
      };
    });

    return parsedData;
  } catch (error) {
    console.error("Failed to fetch stock data:", error);
    throw error;
  }
};