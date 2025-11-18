// Money Keeper Settings Page JavaScript

let validatedWallets = [];

document.addEventListener('DOMContentLoaded', () => {
  // Load existing configuration
  loadCurrentConfig();

  // Setup event listeners
  document.getElementById('btnCheckAccount').addEventListener('click', handleCheckAccount);
  document.getElementById('moneyKeeperConfigForm').addEventListener('submit', handleSaveConfig);
});

/**
 * Load current Money Keeper configuration
 */
async function loadCurrentConfig() {
  try {
    const response = await fetch('/api/money-keeper/config', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const result = await response.json();

    if (result.success && result.data.configured) {
      // Show current configuration status
      const configStatus = document.getElementById('configStatus');
      configStatus.style.display = 'block';
      configStatus.innerHTML = `
        <strong>✓ Đã cấu hình</strong><br>
        Username: ${result.data.username}<br>
        Xác thực lần cuối: ${new Date(result.data.lastValidated).toLocaleString('vi-VN')}
      `;

      // Pre-fill username
      document.getElementById('username').value = result.data.username;
    }
  } catch (error) {
    console.error('Error loading configuration:', error);
  }
}

/**
 * Handle check account button click
 */
async function handleCheckAccount() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    showMessage('error', 'Vui lòng nhập username và password');
    return;
  }

  // Show loading state
  const btn = document.getElementById('btnCheckAccount');
  const btnText = btn.querySelector('.btn-text');
  const btnLoading = btn.querySelector('.btn-loading');
  
  btn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline';

  try {
    const response = await fetch('/api/money-keeper/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (result.success) {
      showMessage('success', '✓ Xác thực thành công! Đang tải danh sách ví...');
      
      // Store validated wallets
      validatedWallets = result.data.wallets;
      
      // Display wallets
      displayWallets(validatedWallets);
      
      // Show save button
      document.getElementById('btnSaveConfig').style.display = 'block';
    } else {
      showMessage('error', result.message || 'Xác thực thất bại. Vui lòng kiểm tra thông tin đăng nhập.');
      hideWalletSection();
    }
  } catch (error) {
    console.error('Validation error:', error);
    showMessage('error', 'Đã xảy ra lỗi khi xác thực. Vui lòng thử lại.');
    hideWalletSection();
  } finally {
    // Reset button state
    btn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
}

/**
 * Display wallets in the UI
 */
function displayWallets(wallets) {
  const walletSection = document.getElementById('walletSection');
  const walletList = document.getElementById('walletList');

  if (!wallets || wallets.length === 0) {
    walletList.innerHTML = '<div class="no-wallets">Không tìm thấy ví nào trong tài khoản.</div>';
    walletSection.style.display = 'block';
    return;
  }

  // Create wallet cards
  walletList.innerHTML = wallets.map(wallet => createWalletCard(wallet)).join('');
  walletSection.style.display = 'block';

  // Scroll to wallet section
  walletSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Create HTML for a wallet card
 */
function createWalletCard(wallet) {
  const walletTypeLabel = getWalletTypeLabel(wallet.walletType);
  const isNegative = wallet.currentAmount < 0;
  const formattedAmount = formatCurrency(wallet.currentAmount);
  
  return `
    <div class="wallet-card ${wallet.inActive ? 'inactive' : ''}">
      <div class="wallet-header">
        ${wallet.bankLogo 
          ? `<img src="${wallet.bankLogo}" alt="${wallet.bankName}" class="wallet-logo" onerror="this.style.display='none'">` 
          : `<div class="wallet-logo-placeholder">${wallet.walletName.charAt(0)}</div>`
        }
        <div class="wallet-name">${wallet.walletName}</div>
        <span class="wallet-type-badge wallet-type-${wallet.walletType}">${walletTypeLabel}</span>
      </div>
      
      <div class="wallet-info">
        ${wallet.bankName ? `<div>🏦 ${wallet.bankName}</div>` : ''}
        <div>💱 ${wallet.currencyCode}</div>
        ${wallet.inActive ? '<div>⚠️ Không hoạt động</div>' : ''}
        ${wallet.excludeReport ? '<div>📊 Loại trừ báo cáo</div>' : ''}
      </div>
      
      <div class="wallet-amount ${isNegative ? 'negative' : ''}">
        ${formattedAmount}
      </div>
    </div>
  `;
}

/**
 * Get wallet type label
 */
function getWalletTypeLabel(type) {
  const labels = {
    1: 'Tài khoản',
    2: 'Tín dụng',
    3: 'Đầu tư'
  };
  return labels[type] || 'Khác';
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

/**
 * Hide wallet section
 */
function hideWalletSection() {
  document.getElementById('walletSection').style.display = 'none';
  document.getElementById('btnSaveConfig').style.display = 'none';
  validatedWallets = [];
}

/**
 * Handle save configuration
 */
async function handleSaveConfig(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    showMessage('error', 'Vui lòng nhập username và password');
    return;
  }

  if (validatedWallets.length === 0) {
    showMessage('error', 'Vui lòng kiểm tra tài khoản trước khi lưu');
    return;
  }

  // Show loading state
  const btn = document.getElementById('btnSaveConfig');
  const btnText = btn.querySelector('.btn-text');
  const btnLoading = btn.querySelector('.btn-loading');
  
  btn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline';

  try {
    const response = await fetch('/api/money-keeper/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        username,
        password,
        selectedWallets: validatedWallets.map(w => w.walletId)
      })
    });

    const result = await response.json();

    if (result.success) {
      showMessage('success', '✓ Cấu hình đã được lưu thành công!');
      
      // Update status
      const configStatus = document.getElementById('configStatus');
      configStatus.className = 'config-status';
      configStatus.style.display = 'block';
      configStatus.innerHTML = `
        <strong>✓ Đã cấu hình</strong><br>
        Username: ${username}<br>
        Số lượng ví: ${validatedWallets.length}<br>
        Cập nhật: ${new Date().toLocaleString('vi-VN')}
      `;

      // Clear password field
      document.getElementById('password').value = '';
    } else {
      showMessage('error', result.message || 'Không thể lưu cấu hình. Vui lòng thử lại.');
    }
  } catch (error) {
    console.error('Save config error:', error);
    showMessage('error', 'Đã xảy ra lỗi khi lưu cấu hình. Vui lòng thử lại.');
  } finally {
    // Reset button state
    btn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
}

/**
 * Show message to user
 */
function showMessage(type, text) {
  const messageDiv = document.getElementById('validationMessage');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = text;
  messageDiv.style.display = 'block';

  // Auto-hide after 5 seconds for success messages
  if (type === 'success') {
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }
}
