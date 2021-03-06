import { Client } from '@notionhq/client';
import 'dotenv/config';

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

export async function getTopThreeTopics() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        or: [
          {
            property: 'Status',
            select: {
              equals: 'Accepted'
            }
          },
          {
            property: 'Status',
            select: {
              is_empty: true
            }
          }
        ]
      },
      sorts: [
        {
          property: 'Upvotes',
          direction: 'descending'
        }
      ]
    });
    const { results } = response;

    let validTopics = [];

    for (const topic of results) {
      const processedTopic = processTopicObject(topic);
      if (processedTopic.isValid) {
        validTopics.push(processedTopic);
      }
      if (validTopics.length === 3) {
        break;
      }
    }
    return validTopics;
  } catch (error) {
    console.error(error);
  }
}

const processTopicObject = rawTopic => {
  const processedTopic = {
    title: rawTopic.properties.Topic?.title?.[0]?.text?.content,
    upvoteCount: rawTopic.properties.Upvotes?.formula?.number,
    speaker: rawTopic.properties.Speakers?.people?.[0]?.name,
    speakerEmail: rawTopic.properties.Speakers?.people?.[0]?.person?.email
  };
  return {
    ...processedTopic,
    isValid: processedTopic.speaker && processedTopic.title
  };
};
