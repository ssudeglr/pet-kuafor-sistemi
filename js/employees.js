// public/js/employees.js

let selectedEmpId = 0; // Tablodan seçilen çalışanın ID'sini tutar

// Sayfa yüklendiğinde çalışanları listele
document.addEventListener('DOMContentLoaded', () => {
    loadEmployees();
});

// --- ÇALIŞANLARI LİSTELE ---
async function loadEmployees() {
    try {
        const response = await fetch('http://localhost:3000/api/employees');
        const data = await response.json();
        
        const tbody = document.getElementById("employeeList");
        tbody.innerHTML = ""; // Tabloyu temizle
        
        data.forEach(emp => {
            // Tabloya satır ekle. Tıklandığında bilgileri yukarı doldurur.
            const row = `<tr style="cursor: pointer;" onclick="selectEmployee(${emp.id}, '${emp.EmpName}', '${emp.EmpDOB}', '${emp.EmpPhone}', '${emp.EmpPass}', '${emp.EmpAdd}')">
                <td>${emp.id}</td>
                <td>${emp.EmpName}</td>
                <td>${emp.EmpAdd}</td>
                <td>${emp.EmpDOB}</td>
                <td>${emp.EmpPhone}</td>
                <td>${emp.EmpPass}</td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (err) {
        console.error("Çalışanlar yüklenirken hata:", err);
    }
}

// --- YENİ ÇALIŞAN KAYDET (Save) ---
async function saveEmployee() {
    const name = document.getElementById("empName").value;
    const dob = document.getElementById("empDOB").value;
    const phone = document.getElementById("empPhone").value;
    const pass = document.getElementById("empPass").value;
    const address = document.getElementById("empAdd").value;

    if (!name || !phone || !pass || !address) {
        showToast("Lütfen gerekli tüm alanları doldurun!", "warning");
        return;
    }

    try {
        await fetch('http://localhost:3000/api/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                EmpName: name, 
                EmpDOB: dob, 
                EmpPhone: phone, 
                EmpPass: pass, 
                EmpAdd: address 
            })
        });

        showToast("Çalışan başarıyla eklendi!", "success");
        clearEmployeeForm();
        loadEmployees(); // Tabloyu yenile
    } catch (err) {
        showToast("Hata: " + err.message, "error");
    }
}

// --- ÇALIŞAN GÜNCELLE (Edit) ---
async function editEmployee() {
    if (selectedEmpId === 0) {
        showToast("Lütfen düzenlemek için tablodan bir çalışan seçin!", "warning");
        return;
    }

    const name = document.getElementById("empName").value;
    const dob = document.getElementById("empDOB").value;
    const phone = document.getElementById("empPhone").value;
    const pass = document.getElementById("empPass").value;
    const address = document.getElementById("empAdd").value;

    try {
        await fetch(`http://localhost:3000/api/employees/${selectedEmpId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                EmpName: name, 
                EmpDOB: dob, 
                EmpPhone: phone, 
                EmpPass: pass, 
                EmpAdd: address 
            })
        });

        showToast("Çalışan bilgileri güncellendi!", "success");
        clearEmployeeForm();
        loadEmployees();
    } catch (err) {
        showToast("Güncelleme hatası: " + err.message, "error");
    }
}

// --- ÇALIŞAN SİL (Delete) ---
async function deleteEmployee() {
    if (selectedEmpId === 0) {
        showToast("Lütfen silmek için tablodan bir çalışan seçin!", "warning");
        return;
    }

    if (!confirm("Bu çalışanı silmek istediğinize emin misiniz?")) return;

    try {
        await fetch(`http://localhost:3000/api/employees/${selectedEmpId}`, {
            method: 'DELETE'
        });

        showToast("Çalışan silindi!", "success");
        clearEmployeeForm();
        loadEmployees();
    } catch (err) {
        showToast("Silme hatası: " + err.message, "error");
    }
}

// --- TABLODAN SEÇİLENİ DOLDUR ---
function selectEmployee(id, name, dob, phone, pass, address) {
    selectedEmpId = id;
    document.getElementById("empName").value = name;
    document.getElementById("empDOB").value = dob;
    document.getElementById("empPhone").value = phone;
    document.getElementById("empPass").value = pass;
    document.getElementById("empAdd").value = address;
}

// --- FORMU TEMİZLE ---
function clearEmployeeForm() {
    selectedEmpId = 0;
    document.getElementById("empName").value = "";
    document.getElementById("empDOB").value = "";
    document.getElementById("empPhone").value = "";
    document.getElementById("empPass").value = "";
    document.getElementById("empAdd").value = "";
}