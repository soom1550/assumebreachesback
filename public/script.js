document.getElementById('scan-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // إظهار شريط التحميل
    document.getElementById('loading-bar').style.display = 'block'; // إظهار شريط التحميل
    document.getElementById('result-box').style.display = 'none';  // إخفاء النتيجة القديمة

    const fileInput = document.getElementById('file-upload');
    const urlInput = document.getElementById('url'); // تأكد من أن id هنا يتطابق مع id الموجود في HTML
    const formData = new FormData();

    // التحقق من وجود ملف تم تحميله
    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }

    // التحقق من وجود رابط مدخل
    const url = urlInput.value.trim();
    if (url) {
        formData.append('url', url);
    }

    // تأكد من أنه إما تم تحميل ملف أو إدخال رابط
    if (fileInput.files.length === 0 && url === "") {
        alert("يرجى إدخال رابط أو تحميل ملف");
        document.getElementById('loading-bar').style.display = 'none'; // إخفاء شريط التحميل إذا لم يتم إدخال شيء
        return;  // إيقاف تنفيذ الكود في حال عدم وجود رابط أو ملف
    }

    // إجراء الفحص عبر API
    axios.post('https://assumebreachesback.onrender.com/scan', formData)  // تأكد من أن الرابط صحيح هنا
        .then(function(response) {
            // إخفاء شريط التحميل بعد الانتهاء
            document.getElementById('loading-bar').style.display = 'none'; // إخفاء شريط التحميل

            // عرض النتيجة
            document.getElementById('result-content').innerHTML = `
                <pre>${JSON.stringify(response.data, null, 2)}</pre>
            `;
            document.getElementById('result-box').style.display = 'block'; // إظهار النتيجة بعد الفحص
        })
        .catch(function(error) {
            // إخفاء شريط التحميل بعد الخطأ
            document.getElementById('loading-bar').style.display = 'none'; // إخفاء شريط التحميل

            // عرض الخطأ
            document.getElementById('result-content').innerHTML = `حدث خطأ: ${error.message}`;
            document.getElementById('result-box').style.display = 'block';
        });
});
