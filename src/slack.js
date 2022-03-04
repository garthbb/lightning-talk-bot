import 'dotenv/config';

// Find channel ID using the conversations.list method
export async function findChannelID(app, name) {
  try {
    let channelsArray = [];
    let hasNextCursor = true;
    let cursor;
    while (hasNextCursor) {
      const result = await app.client.conversations.list({
        token: process.env.SLACK_AUTH_TOKEN,
        limit: 200,
        cursor
      });
      cursor = result.response_metadata?.next_cursor;
      hasNextCursor = !!cursor;
      channelsArray.push(...result.channels);
    }

    for (const channel of channelsArray) {
      if (channel.name === name) {
        console.log(`Found channel ID: ${channel.id}`);
        return channel.id;
      }
    }
  } catch (error) {
    console.error(error);
  }
}

// Post a message to a channel your app is in using ID and message text
export async function publishMessage(app, id, text) {
  try {
    await app.client.chat.postMessage({
      // The token you used to initialize your app
      token: process.env.SLACK_AUTH_TOKEN,
      channel: id,
      text: text
      // You could also use a blocks[] array to send richer content
    });
  } catch (error) {
    console.error(error);
  }
}

export async function getUserByEmail(app, email) {
  let hasNextCursor = true;
  let cursor;
  let matchedUser;

  while (hasNextCursor && !matchedUser) {
    try {
      const result = await app.client.users.list({
        token: process.env.SLACK_AUTH_TOKEN,
        limit: 200,
        cursor
      });
      cursor = result.response_metadata?.next_cursor;
      hasNextCursor = !!cursor;
      matchedUser = result.members.find(
        member => member.profile?.email === email
      );
    } catch (err) {
      console.log(err);
      return;
    }
  }
  return matchedUser;
}
