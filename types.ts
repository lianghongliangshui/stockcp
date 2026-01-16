export interface StockDataPoint {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  amount: number;
  amplitude: number;
  pctChange: number;
  amountChange: number;
  turnover: number;
}

export interface StockApiResponse {
  data: {
    code: string;
    market: number;
    name: string;
    decimal: number;
    dktotal: number;
    klines: string[];
  } | null;
  errcode?: number;
  errmsg?: string;
}

export interface ChartData {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  isUp: boolean;
}