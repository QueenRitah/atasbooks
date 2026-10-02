document.addEventListener('DOMContentLoaded', async () => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalCreditNotes = 0;

    try {
        const invoices = await getInvoices();
        invoices.forEach(inv => {
            const amount = Number(String(inv.amount).replace(/,/g, '')) || 0;
            if (inv.status === 'Paid') totalRevenue += amount;
        });
    } catch (e) {}

    try {
        const notes = await getCreditNotes();
        notes.forEach(note => {
            const amount = Number(String(note.amount).replace(/,/g, '')) || 0;
            totalCreditNotes += amount;
        });
    } catch (e) {}

    try {
        const expenses = await getExpenses();
        expenses.forEach(exp => {
            const amount = Number(String(exp.amount).replace(/,/g, '')) || 0;
            totalExpenses += amount;
        });
    } catch (e) {}

    const adjustedRevenue = totalRevenue - totalCreditNotes;
    const netProfit = adjustedRevenue - totalExpenses;
    
    // Set colors based on profit/loss BEFORE animating
    if (netProfit < 0) {
        document.getElementById('repNetProfit').style.color = '#dc2626';
        document.getElementById('heroNetProfit').style.color = '#fca5a5'; // Light red for navy card
    } else {
        document.getElementById('repNetProfit').style.color = '#84cc16';
        document.getElementById('heroNetProfit').style.color = '#ffffff'; 
    }

    // Animate the numbers! (Notice the prefix '(-) ' for credit notes)
    animateValue('repRevenue', 0, totalRevenue, 1500, true);
    animateValue('repCreditNotes', 0, totalCreditNotes, 1500, true, '(-) ');
    animateValue('repExpenses', 0, totalExpenses, 1500, true);
    animateValue('repNetProfit', 0, netProfit, 1500, true);
    
    animateValue('heroAdjRevenue', 0, adjustedRevenue, 1500, true);
    animateValue('heroExpenses', 0, totalExpenses, 1500, true);
    animateValue('heroNetProfit', 0, netProfit, 1500, true);

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