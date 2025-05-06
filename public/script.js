document.getElementById('scan-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // إظهار شريط التحميل
    document.getElementById('loading-bar').style.display = 'block';
    document.getElementById('result-box').style.display = 'none';

    const fileInput = document.getElementById('file-upload');
    const urlInput = document.getElementById('url');
    const formData = new FormData();

    const hasFile = fileInput.files.length > 0;
    const url = urlInput.value.trim();
    const hasUrl = url !== "";

    // التحقق من حجم الملف قبل الإرسال
    if (hasFile && fileInput.files[0].size > 70 * 1024 * 1024) {
        alert("الملف كبير جداً. الحد الأقصى المسموح به هو 70MB.");
        document.getElementById('loading-bar').style.display = 'none';
        return;
    }

    // التحقق من أن المستخدم أدخل إما ملف أو رابط
    if (!hasFile && !hasUrl) {
        alert("يرجى إدخال رابط أو تحميل ملف");
        document.getElementById('loading-bar').style.display = 'none';
        return;
    }

    if (hasFile) {
        formData.append('file', fileInput.files[0]);
    }

    if (hasUrl) {
        formData.append('url', url);
    }

    // إرسال البيانات إلى السيرفر
    axios.post('https://assumebreachesback.onrender.com/scan', formData)
        .then(function(response) {
            document.getElementById('loading-bar').style.display = 'none';

            const resultData = response.data.data || {};
            const stats = resultData.attributes?.stats || {};

            const statsHtml = `
                <div class="stat-item"><strong>Malicious:</strong> ${stats.malicious || 0}</div>
                <div class="stat-item"><strong>Suspicious:</strong> ${stats.suspicious || 0}</div>
                <div class="stat-item"><strong>Undetected:</strong> ${stats.undetected || 0}</div>
                <div class="stat-item"><strong>Harmless:</strong> ${stats.harmless || 0}</div>
                <div class="stat-item"><strong>Timeout:</strong> ${stats.timeout || 0}</div>
            `;

            document.getElementById('result-content').innerHTML = `
                <p><strong>الحالة:</strong> ${resultData.attributes?.status || 'غير محدد'}</p>
                <p><strong>الإحصائيات:</strong></p>
                <div class="stats-container">${statsHtml}</div>
            `;
            document.getElementById('result-box').style.display = 'block';
        })
        .catch(function(error) {
            document.getElementById('loading-bar').style.display = 'none';
            document.getElementById('result-content').innerHTML = `
                <strong>حدث خطأ:</strong> ${error.response?.data?.message || error.message}
            `;
            document.getElementById('result-box').style.display = 'block';
        });
});
