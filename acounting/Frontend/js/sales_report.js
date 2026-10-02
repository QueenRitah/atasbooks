document.addEventListener('DOMContentLoaded', async () => {
    let grossSales = 0;
    let totalCreditNotes = 0;

    try {
        const invoices = await getInvoices();
        invoices.forEach(inv => {
            grossSales += Number(String(inv.amount).replace(/,/g, '')) || 0;
        });
    } catch (e) { console.error("Error fetching invoices:", e); }

    try {
        const notes = await getCreditNotes();
        notes.forEach(note => {
            totalCreditNotes += Number(String(note.amount).replace(/,/g, '')) || 0;
        });
    } catch (e) { console.error("Error fetching credit notes:", e); }

    const netSales = grossSales - totalCreditNotes;

    animateValue('heroGross', 0, grossSales, 1500, true);
    animateValue('heroCn', 0, totalCreditNotes, 1500, true);
    animateValue('heroNet', 0, netSales, 1500, true);
    
    document.getElementById('tblGross').innerText = `KES ${grossSales.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('tblCn').innerText = `(-) KES ${totalCreditNotes.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('tblNet').innerText = `KES ${netSales.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

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