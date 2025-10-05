// js/expenses.js

document.addEventListener('DOMContentLoaded', async () => {
  await loadExpenses();
});

const loadExpenses = async () => {
  const container = document.getElementById('expenses-list');
  container.innerHTML = '<p class="loading">Đang tải...</p>';

  try {
    const response = await apiCall('/expenses');

    if (response.success && response.data) {
      if (response.data.length === 0) {
        container.innerHTML = '<p class="loading">Chưa có dữ liệu. Vui lòng import từ Excel.</p>';
        return;
      }

      // Calculate 6 jars totals
      let jars = {
        mother: 0, nec: 0, ffa: 0, educ: 0, play: 0, give: 0, lts: 0
      };

      response.data.forEach(expense => {
        if (expense.allocation) {
          jars.mother += expense.allocation.motherGift || 0;
          jars.nec += expense.allocation.nec || 0;
          jars.ffa += expense.allocation.ffa || 0;
          jars.educ += expense.allocation.educ || 0;
          jars.play += expense.allocation.play || 0;
          jars.give += expense.allocation.give || 0;
          jars.lts += expense.allocation.lts || 0;
        }
      });

      // Update jar displays
      document.getElementById('jar-mother').textContent = formatCurrency(jars.mother);
      document.getElementById('jar-nec').textContent = formatCurrency(jars.nec);
      document.getElementById('jar-ffa').textContent = formatCurrency(jars.ffa);
      document.getElementById('jar-educ').textContent = formatCurrency(jars.educ);
      document.getElementById('jar-play').textContent = formatCurrency(jars.play);
      document.getElementById('jar-give').textContent = formatCurrency(jars.give);
      document.getElementById('jar-lts').textContent = formatCurrency(jars.lts);

      // Display table
      container.innerHTML = `
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Tháng</th>
                                    <th>Danh mục</th>
                                    <th>Khoản chi</th>
                                    <th>Số lượng</th>
                                    <th>Đơn giá</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${response.data.map(expense => `
                                    <tr>
                                        <td>${new Date(expense.month).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}</td>
                                        <td><strong>${expense.category}</strong></td>
                                        <td>${expense.itemName}</td>
                                        <td>${expense.quantity || 1}</td>
                                        <td>${formatCurrency(expense.unitPrice || 0)}</td>
                                        <td><strong>${formatCurrency(expense.totalAmount || 0)}</strong></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `;
    } else {
      container.innerHTML = '<p class="loading">Không thể tải dữ liệu</p>';
    }
  } catch (error) {
    console.error('Failed to load expenses:', error);
    container.innerHTML = '<p class="loading">Lỗi: Không thể tải dữ liệu. Hãy import dữ liệu từ Excel.</p>';
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

