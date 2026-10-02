document.addEventListener('DOMContentLoaded', async () => {
    let totalPurchases = 0;
    let transactionCount = 0;
    const categories = {};

    try {
        const expenses = await getExpenses();
        transactionCount = expenses.length;
        expenses.forEach(exp => {
            const amount = Number(String(exp.amount).replace(/,/g, '')) || 0;
            totalPurchases += amount;
            const cat = exp.category || 'Miscellaneous';
            if(!categories[cat]) categories[cat] = 0;
            categories[cat] += amount;
        });
    } catch (e) {}

    const avgPurchase = transactionCount > 0 ? totalPurchases / transactionCount : 0;

    animateValue('heroTotal', 0, totalPurchases, 1500, true);
    animateValue('heroCount', 0, transactionCount, 1000, false);
    animateValue('heroAvg', 0, avgPurchase, 1500, true);
    
    // Populate Category Table
    const tbody = document.getElementById('purchasesTableBody');
    let html = '';
    for (const cat in categories) {
        html += `<tr><td class="fw-bold">${cat}</td><td class="text-end">KES ${categories[cat].toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td></tr>`;
    }
    
    if(html === '') {
        tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">No purchases recorded yet.</td></tr>';
    } else {
        tbody.innerHTML = html + `
            <tr style="border-top: 2px solid #172554;">
                <td class="text-start fw-bold fs-5 pt-3">Total Purchases</td>
                <td class="text-end fs-5 fw-bold pt-3" style="color: #dc2626;">KES ${totalPurchases.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>
        `;
    }

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        window.location.href = 'login.html';
    });
});

// Magic Counting Animation
function animateValue(id, start, end, duration, isCurrency, prefix = '') {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTime = null;
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        if (isCurrency) {
            obj.innerText = `${prefix}KES ${current.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        } else {
            obj.innerText = `${prefix}${current}`;
        }
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            if (isCurrency) {
                obj.innerText = `${prefix}KES ${end.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            } else {
                obj.innerText = `${prefix}${end}`;
            }
        }
    }
    window.requestAnimationFrame(step);
}