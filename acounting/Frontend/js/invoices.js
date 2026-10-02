let allInvoices = []; 

document.addEventListener('DOMContentLoaded', async () => {
    const invoiceTableBody = document.getElementById('invoiceTableBody');
    const customerSelect = document.getElementById('invCustomer');

    // 1. Fetch customers for the dropdown
    try {
        const customers = await getCustomers();
        if (customers.length > 0) {
            customerSelect.innerHTML = '<option value="">Select a Customer...</option>' + 
                customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        } else {
            customerSelect.innerHTML = '<option value="">No customers found. Add one first!</option>';
        }
    } catch (error) {
        alert('Error loading customers for dropdown: ' + error.message);
    }

    // 2. Fetch and display invoices
    try {
        allInvoices = await getInvoices();
        if (allInvoices.length === 0) {
            invoiceTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No invoices found. Create your first one!</td></tr>';
            document.getElementById('invNumber').value = 'INV-001';
        } else {
            invoiceTableBody.innerHTML = allInvoices.map(inv => `
                <tr>
                    <td>${inv.invoice_number}</td>
                    <td>${inv.customer_name}</td>
                    <td>KES ${Number(inv.amount).toFixed(2)}</td>
                    <td>
                        <span class="badge ${inv.status === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}">${inv.status}</span>
                    </td>
                    <td>${inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-'}</td>
                    <td>
                        <div class="d-flex gap-2">
                            ${inv.status !== 'Paid' ? `<button class="btn btn-sm btn-outline-success mark-paid-btn" data-id="${inv.id}"><i class="fas fa-check"></i> Mark Paid</button>` : ''}
                            <button class="btn btn-sm btn-outline-warning create-cn-btn" data-id="${inv.id}" title="Create Credit Note"><i class="fas fa-file-alt"></i> CN</button>
                            <button class="btn btn-sm btn-outline-primary download-btn" data-id="${inv.id}"><i class="fas fa-download"></i> PDF</button>
                        </div>
                    </td>
                </tr>
            `).join('');

            // --- AUTO-POPULATE NEXT INVOICE NUMBER ---
            let maxInvNum = 0;
            allInvoices.forEach(inv => {
                const match = inv.invoice_number.match(/(\d+)$/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > maxInvNum) {
                        maxInvNum = num;
                    }
                }
            });
            
            const nextNum = maxInvNum + 1;
            const nextInvNumber = `INV-${String(nextNum).padStart(3, '0')}`;
            document.getElementById('invNumber').value = nextInvNumber;
        }
    } catch (error) {
        alert('Error loading invoices: ' + error.message);
    }

    // Handle Clicks for Mark Paid, Create CN, and PDF
    invoiceTableBody.addEventListener('click', async (e) => {
        if (e.target.closest('.mark-paid-btn')) {
            const id = e.target.closest('.mark-paid-btn').getAttribute('data-id');
            try {
                await updateInvoiceStatus(id, 'Paid');
                alert('Invoice marked as Paid!');
                window.location.reload();
            } catch (error) {
                alert('Error updating status: ' + error.message);
            }
        }

        if (e.target.closest('.create-cn-btn')) {
            const id = e.target.closest('.create-cn-btn').getAttribute('data-id');
            const invoice = allInvoices.find(inv => inv.id == id);
            
            if (invoice) {
                if (confirm(`Create a credit note for ${invoice.customer_name} amounting to KES ${invoice.amount}?`)) {
                    try {
                        const cnNumber = 'CN-' + invoice.invoice_number.replace('INV-', '');
                        const today = new Date().toISOString().slice(0, 10);
                        
                        await createCreditNote({
                            customer_id: invoice.customer_id,
                            cn_number: cnNumber,
                            amount: invoice.amount,
                            reason: `Credit note for ${invoice.invoice_number}`,
                            date: today
                        });
                        
                        alert('Credit Note created successfully! You can view it on the Credit Notes page.');
                    } catch (error) {
                        alert('Error creating credit note: ' + error.message);
                    }
                }
            }
        }

        if (e.target.closest('.download-btn')) {
            const id = e.target.closest('.download-btn').getAttribute('data-id');
            const invoice = allInvoices.find(inv => inv.id == id);
            if (invoice) {
                generatePDF(invoice);
            }
        }
    });

    // 3. Handle Create Invoice Form
    const createInvoiceForm = document.getElementById('createInvoiceForm');
    createInvoiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const customer_id = document.getElementById('invCustomer').value;
        const invoice_number = document.getElementById('invNumber').value;
        const description = document.getElementById('invDescription').value;
        const amount = document.getElementById('invAmount').value;
        const status = document.getElementById('invStatus').value;
        const due_date = document.getElementById('invDueDate').value;
        const vat_applied = document.getElementById('invVatToggle').checked;

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const userVatRate = userInfo.vat_rate || 16;

        if(!customer_id || !amount) {
            alert("Please select a customer and enter an amount.");
            return;
        }

        try {
            await createInvoice({ customer_id, invoice_number, description, amount, status, due_date, vat_applied, vat_rate: userVatRate });
            alert('Invoice created successfully!');
            window.location.reload();
        } catch (error) {
            alert('Error creating invoice: ' + error.message);
        }
    });
});

// The Magic PDF Generator Function (Opens in Clean New Tab)
function generatePDF(invoice) {
    const cleanAmount = String(invoice.amount).replace(/,/g, '');
    const amount = Number(cleanAmount) || 0;
    
    const applyVat = invoice.vat_applied == 1 || invoice.vat_applied === true;
    const vatRate = Number(invoice.vat_rate) || 16; 
    
    const vat = applyVat ? (amount * (vatRate / 100)) : 0;
    const total = amount + vat;
    const balanceDue = invoice.status === 'Paid' ? 0 : total;

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const cName = userInfo.company_name || 'Your Company Name';
    const cAddress = userInfo.company_address || 'Your Address';
    const cEmail = userInfo.company_email || 'your@email.com';
    const cLogo = userInfo.company_logo;

    const logoHtml = cLogo ? `<img src="${cLogo}" style="max-height: 80px; max-width: 200px; object-fit: contain; display: block; margin-bottom: 10px;"><br>` : '';

    const vatRowHtml = applyVat ? `
        <tr>
            <td style="text-align: right; padding: 8px 0; color: #555;">VAT (${vatRate}%)</td>
            <td style="text-align: right; padding: 8px 15px; font-weight: bold;">KES ${vat.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        </tr>
    ` : '';

    const html = `
        <html>
        <head>
            <title>Invoice - ${invoice.invoice_number}</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            <style>
                body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 40px; color: #000; }
                .container { width: 210mm; padding: 20mm; box-sizing: border-box; background: #fff; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden; text-align: left; }
                table { width: 100%; border-collapse: collapse; margin: 0; padding: 0; }
                h1 { margin: 0; padding: 0; }
                p { margin: 5px 0 0 0; padding: 0; }
                hr { border: none; border-top: 2px solid #84cc16; margin: 20px 0; padding: 0; }
                .btn-download { background: #84cc16; color: #fff; border: none; padding: 15px 30px; border-radius: 6px; font-size: 16px; cursor: pointer; margin: 40px auto 0; display: block; width: 100%; font-weight: 600; text-align: center; }
                .btn-download:hover { background: #65a30d; }
            </style>
        </head>
        <body>
            <div class="container" id="invoiceContent">
                <table>
                    <tr>
                        <td style="vertical-align: top; width: 60%; text-align: left;">
                            ${logoHtml}
                            <h1 style="color: #172554; font-size: 28px; letter-spacing: 1px;">${cName}</h1>
                            <p style="font-size: 12px; color: #555; line-height: 1.5;">
                                ${cAddress}<br>
                                ${cEmail}
                            </p>
                        </td>
                        <td style="vertical-align: top; width: 40%; text-align: right;">
                            <h1 style="font-size: 36px; color: #0d0d0d; text-transform: uppercase;">Invoice</h1>
                            <p style="font-size: 14px; color: #555;">
                                <strong>#</strong> ${invoice.invoice_number}<br>
                                <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
                                <strong>Due Date:</strong> ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
                            </p>
                        </td>
                    </tr>
                </table>
                
                <hr>
                
                <table style="margin-bottom: 30px;">
                    <tr>
                        <td style="vertical-align: top; width: 50%; font-size: 14px; text-align: left;">
                            <strong style="color: #888; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 5px;">Bill To</strong><br>
                            <span style="font-size: 16px; font-weight: bold; color: #0d0d0d;">${invoice.customer_name}</span>
                        </td>
                        <td style="vertical-align: top; width: 50%; text-align: right;">
                            <div style="background-color: #172554; color: #84cc16; padding: 15px 20px; display: inline-block; border-radius: 4px;">
                                <span style="display: block; font-size: 12px; text-transform: uppercase;">Balance Due</span>
                                <span style="font-size: 24px; font-weight: bold;">KES ${balanceDue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>
                        </td>
                    </tr>
                </table>
                
                <table style="margin-bottom: 20px; font-size: 14px; text-align: left;">
                    <thead>
                        <tr style="background-color: #172554; color: #84cc16;">
                            <th style="text-align: left; padding: 12px; width: 60%;">Description</th>
                            <th style="text-align: center; padding: 12px; width: 10%;">Qty</th>
                            <th style="text-align: right; padding: 12px; width: 15%;">Rate</th>
                            <th style="text-align: right; padding: 12px; width: 15%;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 15px 12px; vertical-align: top; text-align: left;">${invoice.description || 'Accounting Services'}</td>
                            <td style="padding: 15px 12px; text-align: center;">1.00</td>
                            <td style="padding: 15px 12px; text-align: right;">${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td style="padding: 15px 12px; text-align: right;">${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        </tr>
                    </tbody>
                </table>
                
                <table style="margin-top: 20px; text-align: left;">
                    <tr>
                        <td style="width: 60%;"></td>
                        <td style="width: 40%;">
                            <table style="width: 100%; font-size: 14px;">
                                <tr>
                                    <td style="text-align: right; padding: 8px 0; color: #555;">Subtotal</td>
                                    <td style="text-align: right; padding: 8px 15px; width: 40%; font-weight: bold;">KES ${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                </tr>
                                ${vatRowHtml}
                                <tr style="background-color: #f4f4f4;">
                                    <td style="text-align: right; padding: 12px 0; font-weight: bold; color: #0d0d0d; font-size: 16px;">Total</td>
                                    <td style="text-align: right; padding: 12px 15px; font-weight: bold; color: #0d0d0d; font-size: 16px;">KES ${total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                </tr>
                                <tr>
                                    <td style="text-align: right; padding: 12px 0; font-weight: bold; color: #0d0d0d; font-size: 16px;">Balance Due</td>
                                    <td style="text-align: right; padding: 12px 15px; font-weight: bold; color: #172554; font-size: 16px;">KES ${balanceDue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                
                <div style="margin-top: 80px; border-top: 1px solid #eee; padding-top: 20px; text-align: left;">
                    <strong style="font-size: 12px; color: #888; text-transform: uppercase;">Notes</strong>
                    <p style="color: #555; font-size: 13px;">Thanks for your business.</p>
                </div>
            </div>

            <button class="btn-download" onclick="downloadInvoice()"><i class="fas fa-download"></i> Download Invoice PDF</button>

            <script>
                function downloadInvoice() {
                    const element = document.getElementById('invoiceContent');
                    const opt = {
                        margin: 10,
                        filename: '${invoice.invoice_number}.pdf',
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true, windowHeight: element.scrollHeight },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    };
                    html2pdf().set(opt).from(element).save();
                }
                
                // Automatically trigger download when the page loads!
                setTimeout(downloadInvoice, 1000);
            </script>
        </body>
        </html>
    `;
    
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
}