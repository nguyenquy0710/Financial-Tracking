let accounts = [];
let token = sdkAuth.getAuthToken();
let editingAccountId = null;
let totpTimers = {};

// Redirect to login if not authenticated
if (!sdkAuth.isAuthenticated()) {
  window.location.href = `/login?redirectUrl=${encodeURIComponent(window.location.pathname)}`;
}

// Load accounts on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Load accounts from server and render them
  await loadAccounts();

  setupFormHandlers();
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

// Load all TOTP accounts
const loadAccounts = async () => {
  const container = document.getElementById('accounts-container');
  container.innerHTML = '<div class="loading">Đang tải...</div>';

  try {
    // Fetch accounts from server API with authentication
    const response = await sdkAuth.callApiWithAuth('/totp', 'GET', null, {
      query: { page: 1, limit: 10, sortBy: 'createdAt', order: 'desc' }
    });

    if (response.success && response.data) {
      accounts = response.data;

      if (accounts.length === 0) {
        container.innerHTML = '<div class="loading">Chưa có tài khoản nào. Hãy thêm tài khoản mới.</div>';
        return;
      }

      renderAccounts();
    } else {
      container.innerHTML = '<div class="loading">Không thể tải dữ liệu</div>';
    }
  } catch (error) {
    console.error('Failed to load accounts:', error);
    container.innerHTML = '<div class="loading">Lỗi: Không thể tải dữ liệu</div>';
  }
};

// Render accounts
const renderAccounts = () => {
  const container = document.getElementById('accounts-container');

  container.innerHTML = accounts
    .map(
      (account) => `
    <div class="account-card" data-id="${account._id}">
      <div class="account-header">
        <div class="account-info">
          <h3>${escapeHtml(account.serviceName)}</h3>
          <p>${escapeHtml(account.accountName)}</p>
        </div>
        <div class="account-actions">
          <button class="btn-sm btn-edit" onclick="editAccount('${account._id}')">✏️</button>
          <button class="btn-sm btn-delete" onclick="deleteAccount('${account._id}')">🗑️</button>
        </div>
      </div>
      <div class="totp-display">
        <div class="totp-code" id="code-${account._id}">------</div>
        <div class="totp-timer">
          <div class="timer-bar-container">
            <div class="timer-bar" id="timer-bar-${account._id}"></div>
          </div>
          <span class="timer-text" id="timer-${account._id}">--</span>
        </div>
      </div>
      <button class="btn-copy" onclick="copyCode('${account._id}')">
        📋 Sao chép mã
      </button>
    </div>
  `
    )
    .join('');

  // Start generating TOTP codes
  accounts.forEach((account) => {
    generateAndUpdateCode(account._id);
  });
};

// Generate and update TOTP code
const generateAndUpdateCode = async (accountId) => {
  try {
    const response = await sdkAuth.callApiWithAuth(`/totp/${accountId}/generate`);

    if (response.success && response.data) {
      const { token, timeRemaining, period } = response.data;

      // Update code display
      const codeElement = document.getElementById(`code-${accountId}`);
      if (codeElement) {
        codeElement.textContent = formatTotpCode(token);
      }

      // Update timer
      updateTimer(accountId, timeRemaining, period);
    }
  } catch (error) {
    console.error(`Failed to generate code for ${accountId}:`, error);
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
    secret
  };
  // console.log("🚀 QuyNH: handleFormSubmit -> data", data);

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
      await loadAccounts();
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
  const account = accounts.find((a) => a._id === accountId);
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

      await loadAccounts();
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
