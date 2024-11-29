import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/download', async (req, res) => {
    try {
        const { url } = req.body;
        
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });

        // Configurar headers para la descarga
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', 'attachment; filename=video.mp4');

        // Pipe el stream de video directamente al response
        response.data.pipe(res);
    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).json({ error: 'Error downloading video' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
