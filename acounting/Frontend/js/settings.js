document.addEventListener('DOMContentLoaded', () => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(userInfo);
    
    // 1. Populate User Profile
    document.getElementById('userName').innerText = `Welcome, ${user.name}`;
    document.getElementById('setName').value = user.name;
    document.getElementById('setEmail').value = user.email;

    // 2. Populate Company Profile
    document.getElementById('companyName').value = user.company_name || '';
    document.getElementById('companyAddress').value = user.company_address || '';
    document.getElementById('companyEmail').value = user.company_email || '';
    
    // NEW: Populate Country and VAT
    if (user.country) document.getElementById('userCountry').value = user.country;
    if (user.vat_rate) document.getElementById('userVatRate').value = user.vat_rate;

    if (user.company_logo) {
        document.getElementById('companyLogoPreview').src = user.company_logo;
    }

    // 3. Handle User Profile Update
    const settingsForm = document.getElementById('settingsForm');
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = document.getElementById('setName').value;
        const newEmail = document.getElementById('setEmail').value;

        try {
            await updateProfile(newName, newEmail, user.company_name, user.company_address, user.company_email, user.company_logo, user.country, user.vat_rate);
            user.name = newName;
            user.email = newEmail;
            localStorage.setItem('userInfo', JSON.stringify(user));
            alert('User profile updated successfully!');
            window.location.reload();
        } catch (error) {
            alert('Error updating profile: ' + error.message);
        }
    });

    // 4. Handle Company Logo Upload
    let newLogoBase64 = null;
    document.getElementById('companyLogoInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('companyLogoPreview').src = event.target.result;
                newLogoBase64 = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // 5. Handle Company Profile Update
    const companyForm = document.getElementById('companyForm');
    companyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const cName = document.getElementById('companyName').value;
        const cAddress = document.getElementById('companyAddress').value;
        const cEmail = document.getElementById('companyEmail').value;
        const cLogo = newLogoBase64 || user.company_logo;
        
        // NEW: Get Country and VAT Rate
        const cCountry = document.getElementById('userCountry').value;
        const cVatRate = document.getElementById('userVatRate').value;

        try {
            await updateProfile(user.name, user.email, cName, cAddress, cEmail, cLogo, cCountry, cVatRate);
            
            user.company_name = cName;
            user.company_address = cAddress;
            user.company_email = cEmail;
            user.country = cCountry;
            user.vat_rate = cVatRate;
            if (newLogoBase64) user.company_logo = newLogoBase64;
            localStorage.setItem('userInfo', JSON.stringify(user));
            
            alert('Company profile updated! New invoices will use this VAT rate.');
            window.location.reload();
        } catch (error) {
            alert('Error updating company: ' + error.message);
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        window.location.href = 'login.html';
    });
});