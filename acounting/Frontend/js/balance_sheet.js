document.addEventListener('DOMContentLoaded', async () => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    let accountsReceivable = 0;
    let inventoryValue = 0;

    try {
        const invoices = await getInvoices();
        invoices.forEach(inv => {
            const amount = Number(String(inv.amount).replace(/,/g, '')) || 0;
            if (inv.status === 'Paid') totalRevenue += amount;
            else accountsReceivable += amount;
        });
    } catch (e) {}

    try {
        const expenses = await getExpenses();
        expenses.forEach(exp => { totalExpenses += Number(String(exp.amount).replace(/,/g, '')) || 0; });
    } catch (e) {}

    try {
        const inventory = await getInventory();
        inventory.forEach(item => {
            inventoryValue += (Number(item.price) || 0) * (Number(item.stock) || 0);
        });
    } catch (e) {}

    const cashBalance = totalRevenue - totalExpenses;
    const totalAssets = cashBalance + accountsReceivable + inventoryValue;
    const totalLiabilities = 0;
    const totalEquity = totalAssets - totalLiabilities;

    // Animate the numbers!
    animateValue('bsCash', 0, cashBalance, 1500, true);
    animateValue('bsAR', 0, accountsReceivable, 1500, true);
    animateValue('bsInventory', 0, inventoryValue, 1500, true);
    animateValue('bsTotalAssets', 0, totalAssets, 1500, true);
    animateValue('bsTotalLiabilities', 0, totalLiabilities, 1500, true);
    animateValue('bsTotalEquity', 0, totalEquity, 1500, true);

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