document.addEventListener('DOMContentLoaded', async () => {
    let cashIn = 0;
    let cashOut = 0;

    try {
        const invoices = await getInvoices();
        invoices.forEach(inv => {
            if (inv.status === 'Paid') {
                cashIn += Number(String(inv.amount).replace(/,/g, '')) || 0;
            }
        });
    } catch (e) {}

    try {
        const expenses = await getExpenses();
        expenses.forEach(exp => {
            cashOut += Number(String(exp.amount).replace(/,/g, '')) || 0;
        });
    } catch (e) {}

    const netCash = cashIn - cashOut;
    
    // Set colors based on profit/loss BEFORE animating
    const netEl = document.getElementById('cfNet');
    const netTableEl = document.getElementById('cfNetTable');
    
    if (netCash < 0) {
        netEl.style.color = '#fee2e2'; // Light red inside navy card
        netTableEl.style.color = '#dc2626';
    } else {
        netEl.style.color = '#ffffff'; 
        netTableEl.style.color = '#84cc16';
    }

    // Animate the numbers!
    animateValue('cfIn', 0, cashIn, 1500, true);
    animateValue('cfOut', 0, cashOut, 1500, true);
    animateValue('cfNet', 0, netCash, 1500, true);
    animateValue('cfInTable', 0, cashIn, 1500, true);
    animateValue('cfOutTable', 0, cashOut, 1500, true);
    animateValue('cfNetTable', 0, netCash, 1500, true);

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        window.location.href = 'login.html';
    });
});

// The Magic Counting Animation Function
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