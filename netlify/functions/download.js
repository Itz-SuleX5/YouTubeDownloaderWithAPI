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

    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer'
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename=video.mp4'
      },
      body: Buffer.from(response.data).toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error('Error downloading video:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error downloading video' })
    };
  }
};
