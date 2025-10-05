// js/settings.js

let accounts = [];
let token = localStorage.getItem('token');
let currentUser = null;

if (!token) {
  window.location.href = `/login?redirectUrl=${encodeURIComponent(window.location.pathname)}`;
}

async function loadUserInfo() {
  try {
    const response = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (data.success) {
      currentUser = data.data;
      displayUserInfo(currentUser);
      document.getElementById('user-name').textContent = currentUser.name;
    }
  } catch (error) {
    console.error('Error loading user info:', error);
  }
}

function displayUserInfo(user) {
  const container = document.getElementById('userInfo');
  container.innerHTML = `
                <div class="user-details">
                    <p><strong>Tên:</strong> ${user.name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Điện thoại:</strong> ${user.phone || 'N/A'}</p>
                    <p><strong>Ngôn ngữ:</strong> ${user.language || 'vi'}</p>
                    <p><strong>Tiền tệ:</strong> ${user.currency || 'VND'}</p>
                </div>
            `;

  // Set preferences
  if (user.language) {
    document.getElementById('language').value = user.language;
  }
  if (user.currency) {
    document.getElementById('currency').value = user.currency;
  }
}

async function loadBankAccounts() {
  try {
    const response = await fetch('/api/bank-accounts?limit=100', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (data.success) {
      accounts = data.data;
      displayBankAccounts(accounts);
    }
  } catch (error) {
    console.error('Error loading bank accounts:', error);
  }
}

function displayBankAccounts(accountsData) {
  const container = document.getElementById('bankAccountsList');

  if (accountsData.length === 0) {
    container.innerHTML = '<p>Chưa có tài khoản ngân hàng nào.</p>';
    return;
  }

  const list = accountsData.map(account => `
                <div class="bank-account-item" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 5px;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h3 style="margin: 0 0 10px 0;">
                                ${account.bank}
                                ${account.isDefault ? '<span class="badge badge-primary">Mặc định</span>' : ''}
                                ${!account.isActive ? '<span class="badge badge-secondary">Không hoạt động</span>' : ''}
                            </h3>
                            <p style="margin: 5px 0;"><strong>Chủ TK:</strong> ${account.accountHolder}</p>
                            <p style="margin: 5px 0;"><strong>Số TK:</strong> ${account.accountNumber}</p>
                            ${account.branch ? `<p style="margin: 5px 0;"><strong>Chi nhánh:</strong> ${account.branch}</p>` : ''}
                            ${account.identifier ? `<p style="margin: 5px 0;"><strong>Mã:</strong> ${account.identifier}</p>` : ''}
                            ${account.notes ? `<p style="margin: 5px 0;"><em>${account.notes}</em></p>` : ''}
                        </div>
                        <div>
                            ${!account.isDefault ? `<button class="btn btn-sm" onclick="setDefaultAccount('${account._id}')">Đặt mặc định</button>` : ''}
                            <button class="btn btn-sm" onclick="editAccount('${account._id}')">✏️</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteAccount('${account._id}')">🗑️</button>
                        </div>
                    </div>
                </div>
            `).join('');

  container.innerHTML = list;
}

function showAddAccountForm() {
  document.getElementById('modalTitle').textContent = 'Thêm Tài Khoản Ngân Hàng';
  document.getElementById('accountForm').reset();
  document.getElementById('accountId').value = '';
  document.getElementById('isActive').checked = true;
  document.getElementById('accountModal').style.display = 'block';
}

function closeAccountModal() {
  document.getElementById('accountModal').style.display = 'none';
}

async function editAccount(id) {
  const account = accounts.find(a => a._id === id);
  if (!account) return;

  document.getElementById('modalTitle').textContent = 'Chỉnh Sửa Tài Khoản Ngân Hàng';
  document.getElementById('accountId').value = account._id;
  document.getElementById('bank').value = account.bank;
  document.getElementById('accountHolder').value = account.accountHolder;
  document.getElementById('accountNumber').value = account.accountNumber;
  document.getElementById('branch').value = account.branch || '';
  document.getElementById('identifier').value = account.identifier || '';
  document.getElementById('isDefault').checked = account.isDefault;
  document.getElementById('isActive').checked = account.isActive;
  document.getElementById('notes').value = account.notes || '';
  document.getElementById('accountModal').style.display = 'block';
}

async function deleteAccount(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?')) return;

  try {
    const response = await fetch(`/api/bank-accounts/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.success) {
      alert('Xóa thành công!');
      loadBankAccounts();
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    alert('Có lỗi xảy ra!');
  }
}

async function setDefaultAccount(id) {
  try {
    const response = await fetch(`/api/bank-accounts/${id}/set-default`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.success) {
      alert('Đã đặt làm tài khoản mặc định!');
      loadBankAccounts();
    }
  } catch (error) {
    console.error('Error setting default:', error);
    alert('Có lỗi xảy ra!');
  }
}

document.getElementById('accountForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const accountId = document.getElementById('accountId').value;
  const accountData = {
    bank: document.getElementById('bank').value,
    accountHolder: document.getElementById('accountHolder').value,
    accountNumber: document.getElementById('accountNumber').value,
    branch: document.getElementById('branch').value,
    identifier: document.getElementById('identifier').value,
    isDefault: document.getElementById('isDefault').checked,
    isActive: document.getElementById('isActive').checked,
    notes: document.getElementById('notes').value
  };

  try {
    const url = accountId ? `/api/bank-accounts/${accountId}` : '/api/bank-accounts';
    const method = accountId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(accountData)
    });

    const data = await response.json();
    if (data.success) {
      alert(accountId ? 'Cập nhật thành công!' : 'Thêm tài khoản thành công!');
      closeAccountModal();
      loadBankAccounts();
    }
  } catch (error) {
    console.error('Error saving account:', error);
    alert('Có lỗi xảy ra!');
  }
});

async function savePreferences() {
  const language = document.getElementById('language').value;
  const currency = document.getElementById('currency').value;

  alert('Tính năng cập nhật tùy chỉnh đang được phát triển. Hiện tại chỉ lưu cục bộ.');
  localStorage.setItem('language', language);
  localStorage.setItem('currency', currency);
}

// Initial load
loadUserInfo();
loadBankAccounts();
