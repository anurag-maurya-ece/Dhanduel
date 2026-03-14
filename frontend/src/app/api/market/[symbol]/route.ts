import { NextResponse } from 'next/server';

export async function GET(request: Request, context: any) {
    const params = await context.params;
    const symbol = params.symbol.toUpperCase();
    
    // Determine the interval and range. For active testing, 1m/1d gives nice live action.
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;

    try {
        const response = await fetch(url, { cache: 'no-store' }); // Disable Next.js caching for live data
        const data = await response.json();

        if (data.chart.error) {
           return NextResponse.json({ error: data.chart.error.description }, { status: 400 });
        }

        const result = data.chart.result[0];
        const timestamps = result.timestamp || [];
        const quote = result.indicators.quote[0];

        // Format data for lightweight-charts
        const chartData = timestamps.map((time: number, index: number) => ({
            time: time, // UNIX timestamp in seconds
            open: quote.open[index] || 0,
            high: quote.high[index] || 0,
            low: quote.low[index] || 0,
            close: quote.close[index] || 0,
        })).filter((candle: { open: number, close: number }) => candle.open !== null && candle.close !== null && candle.open !== 0);

        return NextResponse.json({
            meta: result.meta,
            quotes: chartData
        });
    } catch (error) {
        console.error("Yahoo Finance API Error:", error);
        return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
    }
}
