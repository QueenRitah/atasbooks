document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Check if user is logged in
    const userInfo = localStorage.getItem('userInfo');
    const token = localStorage.getItem('userToken');
    
    if (!userInfo || !token) {
        alert("Your session has expired. Please log in again.");
        window.location.href = 'login.html';
        return;
    } 
    
    const user = JSON.parse(userInfo);
    
    document.getElementById('userName').innerText = `Welcome, ${user.name}`;
    document.getElementById('heroUserName').innerText = `Welcome back, ${user.name}!`;

    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalCreditNotes = 0; 
    let outstanding = 0;

    // 2. Fetch Invoices
    try {
        const invoices = await getInvoices();
        invoices.forEach(inv => {
            const amount = Number(String(inv.amount).replace(/,/g, '')) || 0;
            if (inv.status === 'Paid') {
                totalRevenue += amount;
            } else {
                outstanding += amount;
            }
        });
    } catch (error) {
        console.error("Error calculating invoice stats:", error);
    }

    // 3. Fetch Credit Notes
    try {
        const notes = await getCreditNotes();
        notes.forEach(note => {
            const amount = Number(String(note.amount).replace(/,/g, '')) || 0;
            totalCreditNotes += amount;
        });
    } catch (error) {
        console.error("Error fetching credit notes:", error);
    }

    const adjustedRevenue = totalRevenue - totalCreditNotes;

    // 4. Fetch Expenses
    try {
        const expenses = await getExpenses();
        expenses.forEach(exp => {
            const amount = Number(String(exp.amount).replace(/,/g, '')) || 0;
            totalExpenses += amount;
        });
    } catch (error) {
        console.error("Error calculating expenses:", error);
    }

    // 5. Calculate Net Profit
    const netProfit = adjustedRevenue - totalExpenses;

    // 6. Fetch Customers Count
    let customerCount = 0;
    try {
        const customers = await getCustomers();
        customerCount = customers.length;
    } catch (error) {
        console.error("Error loading customers:", error);
    }

    // 7. ANIMATE THE NUMBERS!
    animateValue('totalRevenue', 0, adjustedRevenue, 1500, true);
    animateValue('outstanding', 0, outstanding, 1500, true);
    animateValue('totalExpenses', 0, totalExpenses, 1500, true);
    animateValue('heroNetProfit', 0, netProfit, 1500, true);
    animateValue('totalCustomers', 0, customerCount, 1000, false);

    // 8. Draw the Graph!
    const ctx = document.getElementById('financeChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Total Revenue', 'Total Expenses'],
                datasets: [{
                    label: 'KES',
                    data: [adjustedRevenue, totalExpenses],
                                     backgroundColor: [
                        'rgba(132, 204, 22, 0.6)',  // Lime for Revenue
                        'rgba(23, 37, 84, 0.6)'     // Navy for Expenses
                    ],
                    borderColor: [
                        'rgba(132, 204, 22, 1)',
                        'rgba(23, 37, 84, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'KES ' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
        // 8.5 PWA Install Logic
    let deferredPrompt;
    const installBtn = document.getElementById('installBtn');

    // Make sure the button is visible if the browser allows it
    if(installBtn) installBtn.style.display = 'inline-block';

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installBtn) installBtn.style.display = 'inline-block';
    });

    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    installBtn.style.display = 'none';
                    deferredPrompt = null;
                }
            } else {
                alert('To install: Click the 3 dots at the top right of your browser, go to "Save and share" (or "Apps"), and click "Install page as app...".');
            }
        });
    }

    // 9. Handle Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        window.location.href = 'login.html';
    });
});

// The Magic Counting Animation Function
function animateValue(id, start, end, duration, isCurrency) {
    const obj = document.getElementById(id);
    if (!obj) return;
    
    let startTime = null;
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        
        if (isCurrency) {
            obj.innerText = `KES ${current.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        } else {
            obj.innerText = current;
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            // Ensure exact final value is set
            if (isCurrency) {
                obj.innerText = `KES ${end.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            } else {
                obj.innerText = end;
            }
        }
    }
    window.requestAnimationFrame(step);
}