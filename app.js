const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const FormData = require('form-data'); // ✅ استيراد form-data
require('dotenv').config();

const app = express();
const upload = multer(); // ✅ إعداد multer لاستخدام الذاكرة (buffer)

// خدمة الملفات الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// إعداد body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// مسار الفحص
app.post('/scan', upload.single('file'), async (req, res) => {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  const url = req.body.url;
  const file = req.file;

  if (file) {
    try {
      const form = new FormData();
      // ✅ إضافة الملف باستخدام buffer واسم الملف
      form.append('file', file.buffer, file.originalname);

      const response = await axios.post('https://www.virustotal.com/api/v3/files', form, {
        headers: {
          'x-apikey': apiKey,
          ...form.getHeaders()
        }
      });

      res.json(response.data);
    } catch (error) {
      console.error('Error scanning file:', error.response?.data || error.message);
      res.status(500).json({ message: 'Error scanning file', error: error.message });
    }
  } else if (url) {
    try {
      // ✅ ترميز الرابط كما تطلب API فايروس توتال
      const encodedUrl = Buffer.from(url).toString('base64').replace(/=+$/, '');

      const response = await axios.post(`https://www.virustotal.com/api/v3/urls`, `url=${url}`, {
        headers: {
          'x-apikey': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // بعد الفحص نحصل على ID ونستخدمه لجلب التقرير
      const analysisId = response.data.data.id;

      const result = await axios.get(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
        headers: {
          'x-apikey': apiKey
        }
      });

      res.json(result.data);
    } catch (error) {
      console.error('Error scanning URL:', error.response?.data || error.message);
      res.status(500).json({ message: 'Error scanning URL', error: error.message });
    }
  } else {
    res.status(400).json({ message: 'No file or URL provided' });
  }
});

// تشغيل الخادم
app.listen(3000, () => {
  console.log('Server is running on https://assumebreachesback.onrender.com');
});
