// Excel Import/Export JavaScript
let selectedFile = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    setupFileUpload();
    setupExportDates();
});

// Setup file upload
const setupFileUpload = () => {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');

    // Click to select file
    uploadArea.addEventListener('click', (e) => {
        if (e.target === uploadArea || e.target.parentElement === uploadArea) {
            fileInput.click();
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });
};

// Handle file selection
const handleFileSelect = (file) => {
    // Validate file type
    const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/)) {
        showStatus('error', 'Vui lòng chọn file Excel (.xlsx hoặc .xls)');
        return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showStatus('error', 'File quá lớn. Vui lòng chọn file nhỏ hơn 10MB');
        return;
    }

    selectedFile = file;
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('selected-file').style.display = 'block';
    document.getElementById('import-status').style.display = 'none';
};

// Clear file selection
const clearFile = () => {
    selectedFile = null;
    document.getElementById('file-input').value = '';
    document.getElementById('selected-file').style.display = 'none';
    document.getElementById('import-status').style.display = 'none';
};

// Upload file
const uploadFile = async () => {
    if (!selectedFile) {
        showStatus('error', 'Vui lòng chọn file để upload');
        return;
    }

    showStatus('info', 'Đang upload và import dữ liệu...');

    try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/excel/import`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Upload thất bại');
        }

        if (data.success) {
            const results = data.data;
            const message = `
                Import thành công!<br>
                - Thuê phòng: ${results.rentals || 0}<br>
                - Lương: ${results.salaries || 0}<br>
                - Chi tiêu: ${results.expenses || 0}<br>
                - Tiền gửi: ${results.deposits || 0}<br>
                - Tài khoản ngân hàng: ${results.bankAccounts || 0}
            `;
            showStatus('success', message);
            clearFile();
        } else {
            throw new Error(data.message || 'Import thất bại');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showStatus('error', `Lỗi: ${error.message}`);
    }
};

// Export data
const exportData = async () => {
    const startDate = document.getElementById('export-start-date').value;
    const endDate = document.getElementById('export-end-date').value;

    try {
        let url = `${API_BASE_URL}/excel/export`;
        const params = new URLSearchParams();
        
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }

        const token = getAuthToken();
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Export thất bại');
        }

        // Download file
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `financial-data-${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);

        showStatus('success', 'Export thành công!');
    } catch (error) {
        console.error('Export error:', error);
        showStatus('error', `Lỗi: ${error.message}`);
    }
};

// Setup export dates
const setupExportDates = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    document.getElementById('export-start-date').valueAsDate = firstDayOfMonth;
    document.getElementById('export-end-date').valueAsDate = lastDayOfMonth;
};

// Show status message
const showStatus = (type, message) => {
    const statusDiv = document.getElementById('import-status');
    statusDiv.className = `status-message ${type}`;
    statusDiv.innerHTML = message;
    statusDiv.style.display = 'block';
};
