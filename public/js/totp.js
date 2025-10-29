// js/totp.js

let accounts = [];
let token = sdkAuth.getAuthToken();
let editingAccountId = null;
let totpTimers = {};
let totpDB = null; // IndexedDB instance

// Redirect to login if not authenticated
if (!sdkAuth.isAuthenticated()) {
  window.location.href = `/login?redirectUrl=${encodeURIComponent(window.location.pathname)}`;
}

// Load accounts on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize IndexedDB
  totpDB = new TOTPIndexedDB();
  await totpDB.init();

  // Load accounts from IndexedDB first (for offline capability)
  await loadAccountsFromIndexedDB();

  // Then sync with server to get latest data
  await syncWithServer();

  setupFormHandlers();
  setupQRScanner();
  setupThemeToggle();
});

// Setup form handlers
const setupFormHandlers = () => {
  const form = document.getElementById('account-form');
  const cancelBtn = document.getElementById('cancel-btn');
  const showFormBtn = document.getElementById('show-add-form-btn');
  const formSection = document.getElementById('form-section');

  // Show form when "Add Account" button is clicked
  showFormBtn.addEventListener('click', () => {
    formSection.style.display = 'block';
    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleFormSubmit();
  });

  cancelBtn.addEventListener('click', () => {
    resetForm();
  });
};

// Setup theme toggle
const setupThemeToggle = () => {
  const themeToggle = document.getElementById('theme-toggle');
  const icon = themeToggle.querySelector('.icon');

  // Check saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    icon.textContent = '☀️';
  }

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    icon.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
};

// Setup QR Scanner
let html5QrCode = null;
const setupQRScanner = () => {
  const scanBtn = document.getElementById('scan-qr-btn');
  const modal = document.getElementById('qr-scanner-modal');
  const closeBtn = document.getElementById('close-qr-scanner');
  const resultsDiv = document.getElementById('qr-reader-results');

  // Show QR scanner modal
  scanBtn.addEventListener('click', async () => {
    modal.style.display = 'block';
    await startQRScanner();
  });

  // Close modal
  closeBtn.addEventListener('click', async () => {
    await stopQRScanner();
    modal.style.display = 'none';
    resultsDiv.innerHTML = '';
    resultsDiv.classList.remove('show');
  });

  // Close modal on outside click
  modal.addEventListener('click', async (e) => {
    if (e.target === modal) {
      await stopQRScanner();
      modal.style.display = 'none';
      resultsDiv.innerHTML = '';
      resultsDiv.classList.remove('show');
    }
  });
};

// Start QR Scanner
const startQRScanner = async () => {
  const qrReaderDiv = document.getElementById('qr-reader');
  
  try {
    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode('qr-reader');
    }

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };

    await html5QrCode.start(
      { facingMode: "environment" }, // Use back camera
      config,
      onQRCodeScanned,
      onQRCodeError
    );
  } catch (err) {
    console.error('Failed to start QR scanner:', err);
    showNotification('Không thể khởi động camera. Vui lòng kiểm tra quyền truy cập.', 'error');
  }
};

// Stop QR Scanner
const stopQRScanner = async () => {
  if (html5QrCode && html5QrCode.isScanning) {
    try {
      await html5QrCode.stop();
      html5QrCode.clear();
    } catch (err) {
      console.error('Failed to stop QR scanner:', err);
    }
  }
};

// Handle QR Code scan success
const onQRCodeScanned = async (decodedText, decodedResult) => {
  console.log('QR Code scanned:', decodedText);
  
  const resultsDiv = document.getElementById('qr-reader-results');
  
  try {
    // Parse otpauth URL
    const otpData = parseOtpAuthUrl(decodedText);
    
    if (otpData) {
      resultsDiv.innerHTML = `<p class="success">✅ Quét thành công! Đang điền thông tin...</p>`;
      resultsDiv.classList.add('show');
      
      // Fill form with parsed data
      fillFormFromQRData(otpData);
      
      // Stop scanner and close modal
      await stopQRScanner();
      setTimeout(() => {
        document.getElementById('qr-scanner-modal').style.display = 'none';
        resultsDiv.innerHTML = '';
        resultsDiv.classList.remove('show');
      }, 1500);
      
      showNotification('Đã quét QR code thành công!');
    } else {
      resultsDiv.innerHTML = `<p class="error">❌ QR code không hợp lệ. Vui lòng quét QR code TOTP.</p>`;
      resultsDiv.classList.add('show');
    }
  } catch (error) {
    console.error('Failed to parse QR code:', error);
    resultsDiv.innerHTML = `<p class="error">❌ Lỗi khi xử lý QR code: ${error.message}</p>`;
    resultsDiv.classList.add('show');
  }
};

// Handle QR Code scan error
const onQRCodeError = (errorMessage) => {
  // Ignore frequent scanning errors
  // console.debug('QR scan error:', errorMessage);
};

// Parse otpauth:// URL
const parseOtpAuthUrl = (url) => {
  try {
    // Check if it's a valid otpauth URL
    if (!url.startsWith('otpauth://')) {
      return null;
    }

    const urlObj = new URL(url);
    
    // Extract type (totp or hotp)
    const pathParts = urlObj.href.split('://')[1].split('/');
    const type = pathParts[0].toUpperCase();
    
    // Extract label (issuer:accountName or just accountName)
    const path = decodeURIComponent(urlObj.pathname.substring(1));
    let issuer = '';
    let accountName = '';
    
    if (path.includes(':')) {
      const parts = path.split(':');
      issuer = parts[0];
      accountName = parts.slice(1).join(':');
    } else {
      accountName = path;
    }
    
    // Extract query parameters
    const params = new URLSearchParams(urlObj.search);
    const secret = params.get('secret');
    const algorithm = params.get('algorithm') || 'SHA1';
    const digits = parseInt(params.get('digits') || '6', 10);
    const period = parseInt(params.get('period') || '30', 10);
    const counter = parseInt(params.get('counter') || '0', 10);
    
    // Override issuer if provided in params
    if (params.get('issuer')) {
      issuer = params.get('issuer');
    }
    
    if (!secret) {
      throw new Error('Secret key không tìm thấy trong QR code');
    }
    
    return {
      type: type,
      issuer: issuer || accountName.split('@')[0],
      accountName,
      secret,
      algorithm,
      digits,
      period,
      counter
    };
  } catch (error) {
    console.error('Failed to parse otpauth URL:', error);
    return null;
  }
};

// Fill form with QR data
const fillFormFromQRData = (data) => {
  document.getElementById('service-name').value = data.issuer || data.accountName;
  document.getElementById('username').value = data.accountName;
  document.getElementById('secret-key').value = data.secret;
  document.getElementById('otp-type').value = data.type.toLowerCase();
  document.getElementById('digits').value = data.digits.toString();
  document.getElementById('interval').value = data.period.toString();
  
  if (data.type === 'HOTP') {
    document.getElementById('counter').value = data.counter.toString();
  }
  
  // Scroll to form to show filled data
  document.getElementById('form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Load all TOTP accounts from server and sync with IndexedDB
const syncWithServer = async () => {
  try {
    // Fetch accounts from server API with authentication
    const response = await sdkAuth.callApiWithAuth('/totp', 'GET', null, {
      query: { page: 1, limit: 100, sortBy: 'createdAt', order: 'desc' }
    });

    if (response.success && response.data) {
      accounts = response.data;

      // Save to IndexedDB
      if (Array.isArray(accounts)) {
        accounts.map(async (acc) => {
          // Sync each account object individually
          await totpDB.syncWithServer(acc);
        });
      } else {
        // Sync single account object
        await totpDB.syncWithServer(accounts);
      }

      if (accounts.length === 0) {
        const container = document.getElementById('accounts-container');
        container.innerHTML = '<div class="loading">Chưa có tài khoản nào. Hãy thêm tài khoản mới.</div>';
        return;
      }

      renderAccounts();
    }
  } catch (error) {
    console.error('Failed to sync with server:', error);
    // If sync fails but we have local data, continue with local data
    if (accounts.length > 0) {
      showNotification('Không thể đồng bộ với server, sử dụng dữ liệu offline', 'warning');
    }
  }
};

// Load accounts from IndexedDB (for offline support)
const loadAccountsFromIndexedDB = async () => {
  const container = document.getElementById('accounts-container');
  container.innerHTML = '<div class="loading">Đang tải...</div>';

  try {
    const localAccounts = await totpDB.getAllAccounts();

    if (localAccounts && localAccounts.length > 0) {
      accounts = localAccounts;
      renderAccounts();
      console.log('Loaded accounts from IndexedDB:', accounts.length);
    }
  } catch (error) {
    console.error('Failed to load from IndexedDB:', error);
  }
};

// Load all TOTP accounts (deprecated - replaced by syncWithServer)
const loadAccounts = async () => {
  await syncWithServer();
};

// Render accounts
const renderAccounts = () => {
  const container = document.getElementById('accounts-container');

  container.innerHTML = accounts
    .map(
      (account) => `
    <div class="account-card" data-id="${account.id}">
      <div class="account-header">
        <div class="account-info">
          <h3>${escapeHtml(account.serviceName)}</h3>
          <p>${escapeHtml(account.accountName)}</p>
        </div>
        <div class="account-actions">
          <button class="btn-sm btn-edit" onclick="editAccount('${account.id}')">✏️</button>
          <button class="btn-sm btn-delete" onclick="deleteAccount('${account.id}')">🗑️</button>
        </div>
      </div>
      <div class="totp-display">
        <div class="totp-code" id="code-${account.id}">------</div>
        <div class="totp-timer">
          <div class="timer-bar-container">
            <div class="timer-bar" id="timer-bar-${account.id}"></div>
          </div>
          <span class="timer-text" id="timer-${account.id}">--</span>
        </div>
      </div>
      <button class="btn-copy" onclick="copyCode('${account.id}')">
        📋 Sao chép mã
      </button>
    </div>
  `
    )
    .join('');

  // Start generating TOTP codes
  accounts.forEach((account) => {
    generateAndUpdateCode(account.id);
  });
};

// Generate and update TOTP code using client-side generation
const generateAndUpdateCode = (accountId) => {
  try {
    // Find account in local array
    const account = accounts.find(acc => acc.id === accountId);
    if (!account || !account.secret) {
      console.error(`Account ${accountId} not found or missing secret`);
      return;
    }

    // Generate TOTP code using client-side library
    const result = TOTPGenerator.generate(account.secret, {
      algorithm: account.algorithm || 'SHA1',
      digits: account.digits || 6,
      period: account.period || 30
    });

    const { token, timeRemaining, period } = result;

    // Update code display
    const codeElement = document.getElementById(`code-${accountId}`);
    if (codeElement) {
      codeElement.textContent = formatTotpCode(token);
    }

    // Update timer
    updateTimer(accountId, timeRemaining, period);
  } catch (error) {
    console.error(`Failed to generate code for ${accountId}:`, error);

    // Display error in code element
    const codeElement = document.getElementById(`code-${accountId}`);
    if (codeElement) {
      codeElement.textContent = '------';
      codeElement.style.color = '#ff4444';
    }
  }
};

// Format TOTP code with spaces
const formatTotpCode = (code) => {
  return code.match(/.{1,3}/g).join(' ');
};

// Update countdown timer
const updateTimer = (accountId, timeRemaining, period) => {
  const timerElement = document.getElementById(`timer-${accountId}`);
  const timerBar = document.getElementById(`timer-bar-${accountId}`);

  if (!timerElement || !timerBar) return;

  // Clear existing timer
  if (totpTimers[accountId]) {
    clearInterval(totpTimers[accountId]);
  }

  let remaining = timeRemaining;

  const updateDisplay = () => {
    timerElement.textContent = `${remaining}s`;
    const percentage = (remaining / period) * 100;
    timerBar.style.width = `${percentage}%`;

    remaining--;

    if (remaining < 0) {
      clearInterval(totpTimers[accountId]);
      generateAndUpdateCode(accountId);
    }
  };

  updateDisplay();
  totpTimers[accountId] = setInterval(updateDisplay, 1000);
};

// Copy TOTP code to clipboard
const copyCode = async (accountId) => {
  const codeElement = document.getElementById(`code-${accountId}`);
  if (!codeElement) return;

  const code = codeElement.textContent.replace(/\s/g, '');

  try {
    await navigator.clipboard.writeText(code);
    showNotification('Đã sao chép mã!');
  } catch (error) {
    console.error('Failed to copy:', error);
    showNotification('Không thể sao chép mã', 'error');
  }
};

// Handle form submission
const handleFormSubmit = async () => {
  const serviceName = document.getElementById('service-name').value.trim();
  const accountName = document.getElementById('username').value.trim();
  const secret = document.getElementById('secret-key').value.trim().toUpperCase();
  const otpType = document.getElementById('otp-type').value.trim().toUpperCase();
  const digits = parseInt(document.getElementById('digits').value, 6);
  const interval = parseInt(document.getElementById('interval').value, 30);
  const counter = parseInt(document.getElementById('counter').value, 0);

  if (!serviceName || !accountName || !secret) {
    showNotification('Vui lòng điền đầy đủ thông tin', 'error');
    return;
  }

  // Validate secret format
  if (!/^[A-Z2-7]+$/.test(secret)) {
    showNotification('Secret key không hợp lệ. Chỉ chấp nhận A-Z và 2-7', 'error');
    return;
  }

  // Prepare data for API call
  const data = {
    serviceName,
    accountName,
    secret,
    otpType,
    digits,
    period: interval,
    counter: otpType === 'HOTP' ? counter : undefined
  };
  // const { serviceName, accountName, secret, issuer, algorithm, digits, period } = req.body;

  try {
    let response;
    if (editingAccountId) {
      console.log("🚀 QuyNH: handleFormSubmit -> editingAccountId", editingAccountId)
      response = await sdkAuth.callApiWithAuth(`/totp/${editingAccountId}`, 'PUT', data);
    } else {
      response = await sdkAuth.callApiWithAuth('/totp', 'POST', data);
    }

    if (response.success) {
      showNotification(response.message);
      resetForm();

      // Sync with server to update IndexedDB
      await syncWithServer();
    } else {
      showNotification(response.message || 'Có lỗi xảy ra', 'error');
    }
  } catch (error) {
    console.error('Failed to save account:', error);
    showNotification('Không thể lưu tài khoản', 'error');
  }
};

// Edit account
const editAccount = (accountId) => {
  const account = accounts.find((a) => a.id === accountId);
  if (!account) return;

  editingAccountId = accountId;

  // Show form section
  const formSection = document.getElementById('form-section');
  formSection.style.display = 'block';
  formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('form-title').textContent = 'Chỉnh Sửa Tài Khoản';
  document.getElementById('service-name').value = account.serviceName;
  document.getElementById('username').value = account.accountName;
  document.getElementById('secret-key').value = '';
  document.getElementById('digits').value = account.digits;
  document.getElementById('interval').value = account.period;

  document.getElementById('submit-btn').innerHTML = '<span class="icon">💾</span> Cập Nhật';
  document.getElementById('cancel-btn').style.display = 'inline-block';
};

// Delete account
const deleteAccount = async (accountId) => {
  if (!confirm('Bạn có chắc muốn xóa tài khoản này?')) {
    return;
  }

  try {
    const response = await sdkAuth.callApiWithAuth(`/totp/${accountId}`, 'DELETE');

    if (response.success) {
      showNotification('Đã xóa tài khoản');

      // Clear timer
      if (totpTimers[accountId]) {
        clearInterval(totpTimers[accountId]);
        delete totpTimers[accountId];
      }

      // Delete from IndexedDB
      await totpDB.deleteAccount(accountId);

      // Reload accounts
      await syncWithServer();
    } else {
      showNotification(response.message || 'Không thể xóa tài khoản', 'error');
    }
  } catch (error) {
    console.error('Failed to delete account:', error);
    showNotification('Không thể xóa tài khoản', 'error');
  }
};

// Reset form
const resetForm = () => {
  editingAccountId = null;
  document.getElementById('account-form').reset();
  document.getElementById('form-title').textContent = 'Thêm Tài Khoản Mới';
  document.getElementById('submit-btn').innerHTML = '<span class="icon">➕</span> Thêm Tài Khoản';
  document.getElementById('cancel-btn').style.display = 'none';

  // Hide form section
  const formSection = document.getElementById('form-section');
  formSection.style.display = 'none';
};

// Show notification
const showNotification = (message, type = 'success') => {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
};

// Escape HTML to prevent XSS
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// API call helper
async function apiCallTotp(endpoint, method = 'GET', data = null) {
  console.log("🚀 QuyNH: apiCall -> endpoint", endpoint);
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`/api${endpoint}`, options);

  if (response.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = `/login?redirectUrl=${encodeURIComponent(window.location.pathname)}`;
    return;
  }

  return await response.json();
};

// Cleanup timers on page unload
window.addEventListener('beforeunload', () => {
  Object.values(totpTimers).forEach(clearInterval);
});
