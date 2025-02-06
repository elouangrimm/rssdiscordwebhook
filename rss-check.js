const axios = require('axios');
const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

const parser = new Parser();

const postedIdsFile = path.join(__dirname, 'posted-ids.json');

let postedIds = [];
if (fs.existsSync(postedIdsFile)) {
  postedIds = JSON.parse(fs.readFileSync(postedIdsFile, 'utf-8'));
}

async function checkRSS() {
  const RSS_FEED_URL = process.env.RSS_FEED_URL;
  const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

  if (!RSS_FEED_URL || !DISCORD_WEBHOOK_URL) {
    console.error("❌ Missing environment variables!");
    process.exit(1);
  }

  try {
    console.log("🔍 Fetching RSS feed...");
    const feed = await parser.parseURL(RSS_FEED_URL);
    const latestPost = feed.items[0];

    if (!latestPost) {
      console.log("⚠ No new RSS posts found.");
      return;
    }

    const postId = latestPost.guid || latestPost.link;
    if (postedIds.includes(postId)) {
      console.log(`⚠ Post already posted: ${latestPost.title}`);
      return;
    }

    console.log(`✅ Found new post: ${latestPost.title}`);

    const embed = {
      embeds: [
        {
          title: latestPost.title,
          url: latestPost.link,
          description: latestPost.contentSnippet || "No description available.",
          color: 0x3498db,
          timestamp: new Date(latestPost.pubDate).toISOString(),
          author: {
            name: feed.title,
          },
          footer: {
            text: "RSS to Discord Bot",
          },
        },
      ],
      username: "Carson (carsonetb.com)",
      avatar_url: "https://carsonetb.com/assets/profile.png",
    };

    console.log("📡 Sending embed to Discord...");
    await axios.post(DISCORD_WEBHOOK_URL, embed);

    console.log("✅ Successfully posted to Discord!");

    postedIds.push(postId);
    fs.writeFileSync(postedIdsFile, JSON.stringify(postedIds, null, 2));
  } catch (error) {
    console.error("❌ Error fetching RSS feed:", error.message);
    process.exit(1);
  }
}

checkRSS();