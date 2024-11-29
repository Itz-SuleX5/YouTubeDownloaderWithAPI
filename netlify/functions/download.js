import axios from 'axios';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { url } = JSON.parse(event.body);

    const response = await axios.post('https://all-media-api.p.rapidapi.com/v1/social/youtube/detail', {
      url: url
    }, {
      headers: {
        'x-rapidapi-key': 'bb18653d4dmsh9763ddd8e0a6f76p1896cejsnb2c4604c6ecc',
        'x-rapidapi-host': 'all-media-api.p.rapidapi.com',
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.streamingData && response.data.streamingData.formats) {
      const format = response.data.streamingData.formats[0];
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ downloadUrl: format.url })
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No download URL found' })
      };
    }
  } catch (error) {
    console.error('Error getting video details:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error getting video details' })
    };
  }
};
