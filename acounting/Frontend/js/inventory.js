document.addEventListener('DOMContentLoaded', async () => {
    const inventoryTableBody = document.getElementById('inventoryTableBody');

    // Fetch and display inventory
    try {
        const items = await getInventory();
        if (items.length === 0) {
            inventoryTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No items in inventory. Add your first one!</td></tr>';
        } else {
            inventoryTableBody.innerHTML = items.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.description || '-'}</td>
                    <td>KES ${Number(item.price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>${item.stock}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        alert('Error loading inventory: ' + error.message);
    }

    // Handle Add Item Form
    const addItemForm = document.getElementById('addItemForm');
    addItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('itemName').value;
        const description = document.getElementById('itemDescription').value;
        const price = document.getElementById('itemPrice').value;
        const stock = document.getElementById('itemStock').value;

        if(!name || !price) {
            alert("Item Name and Price are required.");
            return;
        }

        try {
            await createInventory({ name, description, price, stock });
            alert('Inventory item added successfully!');
            window.location.reload();
        } catch (error) {
            alert('Error adding item: ' + error.message);
        }
    });
});