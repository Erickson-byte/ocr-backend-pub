const express = require('express');
const multer = require('multer');
const cors = require('cors');
const vision = require('@google-cloud/vision');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Autenticación con Google Vision
const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}');

const client = new vision.ImageAnnotatorClient({
  credentials,
});


// Ruta POST para recibir imagen y analizarla
app.post('/ocr', upload.single('imagen'), async (req, res) => {
  try {
    const [result] = await client.textDetection(req.file.buffer);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return res.json({ texto: '', mensaje: 'No se detectó texto' });
    }

    const textoDetectado = detections[0].description.trim();
    res.json({ texto: textoDetectado });
  } catch (error) {
    console.error('Error OCR:', error);
    res.status(500).json({ error: 'Error al procesar imagen' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`OCR backend corriendo en http://localhost:${PORT}`);
});
