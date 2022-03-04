import pkg from '@slack/bolt';
const { App } = pkg;
import 'dotenv/config';
import { getTopThreeTopics } from './notion.js';
import { findChannelID, getUserByEmail, publishMessage } from './slack.js';

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
  const channelID = await findChannelID(app, 'lightning-talk-bot');
  if (channelID) {
    const topics = await getTopThreeTopics();
    const topicsWithSlackNames = await Promise.all(
      topics.map(async topic => ({
        ...topic,
        slackName: await getSlackName(app, topic.speakerEmail)
      }))
    );

    const slackMessage = createSlackMessage(topicsWithSlackNames);
    publishMessage(app, channelID, slackMessage);
  }
  await app.stop();
})();

async function getSlackName(app, speakerEmail) {
  const matchingSlackUser = await getUserByEmail(app, speakerEmail);
  return matchingSlackUser
    ? `<@${matchingSlackUser.profile.display_name}>`
    : '';
}

function createSlackMessage(topics) {
  let slackMessage = "This week's chosen lightning talk topics are:\n";
  for (const [i, topic] of topics.entries()) {
    const { title, speaker, slackName, upvoteCount } = topic;
    const upvoteLabel = upvoteCount > 1 ? 'upvotes' : 'upvote';
    slackMessage += `${i + 1}. ${title} by ${
      slackName || speaker
    } at ${upvoteCount} ${upvoteLabel}\n`;
  }
  return slackMessage;
}
