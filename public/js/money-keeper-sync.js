// Money Keeper Sync Data Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Check configuration status
  checkConfiguration();

  // Setup event listeners
  document.getElementById('btnSyncWallets').addEventListener('click', handleSyncWallets);
  document.getElementById('btnRefreshWallets').addEventListener('click', loadWallets);
});

/**
 * Check if Money Keeper is configured
 */
async function checkConfiguration() {
  try {
    const response = await fetch('/api/money-keeper/config', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const result = await response.json();

    const statusSection = document.getElementById('configStatusSection');

    if (result.success && result.data.configured) {
      statusSection.innerHTML = `
        <div class="config-status configured">
          <strong>✓ Đã cấu hình Money Keeper</strong><br>
          Username: ${result.data.username}<br>
          Xác thực lần cuối: ${new Date(result.data.lastValidated).toLocaleString('vi-VN')}
        </div>
      `;

      // Show sync section
      document.getElementById('syncSection').style.display = 'block';

      // Load existing wallets
      loadWallets();
    } else {
      statusSection.innerHTML = `
        <div class="config-status not-configured">
          <strong>⚠️ Chưa cấu hình Money Keeper</strong><br>
          Vui lòng vào <a href="/app/money-keeper/setting">trang cài đặt</a> để cấu hình Money Keeper trước khi đồng bộ.
        </div>
      `;
    }
  } catch (error) {
    console.error('Error checking configuration:', error);
    document.getElementById('configStatusSection').innerHTML = `
      <div class="message error">Đã xảy ra lỗi khi kiểm tra cấu hình</div>
    `;
  }
}

/**
 * Handle sync wallets
 */
async function handleSyncWallets() {
  const btn = document.getElementById('btnSyncWallets');
  const btnText = btn.querySelector('.btn-text');
  const btnLoading = btn.querySelector('.btn-loading');
  const messageDiv = document.getElementById('syncMessage');

  // Show loading state
  btn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline';
  messageDiv.style.display = 'none';

  try {
    const response = await fetch('/api/money-keeper/sync/wallets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({})
    });

    const result = await response.json();

    if (result.success) {
      showMessage('success', result.message);

      // Display sync results
      displaySyncResults(result.data);

      // Reload wallets list
      setTimeout(() => {
        loadWallets();
      }, 1000);
    } else {
      showMessage('error', result.message || 'Đồng bộ thất bại');
    }
  } catch (error) {
    console.error('Sync error:', error);
    showMessage('error', 'Đã xảy ra lỗi khi đồng bộ. Vui lòng thử lại.');
  } finally {
    // Reset button state
    btn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
}

/**
 * Display sync results
 */
function displaySyncResults(data) {
  const resultsDiv = document.getElementById('syncResults');
  const statsDiv = document.getElementById('syncStats');

  const html = `
    <div class="stat-card">
      <div class="stat-label">Tổng số ví</div>
      <div class="stat-value">${data.total}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Đã đồng bộ</div>
      <div class="stat-value" style="color: #28a745;">${data.synced}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Tạo mới</div>
      <div class="stat-value" style="color: #007bff;">${data.created}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Cập nhật</div>
      <div class="stat-value" style="color: #ffc107;">${data.updated}</div>
    </div>
    ${data.errors && data.errors.length > 0 ? `
      <div class="stat-card">
        <div class="stat-label">Lỗi</div>
        <div class="stat-value" style="color: #dc3545;">${data.errors.length}</div>
      </div>
    ` : ''}
  `;

  statsDiv.innerHTML = html;
  resultsDiv.style.display = 'block';

  // Show errors if any
  if (data.errors && data.errors.length > 0) {
    const errorList = data.errors.map(err => 
      `<li>${err.walletName}: ${err.error}</li>`
    ).join('');
    
    showMessage('warning', `Có ${data.errors.length} lỗi khi đồng bộ:<ul style="margin: 8px 0 0 20px;">${errorList}</ul>`);
  }
}

/**
 * Load wallets from database
 */
async function loadWallets() {
  const walletsList = document.getElementById('walletsList');
  const walletsSection = document.getElementById('walletsSection');

  walletsList.innerHTML = '<p class="loading">Đang tải danh sách ví...</p>';
  walletsSection.style.display = 'block';

  try {
    // Get wallets
    const walletsResponse = await fetch('/api/money-keeper/wallets', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const walletsResult = await walletsResponse.json();

    // Get summary
    const summaryResponse = await fetch('/api/money-keeper/wallets/summary', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const summaryResult = await summaryResponse.json();

    if (walletsResult.success && walletsResult.data.length > 0) {
      // Display summary
      displaySummary(summaryResult.data);

      // Display wallets
      displayWallets(walletsResult.data);
    } else {
      walletsList.innerHTML = '<div class="no-wallets">Chưa có ví nào được đồng bộ.<br>Nhấn nút "Đồng Bộ Ví Ngay" để bắt đầu.</div>';
      document.getElementById('walletsSummary').innerHTML = '';
    }
  } catch (error) {
    console.error('Error loading wallets:', error);
    walletsList.innerHTML = '<div class="message error">Không thể tải danh sách ví</div>';
  }
}

/**
 * Display wallet summary
 */
function displaySummary(summary) {
  const summaryDiv = document.getElementById('walletsSummary');

  const typeLabels = {
    1: 'Tài khoản',
    2: 'Tín dụng',
    3: 'Đầu tư'
  };

  const html = `
    <div class="summary-item">
      <div class="summary-label">Tổng số ví</div>
      <div class="summary-value">${summary.count}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Tổng số dư</div>
      <div class="summary-value ${summary.total >= 0 ? 'positive' : 'negative'}">
        ${formatCurrency(summary.total)}
      </div>
    </div>
    ${summary.byType.map(item => `
      <div class="summary-item">
        <div class="summary-label">${typeLabels[item.walletType] || 'Khác'}</div>
        <div class="summary-value">${item.count} ví</div>
        <div style="font-size: 12px; color: #666;">${formatCurrency(item.totalAmount)}</div>
      </div>
    `).join('')}
  `;

  summaryDiv.innerHTML = html;
}

/**
 * Display wallets
 */
function displayWallets(wallets) {
  const walletsList = document.getElementById('walletsList');

  const html = wallets.map(wallet => createWalletCard(wallet)).join('');
  walletsList.innerHTML = html;
}

/**
 * Create wallet card HTML
 */
function createWalletCard(wallet) {
  const walletTypeLabel = getWalletTypeLabel(wallet.walletType);
  const isNegative = wallet.currentAmount < 0;
  const formattedAmount = formatCurrency(wallet.currentAmount);
  const lastSynced = new Date(wallet.lastSynced).toLocaleString('vi-VN');

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

      <div class="wallet-meta">
        Đồng bộ lần cuối: ${lastSynced}
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
 * Show message
 */
function showMessage(type, text) {
  const messageDiv = document.getElementById('syncMessage');
  messageDiv.className = `message ${type}`;
  messageDiv.innerHTML = text;
  messageDiv.style.display = 'block';

  // Auto-hide success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }
}
