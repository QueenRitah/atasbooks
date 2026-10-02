document.addEventListener('DOMContentLoaded', async () => {
    const vendorTableBody = document.getElementById('vendorTableBody');

    // Fetch and display vendors
    try {
        const vendors = await getVendors();
        if (vendors.length === 0) {
            vendorTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No vendors found. Add your first one!</td></tr>';
        } else {
            vendorTableBody.innerHTML = vendors.map(v => `
                <tr>
                    <td>${v.name}</td>
                    <td>${v.company || '-'}</td>
                    <td>${v.email || '-'}</td>
                    <td>${v.phone || '-'}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        alert('Error loading vendors: ' + error.message);
    }

    // Handle Add Vendor Form
    const addVendorForm = document.getElementById('addVendorForm');
    addVendorForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('venName').value;
        const company = document.getElementById('venCompany').value;
        const email = document.getElementById('venEmail').value;
        const phone = document.getElementById('venPhone').value;

        if(!name) {
            alert("Vendor Name is required.");
            return;
        }

        try {
            await createVendor({ name, company, email, phone });
            alert('Vendor added successfully!');
            window.location.reload();
        } catch (error) {
            alert('Error adding vendor: ' + error.message);
        }
    });
});