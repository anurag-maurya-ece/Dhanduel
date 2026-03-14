export interface Scenario {
    id: string;
    title: string;
    description: string;
    options: { label: string; action: 'Buy' | 'Hold' | 'Sell' }[];
    historicalOutcome: {
        action: 'Buy' | 'Hold' | 'Sell';
        insight: string;
    };
}

export const staticScenarios: Scenario[] = [
    {
        id: "crash-2008",
        title: "The 2008 Liquidity Crisis",
        description: "It is September 2008. Lehman Brothers has just filed for bankruptcy. The S&P 500 is down 4.7% today. News headlines are saying 'Wall Street in Panic'. You hold a diversified index portfolio. What is your move?",
        options: [
            { label: "Buy the dip (Stocks are cheap now)", action: 'Buy' },
            { label: "Hold (Wait for it to blow over)", action: 'Hold' },
            { label: "Sell everything (Move to cash)", action: 'Sell' }
        ],
        historicalOutcome: {
            action: 'Hold',
            insight: "Selling in panic locked in massive losses. Buying the immediate dip led to another 40% drop before March 2009 bottom. Holding was painful but the market recovered within 4 years. Lesson: Don't panic sell, but don't catch a falling knife either."
        }
    },
    {
        id: "zomato-ipo",
        title: "The Zomato IPO (2021)",
        description: "Zomato, a major food delivery app, is launching its IPO. The company is heavily loss-making but growing revenue incredibly fast. Retail hype is through the roof. Do you invest on listing day?",
        options: [
            { label: "Buy (Ride the hype train)", action: 'Buy' },
            { label: "Hold (Watch from sidelines)", action: 'Hold' },
            { label: "Sell/Short (It's overvalued)", action: 'Sell' }
        ],
        historicalOutcome: {
            action: 'Sell',
            insight: "Zomato listed at ₹115 and peaked around ₹169, then crashed below ₹50 in 2022 as global tech valuations reset. Hype can drive short-term price, but cash flow dictates long-term survival."
        }
    },
    {
        id: "dotcom-bubble",
        title: "The Dot-Com Bubble (2000)",
        description: "It's March 2000. The NASDAQ has tripled in 2 years. Companies with no revenue are worth billions. Your portfolio is 80% tech stocks and you're up 150%. Everyone says 'this time it's different'. What do you do?",
        options: [
            { label: "Buy more (Tech is the future!)", action: 'Buy' },
            { label: "Hold (Why sell winners?)", action: 'Hold' },
            { label: "Sell and diversify (Lock profits)", action: 'Sell' }
        ],
        historicalOutcome: {
            action: 'Sell',
            insight: "The NASDAQ crashed 78% from its March 2000 peak and didn't recover for 15 years. Selling and diversifying would have preserved enormous gains. Lesson: When valuations are extreme and everyone is euphoric, it's usually time to take profits."
        }
    },
    {
        id: "covid-crash-2020",
        title: "The COVID-19 Crash (March 2020)",
        description: "It's March 16, 2020. COVID-19 has triggered global lockdowns. The S&P 500 has dropped 34% in just 23 trading days — the fastest bear market in history. Markets hit circuit breakers daily. Fear is extreme. What's your move?",
        options: [
            { label: "Buy aggressively (Once-in-a-decade opportunity)", action: 'Buy' },
            { label: "Hold (Ride out the storm)", action: 'Hold' },
            { label: "Sell (This could get much worse)", action: 'Sell' }
        ],
        historicalOutcome: {
            action: 'Buy',
            insight: "The market bottomed on March 23, 2020 and staged the fastest recovery in history, gaining 70%+ by year-end. The Fed's unprecedented stimulus and vaccine hopes fueled a massive V-shaped recovery. Lesson: Extreme fear often creates the best buying opportunities."
        }
    },
    {
        id: "bitcoin-2017",
        title: "Bitcoin's $20K Peak (December 2017)",
        description: "Bitcoin has exploded from $1,000 to nearly $20,000 in 2017. Your neighbor, taxi driver, and cousin are all buying crypto. Media coverage is non-stop. You bought at $3,000 and are sitting on 6x gains. What do you do?",
        options: [
            { label: "Buy more (It's going to $100K!)", action: 'Buy' },
            { label: "Hold (Diamond hands forever)", action: 'Hold' },
            { label: "Sell most (Take profits)", action: 'Sell' }
        ],
        historicalOutcome: {
            action: 'Sell',
            insight: "Bitcoin crashed 84% to $3,200 by December 2018. Those who sold near the top preserved massive gains, while holders watched profits evaporate. It took 3 years to reclaim $20K. Lesson: When your taxi driver gives you stock tips, it's time to sell."
        }
    },
    {
        id: "gamestop-2021",
        title: "The GameStop Short Squeeze (Jan 2021)",
        description: "GameStop (GME) stock has rocketed from $17 to $347 in two weeks, fueled by Reddit's WallStreetBets community squeezing hedge fund short sellers. The internet is going wild. Robinhood restricts buying. Do you jump in?",
        options: [
            { label: "Buy (Stick it to Wall Street!)", action: 'Buy' },
            { label: "Hold (Watch from the sidelines)", action: 'Hold' },
            { label: "Sell/Short (This is pure mania)", action: 'Sell' }
        ],
        historicalOutcome: {
            action: 'Hold',
            insight: "GME crashed from $347 to $40 within weeks. Many retail investors who bought at the peak lost 80%+. Shorting was equally dangerous due to extreme volatility. The wisest move was to watch from the sidelines. Lesson: FOMO is the enemy of good investing. If you don't understand the trade, don't make it."
        }
    },
    {
        id: "reliance-jio-2016",
        title: "Reliance Jio Launch (2016)",
        description: "Mukesh Ambani announces Reliance Jio with FREE 4G data for 6 months. Telecom incumbents like Airtel and Idea are crashing. Reliance stock has been flat for 5 years but Jio is a massive bet. The street is skeptical. What's your call?",
        options: [
            { label: "Buy Reliance (Jio will win)", action: 'Buy' },
            { label: "Hold current positions", action: 'Hold' },
            { label: "Sell (Competition will kill margins)", action: 'Sell' }
        ],
        historicalOutcome: {
            action: 'Buy',
            insight: "Reliance stock went from ₹1,000 in 2016 to ₹2,800+ by 2024, largely driven by Jio's dominance. Jio disrupted the entire telecom industry, and Reliance became India's most valuable company. Lesson: Visionary disruptions by well-funded players create generational wealth opportunities."
        }
    }
]
