import React, { useEffect, useState } from 'react';
import { CandlestickChart } from './components/CandlestickChart';
import { fetchStockData } from './services/api';
import { StockDataPoint } from './types';
import { DEFAULT_STOCK_CODE, DAYS_TO_FETCH, FETCH_LOOKBACK_DAYS } from './constants';

const App: React.FC = () => {
  const [stockCode, setStockCode] = useState<string>(DEFAULT_STOCK_CODE);
  const [data, setData] = useState<StockDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchStockData(code, FETCH_LOOKBACK_DAYS);
      // Slice to get the last ~250 items if result is larger
      const slicedResult = result.length > DAYS_TO_FETCH ? result.slice(-DAYS_TO_FETCH) : result;
      setData(slicedResult);
    } catch (err: any) {
      setError(err.message || "Failed to load stock data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(stockCode);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (stockCode.length === 6) {
      loadData(stockCode);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-slate-950/75 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100 hidden sm:block">
                Market<span className="text-indigo-400">Vis</span>
              </h1>
            </div>

            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={stockCode}
                onChange={(e) => setStockCode(e.target.value)}
                placeholder="Stock Code (e.g., 300246)"
                className="block w-48 sm:w-64 pl-10 pr-3 py-2 border border-slate-700 rounded-lg leading-5 bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                maxLength={6}
              />
              <button 
                type="submit"
                className="absolute inset-y-0 right-0 px-3 flex items-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-r-lg text-sm font-medium transition-colors"
              >
                Go
              </button>
            </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Info Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{stockCode}</h2>
            <p className="text-slate-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Daily K-Line (Forward Adjusted)
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
             <div className="flex items-center gap-1">
               <span className="w-3 h-3 rounded-sm bg-red-500"></span> Up
             </div>
             <div className="flex items-center gap-1">
               <span className="w-3 h-3 rounded-sm bg-green-500"></span> Down
             </div>
             <div className="hidden sm:flex items-center gap-1">
               <span className="w-8 h-0.5 bg-yellow-400"></span> MA5
             </div>
          </div>
        </div>

        {/* Chart Container */}
        {loading ? (
          <div className="w-full h-[500px] bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center justify-center animate-pulse">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-400 font-medium">Loading market data...</p>
          </div>
        ) : error ? (
          <div className="w-full h-[500px] bg-slate-900 rounded-xl border border-red-900/50 flex flex-col items-center justify-center p-6 text-center">
            <svg className="w-16 h-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-xl font-semibold text-red-400 mb-2">Data Fetch Failed</h3>
            <p className="text-slate-400 max-w-md">{error}</p>
            <p className="text-slate-500 text-sm mt-4">Note: If you are seeing this locally, ensure your environment allows Cross-Origin (CORS) requests to <code>push2his.eastmoney.com</code>.</p>
            <button 
              onClick={() => loadData(stockCode)}
              className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
             <div className="relative">
                <CandlestickChart data={data} />
             </div>
             
             {/* Stats Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-sm mb-1">Latest Close</p>
                  <p className="text-2xl font-semibold text-white">
                    {data.length > 0 ? data[data.length - 1].close.toFixed(2) : '-'}
                  </p>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-sm mb-1">Latest Volume</p>
                  <p className="text-2xl font-semibold text-white">
                    {data.length > 0 ? (data[data.length - 1].volume / 10000).toFixed(0) : '-'} <span className="text-sm font-normal text-slate-500">万手</span>
                  </p>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-sm mb-1">Highest (Period)</p>
                  <p className="text-2xl font-semibold text-red-400">
                    {data.length > 0 ? Math.max(...data.map(d => d.high)).toFixed(2) : '-'}
                  </p>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-sm mb-1">Lowest (Period)</p>
                  <p className="text-2xl font-semibold text-green-400">
                    {data.length > 0 ? Math.min(...data.map(d => d.low)).toFixed(2) : '-'}
                  </p>
                </div>
             </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;