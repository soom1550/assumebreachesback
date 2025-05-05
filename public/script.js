document.getElementById('scan-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // إظهار شريط التحميل
    document.getElementById('loading-bar').style.display = 'block'; // إظهار شريط التحميل
    document.getElementById('result-box').style.display = 'none';  // إخفاء النتيجة القديمة

    const fileInput = document.getElementById('file-upload');
    const urlInput = document.getElementById('url-input');
    const formData = new FormData();

    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }

    const url = urlInput.value.trim();

    if (url) {
        formData.append('url', url);
    }

    // إجراء الفحص عبر API
    axios.post('https://https://assumebreachesback.onrender.com', formData)
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
