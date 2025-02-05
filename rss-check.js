import axios from "axios";
import Parser from "rss-parser";

const parser = new Parser();

async function checkRSS() {
  const RSS_FEED_URL = process.env.RSS_FEED_URL;
  const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

  if (!RSS_FEED_URL || !DISCORD_WEBHOOK_URL) {
    console.error("Missing environment variables!");
    process.exit(1);
  }

  try {
    const feed = await parser.parseURL(RSS_FEED_URL);
    const latestPost = feed.items[0];

    if (latestPost) {
      await axios.post(DISCORD_WEBHOOK_URL, {
        content: `**New Post:** ${latestPost.title}\n${latestPost.link}`,
      });

      console.log("Posted new RSS update to Discord.");
    } else {
      console.log("No new RSS posts found.");
    }
  } catch (error) {
    console.error("Error fetching RSS feed:", error.message);
    process.exit(1);
  }
}

checkRSS();