const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static('public'));

// إعداد body-parser لمعالجة البيانات
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// إعداد المسار لفحص الرابط أو الملف
app.post('/scan', async (req, res) => {
  const { file, url } = req.body; // افترضنا أن الملف أو الرابط يُرسل في جسم الطلب
  const apiKey = 'your_virustotal_api_key'; // ضع هنا مفتاح API من VirusTotal أو DeepAI

  if (file) {
    try {
      const form = new FormData();
      form.append('file', file);

      const response = await axios.post('https://www.virustotal.com/api/v3/files', form, {
        headers: {
          'x-apikey': apiKey,
          ...form.getHeaders()
        }
      });

      res.json(response.data);
    } catch (error) {
      console.error('Error scanning file:', error);
      res.status(500).json({ message: 'Error scanning file', error: error.message });
    }
  } else if (url) {
    try {
      const response = await axios.post(`https://www.virustotal.com/api/v3/urls/${url}`, null, {
        headers: {
          'x-apikey': apiKey
        }
      });

      res.json(response.data);
    } catch (error) {
      console.error('Error scanning URL:', error);
      res.status(500).json({ message: 'Error scanning URL', error: error.message });
    }
  } else {
    res.status(400).json({ message: 'No file or URL provided' });
  }
});

// تشغيل الخادم على المنفذ 3000
app.listen(3000, () => {
  console.log('Server is running on https://assumebreachesback.onrender.com');
});
