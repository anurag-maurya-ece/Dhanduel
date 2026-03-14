import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();

export async function GET() {
  try {
    const feed = await parser.parseURL("https://feeds.finance.yahoo.com/rss/2.0/headline?s=SPY,QQQ,AAPL,MSFT,NVDA,TSLA,AMZN,GOOGL&region=US&lang=en-US");

    const newsItems = feed.items.slice(0, 12).map((item) => {
      const id = item.guid || item.link || Buffer.from(item.title || "").toString("base64");

      return {
        id,
        headline: item.title || "Market Update",
        source: "Yahoo Finance",
        url: item.link || "",
        time: item.pubDate ? getRelativeTime(new Date(item.pubDate).getTime() / 1000) : "recently",
      };
    });

    return NextResponse.json(newsItems);
  } catch (error) {
    console.error("Error fetching live RSS news:", error);
    return NextResponse.json(
      { error: "Failed to fetch live news data from RSS" },
      { status: 500 }
    );
  }
}

function getRelativeTime(unixTimestamp: number): string {
  if (!unixTimestamp) return "recently";
  const now = Math.floor(Date.now() / 1000);
  const diff = now - unixTimestamp;
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
