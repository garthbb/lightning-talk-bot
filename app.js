import pkg from "@slack/bolt";
const { App } = pkg;
import "dotenv/config";
import { getTopThreeTopics } from "./notion.js";
import { findChannelID, publishMessage } from "./slack.js";

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
  const channelID = await findChannelID(app, "lightning-talk-bot");
  if (channelID) {
    const messageBody = await getTopThreeTopics();
    publishMessage(app, channelID, messageBody);
  }
})();
