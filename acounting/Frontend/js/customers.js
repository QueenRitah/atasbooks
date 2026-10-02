let allCustomers = [];
let allInvoices = [];
let allCreditNotes = [];
let selectedCustomerId = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        allCustomers = await getCustomers();
        allInvoices = await getInvoices();
        allCreditNotes = await getCreditNotes();
        renderCustomers(allCustomers);
    } catch (error) {
        alert('Error loading data: ' + error.message);
    }

    document.getElementById('searchCustomers').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = allCustomers.filter(c => c.name.toLowerCase().includes(searchTerm));
        renderCustomers(filtered);
    });

    const addCustomerForm = document.getElementById('addCustomerForm');
    addCustomerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('custName').value;
        const company = document.getElementById('custCompany').value;
        const email = document.getElementById('custEmail').value;
        const phone = document.getElementById('custPhone').value;

        try {
            await createCustomer({ name, company, email, phone });
            alert('Customer added successfully!');
            window.location.reload();
        } catch (error) {
            alert('Error adding customer: ' + error.message);
        }
    });

    document.getElementById('deleteCustomerBtn').addEventListener('click', async () => {
        if (!selectedCustomerId) return;
        if (confirm('Are you sure you want to delete this customer? This cannot be undone.')) {
            try {
                await deleteCustomer(selectedCustomerId);
                alert('Customer deleted successfully!');
                window.location.reload();
            } catch (error) {
                alert('Error deleting customer: ' + error.message);
            }
        }
    });

    document.getElementById('actionNewTransaction').addEventListener('click', () => {
        window.location.href = 'invoices.html';
    });

    document.getElementById('actionEmail').addEventListener('click', () => {
        const customer = allCustomers.find(c => c.id == selectedCustomerId);
        if (customer && customer.email) {
            window.location.href = `mailto:${customer.email}?subject=Statement from Atas Books`;
        } else {
            alert('This customer does not have an email address saved.');
        }
    });

    // Handle Statement (Show in Modal)
    document.getElementById('actionStatement').addEventListener('click', () => {
        const customer = allCustomers.find(c => c.id == selectedCustomerId);
        if (customer) {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const cName = userInfo.company_name || 'Your Company Name';
            const cAddress = userInfo.company_address || 'Your Address';
            const cEmail = userInfo.company_email || 'your@email.com';
            const cLogo = userInfo.company_logo;

            const logoHtml = cLogo ? `<img src="${cLogo}" style="max-height: 80px; max-width: 200px; object-fit: contain;"><br>` : '';

            let totalAmount = 0;
            let totalPaid = 0;
            let totalUnpaid = 0;

            let tableRows = '';
            allInvoices.forEach(inv => {
                if (inv.customer_id == customer.id) {
                    const amount = Number(inv.amount) || 0;
                    totalAmount += amount;
                    if (inv.status === 'Paid') totalPaid += amount;
                    else totalUnpaid += amount;

                    const statusColor = inv.status === 'Paid' ? '#172554' : '#dc2626';
                    tableRows += `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 15px 12px; text-align: left; font-size: 14px;">${inv.invoice_number}</td>
                            <td style="padding: 15px 12px; text-align: right; font-size: 14px;">KES ${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td style="padding: 15px 12px; text-align: center; font-size: 14px; color: ${statusColor}; font-weight: 700;">${inv.status}</td>
                        </tr>
                    `;
                }
            });

            if (tableRows === '') {
                tableRows = `<tr><td colspan="3" style="padding: 20px; text-align: center; color: #64748b;">No transactions found.</td></tr>`;
            }

            const statementHtml = `
                <div id="statementContent" style="width: 100%; background: #fff; padding: 40px; box-sizing: border-box; color: #000; font-family: Arial, sans-serif;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 3px solid #84cc16; padding-bottom: 20px;">
                        <div>
                            ${logoHtml}
                            <h1 style="color: #172554; margin: 0; font-size: 24px;">${cName}</h1>
                            <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">${cAddress}<br>${cEmail}</p>
                        </div>
                        <div style="text-align: right;">
                            <h1 style="font-size: 32px; color: #84cc16; margin: 0;">Statement</h1>
                            <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Date: ${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div style="background: #f1f5f9; padding: 20px; border-radius: 10px; margin-bottom: 30px; border-left: 5px solid #172554;">
                        <strong style="color: #172554; font-size: 18px;">Bill To:</strong><br>
                        ${customer.name}<br>
                        ${customer.company || 'No company'}<br>
                        ${customer.email || 'No email'}
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                        <thead>
                            <tr style="background: #172554; color: #84cc16;">
                                <th style="padding: 15px; text-align: left; text-transform: uppercase; font-size: 12px;">Invoice #</th>
                                <th style="padding: 15px; text-align: center; text-transform: uppercase; font-size: 12px;">Amount</th>
                                <th style="padding: 15px; text-align: center; text-transform: uppercase; font-size: 12px;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>

                    <table style="width: 300px; margin-left: auto; border-collapse: collapse;">
                        <tr>
                            <td style="text-align: right; padding: 10px 15px; color: #555;">Total Amount:</td>
                            <td style="text-align: right; padding: 10px 15px; font-weight: bold;">KES ${totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                            <td style="text-align: right; padding: 10px 15px; color: #172554; font-weight: 700;">Total Paid:</td>
                            <td style="text-align: right; padding: 10px 15px; color: #172554; font-weight: 700;">KES ${totalPaid.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        </tr>
                        <tr>
                            <td style="text-align: right; padding: 10px 15px; color: #dc2626; font-weight: 700;">Total Unpaid:</td>
                            <td style="text-align: right; padding: 10px 15px; color: #dc2626; font-weight: 700;">KES ${totalUnpaid.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        </tr>
                        <tr style="border-top: 2px solid #172554;">
                            <td style="text-align: right; padding: 15px 15px; color: #172554; font-weight: 800; font-size: 18px;">Balance Due:</td>
                            <td style="text-align: right; padding: 15px 15px; color: #84cc16; font-weight: 800; font-size: 18px;">KES ${totalUnpaid.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        </tr>
                    </table>
                </div>
            `;
            
            document.getElementById('statementPreviewBody').innerHTML = statementHtml;
            const statementModal = new bootstrap.Modal(document.getElementById('statementModal'));
            statementModal.show();
        }
    });

    // Handle Download Statement Button
    document.getElementById('downloadStatementBtn').addEventListener('click', () => {
        const element = document.getElementById('statementContent');
        const customer = allCustomers.find(c => c.id == selectedCustomerId);
        const name = customer ? customer.name : 'Statement';
        
        const opt = {
            margin: 10,
            filename: 'Statement-' + name + '.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    });

    document.getElementById('actionHistory').addEventListener('click', () => {
        const customer = allCustomers.find(c => c.id == selectedCustomerId);
        if (customer) {
            alert(`History for ${customer.name}:\n\nThis feature will show a detailed timeline of all interactions and payments for this customer in a future update.`);
        }
    });
});

function renderCustomers(customers) {
    const container = document.getElementById('customerListContainer');
    
    if (customers.length === 0) {
        container.innerHTML = '<p class="text-center text-muted mt-5">No customers found.</p>';
        return;
    }

    container.innerHTML = customers.map(c => {
        let unpaid = 0;
        allInvoices.forEach(inv => {
            if (inv.customer_id == c.id && inv.status !== 'Paid') {
                unpaid += Number(String(inv.amount).replace(/,/g, '')) || 0;
            }
        });

        let paid = 0;
        allCreditNotes.forEach(cn => {
            if (cn.customer_id == c.id) {
                paid += Number(String(cn.amount).replace(/,/g, '')) || 0;
            }
        });

        const initial = c.name.charAt(0).toUpperCase();

        return `
            <div class="customer-card" onclick="openActionMenu(${c.id})">
                <div class="d-flex align-items-center">
                    <div class="customer-avatar">${initial}</div>
                    <div class="customer-info">
                        <h6>${c.name}</h6>
                        <small>${c.company || 'No company'}</small>
                    </div>
                </div>
                <div class="customer-financials">
                    <div class="unpaid-label"><i class="fas fa-exclamation-circle"></i> Unpaid: KES ${unpaid.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div class="paid-label"><i class="fas fa-check-circle"></i> Paid: KES ${paid.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
            </div>
        `;
    }).join('');
}

function openActionMenu(id) {
    selectedCustomerId = id;
    const customer = allCustomers.find(c => c.id == id);
    if (customer) {
        document.getElementById('actionMenuTitle').innerText = customer.name;
        const actionModal = new bootstrap.Modal(document.getElementById('actionMenuModal'));
        actionModal.show();
    }
}