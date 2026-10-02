const API_URL = 'http://localhost:5000/api/auth';
const API_CUSTOMER_URL = 'http://localhost:5000/api/customers';
const API_INVOICE_URL = 'http://localhost:5000/api/invoices';
const API_EXPENSE_URL = 'http://localhost:5000/api/expenses';
const API_INVENTORY_URL = 'http://localhost:5000/api/inventory';
const API_VENDOR_URL = 'http://localhost:5000/api/vendors';
const API_CREDIT_NOTE_URL = 'http://localhost:5000/api/credit-notes';

// --- Auth Functions ---
async function registerUser(name, email, password, accessCode) {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, accessCode }) // Send access code too!
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Something went wrong');
    return data;
}

async function loginUser(email, password) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Something went wrong');
    if (data.token) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
    }
    return data;
}

async function updateProfile(name, email, companyName, companyAddress, companyEmail, companyLogo, country, vatRate) {
    const token = localStorage.getItem('userToken');
    const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
            name, 
            email, 
            company_name: companyName, 
            company_address: companyAddress, 
            company_email: companyEmail, 
            company_logo: companyLogo,
            country: country,
            vat_rate: vatRate
        })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
}

// --- Customer Functions ---
async function getCustomers() {
    const token = localStorage.getItem('userToken');
    const response = await fetch(API_CUSTOMER_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
}

async function createCustomer(customerData) {
    const token = localStorage.getItem('userToken');
    const response = await fetch(API_CUSTOMER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(customerData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
}

async function deleteCustomer(id) {
    const token = localStorage.getItem('userToken');
    const response = await fetch(`${API_CUSTOMER_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
}

// --- Invoice Functions ---
async function getInvoices() {
    const token = localStorage.getItem('userToken');
    const response = await fetch(API_INVOICE_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
}

async function createInvoice(invoiceData) {
    const token = localStorage.getItem('userToken');
    const response = await fetch(API_INVOICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(invoiceData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
}

async function updateInvoiceStatus(id, status) {
    const token = localStorage.getItem('userToken');
    const response = await fetch(`${API_INVOICE_URL}/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
}

// --- Expense Functions ---
async function getExpenses() {
    const token = localStorage.getItem('userToken');
    const response = await fetch(API_EXPENSE_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
}

async function createExpense(expenseData) {
    const token = localStorage.getItem('userToken');
    const response = await fetch(API_EXPENSE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(expenseData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
}

// --- Inventory Functions ---
async function getInventory() {
    const token = localStorage.getItem('userToken');
    const response = await fetch(API_INVENTORY_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
}

async function createInventory(itemData) {
    const token = localStorage.getItem('userToken');
    const response = await fetch(API_INVENTORY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(itemData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
}

// --- Vendor Functions ---
async function getVendors() {
    const token = localStorage.getItem('userToken');
    const response = await fetch(API_VENDOR_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
}

async function createVendor(vendorData) {
    const token = localStorage.getItem('userToken');
    const response = await fetch(API_VENDOR_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(vendorData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
}

// --- Credit Note Functions ---
async function getCreditNotes() {
    const token = localStorage.getItem('userToken');
    const response = await fetch(API_CREDIT_NOTE_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
}

async function createCreditNote(noteData) {
    const token = localStorage.getItem('userToken');
    const response = await fetch(API_CREDIT_NOTE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(noteData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
}