export interface NewsItem {
    id: string;
    headline: string;
    source: string;
    time: string;
    url?: string;
    sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
}
