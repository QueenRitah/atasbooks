let allCreditNotes = []; // Store notes so the download button can find them

document.addEventListener('DOMContentLoaded', async () => {
    const cnTableBody = document.getElementById('cnTableBody');
    const customerSelect = document.getElementById('cnCustomer');

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

    // 2. Fetch and display credit notes
    try {
        allCreditNotes = await getCreditNotes();
        if (allCreditNotes.length === 0) {
            cnTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No credit notes found. Create your first one!</td></tr>';
        } else {
            cnTableBody.innerHTML = allCreditNotes.map(note => `
                <tr>
                    <td>${note.cn_number}</td>
                    <td>${note.customer_name}</td>
                    <td>KES ${Number(note.amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>${note.reason || '-'}</td>
                    <td>${note.date ? new Date(note.date).toLocaleDateString() : '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary download-cn-btn" data-id="${note.id}">
                            <i class="fas fa-download"></i> PDF
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        alert('Error loading credit notes: ' + error.message);
    }

    // Handle PDF Download Clicks
    cnTableBody.addEventListener('click', (e) => {
        if (e.target.closest('.download-cn-btn')) {
            const id = e.target.closest('.download-cn-btn').getAttribute('data-id');
            const note = allCreditNotes.find(n => n.id == id);
            if (note) {
                generateCreditNotePDF(note);
            }
        }
    });

    // 3. Handle Create Credit Note Form
    const createCnForm = document.getElementById('createCnForm');
    createCnForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const customer_id = document.getElementById('cnCustomer').value;
        const cn_number = document.getElementById('cnNumber').value;
        const amount = document.getElementById('cnAmount').value;
        const reason = document.getElementById('cnReason').value;
        const date = document.getElementById('cnDate').value;

        if(!customer_id) {
            alert("Please select a customer.");
            return;
        }

        try {
            await createCreditNote({ customer_id, cn_number, amount, reason, date });
            alert('Credit Note created successfully!');
            window.location.reload();
        } catch (error) {
            alert('Error creating credit note: ' + error.message);
        }
    });
});

// The Magic PDF Generator Function for Credit Notes
function generateCreditNotePDF(note) {
    const amount = Number(String(note.amount).replace(/,/g, '')) || 0;

    const element = document.createElement('div');
    element.style.width = '210mm';
    element.style.minHeight = '297mm';
    element.style.padding = '20mm';
    element.style.boxSizing = 'border-box';
    element.style.backgroundColor = '#ffffff';
    element.style.color = '#000000';
    element.style.fontFamily = 'Arial, sans-serif';
    
    element.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="vertical-align: top; width: 60%;">
                    <h1 style="color: #84cc16; margin: 0; font-size: 28px; letter-spacing: 1px;">ATAS PROSERVE LTD</h1>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #555; line-height: 1.5;">
                        Coast, Kenya<br>
                        atasproserve@gmail.com
                    </p>
                </td>
                <td style="vertical-align: top; width: 40%; text-align: right;">
                    <h1 style="margin: 0; font-size: 36px; color: #0d0d0d; text-transform: uppercase;">Credit Note</h1>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #555;">
                        <strong>#</strong> ${note.cn_number}<br>
                        <strong>Date:</strong> ${note.date ? new Date(note.date).toLocaleDateString() : new Date().toLocaleDateString()}
                    </p>
                </td>
            </tr>
        </table>
        
        <hr style="border: none; border-top: 2px solid #84cc16; margin: 20px 0;">
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr>
                <td style="vertical-align: top; width: 50%; font-size: 14px;">
                    <strong style="color: #888; font-size: 12px; text-transform: uppercase;">Credited To</strong><br>
                    <span style="font-size: 16px; font-weight: bold; color: #0d0d0d;">${note.customer_name}</span>
                </td>
                <td style="vertical-align: top; width: 50%; text-align: right;">
                    <div style="background-color: #f4f4f4; padding: 15px 20px; display: inline-block; border-radius: 4px; border: 1px solid #ddd;">
                        <span style="display: block; font-size: 12px; text-transform: uppercase; color: #555;">Credit Amount</span>
                        <span style="font-size: 24px; font-weight: bold; color: #84cc16;">KES ${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                </td>
            </tr>
        </table>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <thead>
                <tr style="background-color: #0d0d0d; color: #ffffff;">
                    <th style="text-align: left; padding: 12px;">Description / Reason</th>
                    <th style="text-align: right; padding: 12px;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 15px 12px; vertical-align: top;">${note.reason || 'Credit Issued'}</td>
                    <td style="padding: 15px 12px; text-align: right; color: #dc2626;">- KES ${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
            </tbody>
        </table>
        
        <div style="margin-top: 80px; border-top: 1px solid #eee; padding-top: 20px;">
            <strong style="font-size: 12px; color: #888; text-transform: uppercase;">Notes</strong>
            <p style="margin: 5px 0 0 0; color: #555; font-size: 13px;">This credit note cancels or adjusts the specified amount from your account balance.</p>
        </div>
    `;

    document.body.appendChild(element);

    const opt = {
        margin: 0,
        filename: `${note.cn_number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    setTimeout(() => {
        html2pdf().set(opt).from(element).save().then(() => {
            document.body.removeChild(element);
        });
    }, 500);
}