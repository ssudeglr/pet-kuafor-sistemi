let selectedProductId = 0;

// --- SAYFA AÇILDIĞINDA ÜRÜNLERİ TABLOYA YÜKLE ---
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

// Veritabanından (Server'dan) ürünleri getiren fonksiyon
async function loadProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        const data = await response.json();
        
        const tbody = document.getElementById("productList");
        tbody.innerHTML = ""; // Önce tabloyu temizle
        
        data.forEach(pr => {
            // Tabloya satır ekle. Satıra tıklanınca inputları doldursun (C#'taki CellContentClick).
            const row = `<tr style="cursor: pointer;" onclick="selectProduct(${pr.id}, '${pr.PrName}', '${pr.PrCat}', ${pr.PrQty}, ${pr.PrPrice})">
                <td>${pr.id}</td>
                <td>${pr.PrName}</td>
                <td>${pr.PrCat}</td>
                <td>${pr.PrQty}</td>
                <td>${pr.PrPrice}</td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (err) {
        console.error("Ürünler yüklenirken hata:", err);
    }
}

// --- ÜRÜN EKLEME (SaveBtn_Click) ---
async function saveProduct() {
    const name = document.getElementById("prName").value;
    const category = document.getElementById("prCat").value;
    const qty = document.getElementById("prQty").value;
    const price = document.getElementById("prPrice").value;

    if (!name || !category || !qty || !price) {
        showToast("Eksik Bilgi!", "warning");
        return;
    }

    try {
        await fetch('http://localhost:3000/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ PrName: name, PrCat: category, PrQty: qty, PrPrice: price })
        });

        showToast("Ürün Eklendi!", "success");
        clearProductForm();
        loadProducts(); // Tabloyu yenile
    } catch (err) {
        showToast("Ürün eklenemedi: " + err.message, "error");
    }
}

// --- TABLODAN ÜRÜN SEÇME ---
function selectProduct(id, name, cat, qty, price) {
    selectedProductId = id;
    document.getElementById("prName").value = name;
    document.getElementById("prCat").value = cat;
    document.getElementById("prQty").value = qty;
    document.getElementById("prPrice").value = price;
}

// --- FORMU TEMİZLEME (Clear) ---
function clearProductForm() {
    selectedProductId = 0;
    document.getElementById("prName").value = "";
    document.getElementById("prCat").selectedIndex = 0;
    document.getElementById("prQty").value = "";
    document.getElementById("prPrice").value = "";
}

// --- ÜRÜN DÜZENLEME (EditBtn_Click) ---
async function updateProduct() {
    if (selectedProductId === 0) {
        showToast("Lütfen düzenlemek için tablodan bir ürün seçin!", "warning");
        return;
    }
    
    const name = document.getElementById("prName").value;
    const category = document.getElementById("prCat").value;
    const qty = document.getElementById("prQty").value;
    const price = document.getElementById("prPrice").value;

    try {
        await fetch(`http://localhost:3000/api/products/${selectedProductId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ PrName: name, PrCat: category, PrQty: qty, PrPrice: price })
        });
        
        showToast("Ürün başarıyla güncellendi!", "success");
        clearProductForm();
        loadProducts(); // Tabloyu yenile
    } catch (err) {
        showToast("Hata: " + err.message, "error");
    }
}

// --- ÜRÜN SİLME (DeleteBtn_Click) ---
async function deleteProduct() {
    if (selectedProductId === 0) {
        showToast("Lütfen silmek için tablodan bir ürün seçin!", "warning");
        return;
    }
    
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

    try {
        await fetch(`http://localhost:3000/api/products/${selectedProductId}`, {
            method: 'DELETE'
        });
        
        showToast("Ürün başarıyla silindi!", "success");
        clearProductForm();
        loadProducts(); // Tabloyu yenile
    } catch (err) {
        showToast("Hata: " + err.message, "error");
    }
}