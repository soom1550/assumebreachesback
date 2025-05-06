const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const upload = multer();

// خدمة الملفات الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// إعداد body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// دالة انتظار حتى انتهاء التحليل
const waitForAnalysisToComplete = async (id, apiKey, maxAttempts = 10, delayMs = 2000) => {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await axios.get(`https://www.virustotal.com/api/v3/analyses/${id}`, {
      headers: { 'x-apikey': apiKey }
    });

    if (result.data.data.attributes.status === 'completed') {
      return result.data;
    }

    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  throw new Error('Analysis timeout. Try again later.');
};

// مسار الفحص
app.post('/scan', upload.single('file'), async (req, res) => {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  const url = req.body.url;
  const file = req.file;

  if (file) {
    // فحص حجم الملف
    if (file.size > 32 * 1024 * 1024) { // الحد الأقصى 32MB
      return res.status(400).json({
        message: 'الملف أكبر من الحد المسموح (32MB). يرجى تحميل ملف أصغر.'
      });
    }

    try {
      const form = new FormData();
      form.append('file', file.buffer, file.originalname);

      const response = await axios.post('https://www.virustotal.com/api/v3/files', form, {
        headers: {
          'x-apikey': apiKey,
          ...form.getHeaders()
        }
      });

      const analysisId = response.data.data.id;
      const result = await waitForAnalysisToComplete(analysisId, apiKey);

      res.json(result);
    } catch (error) {
      console.error('Error scanning file:', error.response?.data || error.message);
      res.status(500).json({
        message: 'فشل فحص الملف. ربما تجاوز الحجم أو هناك مشكلة في السيرفر.',
        error: error.response?.data || error.message
      });
    }
  } else if (url) {
    try {
      const response = await axios.post('https://www.virustotal.com/api/v3/urls', `url=${url}`, {
        headers: {
          'x-apikey': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const analysisId = response.data.data.id;
      const result = await waitForAnalysisToComplete(analysisId, apiKey);

      res.json(result);
    } catch (error) {
      console.error('Error scanning URL:', error.response?.data || error.message);
      res.status(500).json({
        message: 'فشل فحص الرابط. ربما هناك مشكلة في السيرفر.',
        error: error.response?.data || error.message
      });
    }
  } else {
    res.status(400).json({ message: 'لا يوجد ملف أو رابط مُدخل' });
  }
});

// تشغيل الخادم
app.listen(3000, () => {
  console.log('Server is running on https://assumebreachesback.onrender.com');
});
