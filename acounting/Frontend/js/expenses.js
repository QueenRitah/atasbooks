document.addEventListener('DOMContentLoaded', async () => {
    const expenseTableBody = document.getElementById('expenseTableBody');

    // Fetch and display expenses
    try {
        const expenses = await getExpenses();
        if (expenses.length === 0) {
            expenseTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No expenses found. Add your first one!</td></tr>';
        } else {
            expenseTableBody.innerHTML = expenses.map(exp => `
                <tr>
                    <td>${exp.category}</td>
                    <td>${exp.description || '-'}</td>
                    <td>KES ${Number(exp.amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>${exp.date ? new Date(exp.date).toLocaleDateString() : '-'}</td>
                    <td>
                        ${exp.receipt_image ? `<button class="btn btn-sm btn-outline-primary" onclick="viewReceipt('${exp.receipt_image}')"><i class="fas fa-eye"></i> View</button>` : '-'}
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        alert('Error loading expenses: ' + error.message);
    }

    // Handle Add Expense Form
    const addExpenseForm = document.getElementById('addExpenseForm');
    addExpenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const category = document.getElementById('expCategory').value;
        const description = document.getElementById('expDescription').value;
        const amount = document.getElementById('expAmount').value;
        const date = document.getElementById('expDate').value;
        const fileInput = document.getElementById('expReceipt');

        if(!category || !amount) {
            alert("Category and Amount are required.");
            return;
        }

        let receipt_image = null;

        // If a file was selected, convert it to Base64 text
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            receipt_image = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(fileInput.files[0]);
            });
        }

        try {
            await createExpense({ category, description, amount, date, receipt_image });
            alert('Expense recorded successfully!');
            window.location.reload();
        } catch (error) {
            alert('Error adding expense: ' + error.message);
        }
    });
});

// Function to open the receipt image in a new tab
function viewReceipt(imageData) {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Receipt</title></head><body style="margin:0; display:flex; align-items:center; justify-content:center; min-height:100vh; background:#172554;"><img src="${imageData}" style="max-width:100%; max-height:100vh;"></body></html>`);
    w.document.close();
}