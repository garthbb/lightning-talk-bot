import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_KEY });

const databaseId = process.env.NOTION_DATABASE_ID;

async function getTopThreeTopics() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        or: [
          {
            property: "Status",
            select: {
              equals: "Accepted",
            },
          },
          {
            property: "Status",
            select: {
              is_empty: true,
            },
          },
        ],
      },
      sorts: [
        {
          property: "Upvotes",
          direction: "descending",
        },
      ],
    });
    const { results } = response;
    let slackMessage = "";
    let validChats = 0;

    for (const topic of results) {
      const { title, speaker, upvoteCount, isValid } =
        processTopicObject(topic);
      if (isValid) {
        validChats += 1;
        slackMessage += `${validChats}. ${title} by ${speaker} at ${upvoteCount} upvote(s)\n`;
      }
      if (validChats === 3) {
        break;
      }
    }
    console.log(slackMessage);
  } catch (error) {
    console.error(error);
  }
}

const processTopicObject = (rawTopic) => {
  const processedTopic = {
    title: rawTopic.properties.Topic?.title?.[0]?.text?.content,
    upvoteCount: rawTopic.properties.Upvotes?.formula?.number,
    speaker: rawTopic.properties.Speakers?.people?.[0]?.name,
  };
  return {
    ...processedTopic,
    isValid: processedTopic.speaker && processedTopic.title,
  };
};

getTopThreeTopics();
