let selectedCustId = 0; // Tablodan seçilen müşterinin ID'sini tutar

// --- SAYFA YÜKLENDİĞİNDE ÇALIŞACAKLAR ---
document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();
});

// --- MÜŞTERİLERİ LİSTELE (GET) ---
async function loadCustomers() {
    try {
        const response = await fetch('http://localhost:3000/api/customers');
        const data = await response.json();
        
        const tbody = document.getElementById("customerList");
        tbody.innerHTML = ""; // Önce tabloyu temizle
        
        data.forEach(c => {
            // Tabloya satır ekle. Satıra tıklanınca inputları doldurur.
            const row = `<tr style="cursor: pointer;" onclick="selectCustomer(${c.id}, '${c.CustName}', '${c.CustPhone}', '${c.CustAdd}')">
                <td>${c.id}</td>
                <td>${c.CustName}</td>
                <td>${c.CustAdd}</td>
                <td>${c.CustPhone}</td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (err) {
        console.error("Müşteriler yüklenirken hata oluştu:", err);
    }
}

// --- YENİ MÜŞTERİ KAYDET (POST) ---
async function saveCustomer() {
    const name = document.getElementById("custName").value;
    const phone = document.getElementById("custPhone").value;
    const address = document.getElementById("custAdd").value;

    if (!name || !phone || !address) {
        showToast("Lütfen tüm alanları (Ad, Telefon, Adres) doldurun!", "warning");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                CustName: name, 
                CustPhone: phone, 
                CustAdd: address 
            })
        });

        if (response.ok) {
            showToast("Müşteri başarıyla kaydedildi!", "success");
            clearCustomerForm();
            loadCustomers(); // Tabloyu yenile
        }
    } catch (err) {
        showToast("Hata: " + err.message, "error");
    }
}

// --- MÜŞTERİ GÜNCELLE (PUT) ---
async function editCustomer() {
    if (selectedCustId === 0) {
        showToast("Lütfen düzenlemek istediğiniz müşteriyi tablodan seçin!", "warning");
        return;
    }

    const name = document.getElementById("custName").value;
    const phone = document.getElementById("custPhone").value;
    const address = document.getElementById("custAdd").value;

    try {
        const response = await fetch(`http://localhost:3000/api/customers/${selectedCustId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                CustName: name, 
                CustPhone: phone, 
                CustAdd: address 
            })
        });

        if (response.ok) {
            showToast("Müşteri bilgileri güncellendi!", "success");
            clearCustomerForm();
            loadCustomers();
        }
    } catch (err) {
        showToast("Güncelleme hatası: " + err.message, "error");
    }
}

// --- MÜŞTERİ SİL (DELETE) ---
async function deleteCustomer() {
    if (selectedCustId === 0) {
        showToast("Lütfen silmek istediğiniz müşteriyi tablodan seçin!", "warning");
        return;
    }

    if (!confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) return;

    try {
        const response = await fetch(`http://localhost:3000/api/customers/${selectedCustId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast("Müşteri başarıyla silindi!", "success");
            clearCustomerForm();
            loadCustomers();
        }
    } catch (err) {
        showToast("Silme hatası: " + err.message, "error");
    }
}

// --- TABLODAN SEÇİLENİ INPUTLARA DOLDUR ---
function selectCustomer(id, name, phone, address) {
    selectedCustId = id;
    document.getElementById("custName").value = name;
    document.getElementById("custPhone").value = phone;
    document.getElementById("custAdd").value = address;
    
    // Görsel geri bildirim (isteğe bağlı)
    console.log("Seçilen Müşteri ID:", id);
}

// --- FORMU TEMİZLE ---
function clearCustomerForm() {
    selectedCustId = 0;
    document.getElementById("custName").value = "";
    document.getElementById("custPhone").value = "";
    document.getElementById("custAdd").value = "";
}