import { Time } from "lightweight-charts";

export interface RealChartData {
    time: Time;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface MarketResponse {
    meta: {
        currency: string;
        symbol: string;
        regularMarketPrice: number;
        previousClose: number;
    };
    quotes: RealChartData[];
}

export const fetchRealChartData = async (symbol: string): Promise<MarketResponse | null> => {
    try {
        const response = await fetch(`/api/market/${symbol}`);
        if (!response.ok) throw new Error(`Network response was not ok for ${symbol}`);
        const data = await response.json();
        return data as MarketResponse;
    } catch (error) {
        console.error("Error fetching real chart data:", error);
        return null;
    }
};

export const getLiveMockPrice = (basePrice: number) => {
    // Simulate slight price movement for active visual UX between actual API polls
    const volatility = 0.5;
    const change = (Math.random() - 0.5) * volatility;
    return Number((basePrice + change).toFixed(2));
};
