import { StockDataPoint } from '../types';

export const calculateMA = (data: StockDataPoint[], dayCount: number) => {
  const result: (number | null)[] = [];
  for (let i = 0, len = data.length; i < len; i++) {
    if (i < dayCount - 1) {
      result.push(null);
      continue;
    }
    let sum = 0;
    for (let j = 0; j < dayCount; j++) {
      sum += data[i - j].close;
    }
    result.push(parseFloat((sum / dayCount).toFixed(2)));
  }
  return result;
};

export const processChartData = (raw: StockDataPoint[]) => {
  const ma5 = calculateMA(raw, 5);
  const ma10 = calculateMA(raw, 10);
  const ma20 = calculateMA(raw, 20);

  return raw.map((item, index) => ({
    ...item,
    ma5: ma5[index],
    ma10: ma10[index],
    ma20: ma20[index],
    isUp: item.close >= item.open,
  }));
};