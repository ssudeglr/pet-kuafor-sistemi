// --- ORTAK İŞLEMLER VE YETKİ KONTROLÜ ---
// Sayfa yüklendiğinde kullanıcı oturumunu ve yetkilerini kontrol eden ana olay dinleyici
document.addEventListener('DOMContentLoaded', () => {
    // Tarayıcı oturumundan giriş yapan personelin adını ve rolünü (Admin/Employee) alır
    const empName = sessionStorage.getItem("empName");
    const role = sessionStorage.getItem("role"); // Admin veya Employee

    // Kullanıcı adı varsa ve sayfada ismi gösterecek HTML elementi mevcutsa kontrolleri başlatır
    if (empName && document.getElementById("empNameDisplay")) {
        // Türkçe karakter ve büyük/küçük harf toleranslı Ahmet Yılmaz kontrolü
        // Kullanıcı adının başındaki/sonundaki boşlukları siler, küçük harfe çevirir ve hem "ı" hem "i" harfiyle yazımı denetler
        const isAhmet = empName && (empName.trim().toLowerCase() === "ahmet yilmaz" || empName.trim().toLowerCase() === "ahmet yılmaz");
        
        // Ahmet Yılmaz girerse veya rol Admin/admin ise Yönetici olarak göster
        // Kullanıcının yönetici paneline erişip erişemeyeceğini belirleyen mantıksal kontrol
        const isYonetici = role === "Admin" || role === "admin" || isAhmet;
        // HTML üzerindeki ilgili alana kullanıcının ünvanını ve adını yazdırır
        document.getElementById("empNameDisplay").innerText = (isYonetici ? "Yönetici: " : "Çalışan: ") + empName;
        
        // EĞER GİREN KİŞİ ÇALIŞAN İSE BAZI MENÜLERİ GİZLE (Ahmet Yılmaz hariç tutuluyor)
        // Giriş yapan kişi düz çalışan (Employee) ise ve ismi Ahmet Yılmaz değilse yetki kısıtlaması uygular
        if ((role === "Employee" || role === "employee") && !isAhmet) {
            // Sol menüdeki (sidebar) tüm liste elemanlarını seçer
            const menuItems = document.querySelectorAll('.sidebar ul li');
            menuItems.forEach(li => {
                // Menü metninde "Ana Sayfa" veya "Çalışanlar" geçiyorsa bu menüleri düz çalışandan gizler
                if (li.innerText.includes('Ana Sayfa') || li.innerText.includes('Çalışanlar')) {
                    li.style.display = 'none'; // Menüden kaldır
                }
            });

            // Eğer url çubuğundan zorla girmeye çalışırsa faturaya geri at
            // Yetkisiz çalışanın tarayıcı adres çubuğuna doğrudan link yazarak yönetici sayfalarına sızmasını engeller
            if (window.location.href.includes("dashboard.html") || window.location.href.includes("employees.html")) {
                window.location.href = "billing.html";
            }
        }

    // Eğer kullanıcı adı oturumda hiç yoksa ve kullanıcı zaten giriş sayfasında (index.html) değilse
    } else if (!empName && !window.location.href.includes("index.html")) {
        // Giriş yapmamış kullanıcıyı korumalı sayfalardan giriş ekranına (oturum açmaya) zorla yönlendirir
        window.location.href = "index.html";
    }
});

// Oturumu güvenli bir şekilde kapatmayı sağlayan fonksiyon
function logout() {
    sessionStorage.clear(); // Tarayıcı hafızasındaki tüm kullanıcı verilerini siler
    window.location.href = "index.html"; // Kullanıcıyı giriş ekranına geri yönlendirir
}

// --- MODERN TOAST NOTIFICATION ---
// Ekranın sağ/sol köşesinde dinamik ve modern uyarı kutuları (bildirimler) göstermeyi sağlayan fonksiyon
function showToast(message, type = 'info') {
    // Bildirimlerin üst üste birikeceği ana kapsayıcı elementi (container) arar
    let container = document.getElementById('toast-container');
    // Eğer sayfada henüz bu kapsayıcı yoksa ilk defa oluşturup body'e ekler
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Yeni bir bildirim kutusu elementi oluşturur
    const toast = document.createElement('div');
    toast.className = `toast ${type}`; // Bildirim tipine göre (success, error, warning) CSS sınıfı atar

    // Bildirim tipine göre kutunun içinde gösterilecek FontAwesome ikonunu belirler
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    else if (type === 'error') iconClass = 'fa-exclamation-circle';
    else if (type === 'warning') iconClass = 'fa-exclamation-triangle';

    // İkonu ve gelen mesajı bildirim kutusunun içerisine HTML olarak enjekte eder
    toast.innerHTML = `
        <div class="toast-icon"><i class="fa ${iconClass}"></i></div>
        <div class="toast-message">${message}</div>
    `;

    // Oluşturulan bildirimi ana kapsayıcının içine ekler (ekranda gösterir)
    container.appendChild(toast);

    // Trigger reflow to enable transition
    // Tarayıcının CSS animasyonunu (giriş efektini) tetiklemesi için elementin yüksekliğini zorla okur
    toast.offsetHeight;

    // Sınıfı ekleyerek bildirimin görünürlük (CSS opacity/transform) animasyonunu başlatır
    toast.classList.add('show');

    // Auto-remove toast
    // Bildirimi ekranda 3.5 saniye tuttuktan sonra otomatik olarak kaldırma sürecini başlatır
    setTimeout(() => {
        toast.classList.remove('show'); // Görünürlük sınıfını kaldırarak kaybolma animasyonunu tetikler
        // CSS animasyonu tamamen bittiğinde elementi HTML yapısından (DOM) temizler
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, 3500);
}

// --- GİRİŞ EKRANI ---
// Kullanıcı adı ve şifre ile sisteme giriş yapmayı sağlayan asenkron fonksiyon
async function login() {
    // Input alanlarındaki kullanıcı adı ve şifre değerlerini okur (kullanıcı adındaki gereksiz boşlukları temizler)
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;

    // Alanlardan biri bile boş bırakılmışsa kullanıcıyı uyarır ve işlemi durdurur
    if (!user || !pass) {
        showToast("Lütfen kullanıcı adı ve şifre girin!", "warning");
        return;
    }

    try {
        // Backend API'sine (Node.js sunucusuna) POST isteği göndererek bilgileri doğrular
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        // Sunucudan dönen JSON yanıtını nesneye dönüştürür
        const data = await response.json();
        
        // Giriş bilgileri sunucu tarafında doğru kabul edildiyse
        if (data.success) {
            // Kullanıcının ismini ve yetki rolünü tarayıcı oturum hafızasına kaydeder
            sessionStorage.setItem("empName", data.user); 
            sessionStorage.setItem("role", data.role); // Yetkiyi kaydet
            
            showToast("Giriş Başarılı! Yönlendiriliyorsunuz...", "success");
            
            // 1.2 saniye gecikme ile yönlendir (animasyonun görünmesi için)
            // Başarılı toast bildiriminin ekranda okunabilmesi için yönlendirmeyi kısa bir süre erteler
            setTimeout(() => {
                // Kullanıcı Admin ise yönetim paneline (dashboard), düz çalışansa faturalandırma (billing) sayfasına gider
                window.location.href = data.role === "Admin" ? "dashboard.html" : "billing.html"; 
            }, 1200);
        } else {
            // Sunucudan başarısız yanıt geldiyse hata mesajı gösterir
            showToast("Geçersiz kullanıcı adı veya şifre!", "error"); 
        }
    } catch(err) {
        // Sunucu kapalıysa veya ağ hatası oluştuysa yakalayıp kullanıcıyı bilgilendirir
        showToast("Sunucuya bağlanılamadı. Node.js çalışıyor mu?", "error");
    }
}

// --- ŞİFREMİ UNUTTUM İŞLEMLERİ ---
// Giriş formu ile Şifre Sıfırlama formu arasında geçiş yapmayı sağlayan arayüz fonksiyonu
function toggleForgotPasswordForm(show) {
    const loginForm = document.getElementById('loginForm');
    const forgotForm = document.getElementById('forgotForm');
    // Eğer show parametresi true ise giriş formunu gizler, şifre sıfırlama formunu dikey esnek (flex) modda açar
    if (show) {
        loginForm.style.display = 'none';
        forgotForm.style.display = 'flex';
    // Eğer false ise şifre sıfırlama formunu gizleyip normal giriş formunu geri getirir
    } else {
        loginForm.style.display = 'flex';
        forgotForm.style.display = 'none';
    }
}

// Kullanıcının unuttuğu şifreyi doğrulamalarla birlikte yenilemesini sağlayan asenkron fonksiyon
async function resetPassword() {
    // Formdaki kullanıcı adı, telefon numarası ve yeni şifre alanlarını okur
    const username = document.getElementById('forgot-username').value.trim();
    const phone = document.getElementById('forgot-phone').value.trim();
    const newPassword = document.getElementById('forgot-new-password').value;

    // Herhangi bir alan boş bırakılmışsa uyarı verir ve işlemi keser
    if (!username || !phone || !newPassword) {
        showToast("Lütfen tüm alanları doldurun!", "warning");
        return;
    }

    // Şifre Güvenlik Doğrulamaları
    // Şifrenin güvenli olması için gereken asgari kriter tanımlamaları (regex / düzenli ifadeler ile)
    const minLength = 6;
    const hasUppercase = /[A-Z]/.test(newPassword); // En az bir büyük harf kontrolü
    const hasLowercase = /[a-z]/.test(newPassword); // En az bir küçük harf kontrolü

    // Şifre uzunluğu 6 karakterden azsa işlemi durdurur
    if (newPassword.length < minLength) {
        showToast("Yeni şifre en az " + minLength + " karakter olmalıdır!", "warning");
        return;
    }
    // Şifrede büyük harf yoksa işlemi durdurur
    if (!hasUppercase) {
        showToast("Yeni şifre en az bir büyük harf içermelidir!", "warning");
        return;
    }
    // Şifrede küçük harf yoksa işlemi durdurur
    if (!hasLowercase) {
        showToast("Yeni şifre en az bir küçük harf içermelidir!", "warning");
        return;
    }

    try {
        // Backend API'sine şifre sıfırlama istek verilerini POST eder
        const response = await fetch('http://localhost:3000/api/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, phone, newPassword })
        });
        const data = await response.json();
        
        // Sunucu bilgileri (kullanıcı adı ve telefon eşleşmesini) doğru bulup şifreyi güncellediyse
        if (data.success) {
            showToast("Şifreniz başarıyla güncellendi!", "success");
            
            // 1.5 saniye sonra şifre sıfırlama ekranını kapatıp giriş formunu açar ve inputları temizler
            setTimeout(() => {
                toggleForgotPasswordForm(false);
                // Formu temizle
                document.getElementById('forgot-username').value = '';
                document.getElementById('forgot-phone').value = '';
                document.getElementById('forgot-new-password').value = '';
            }, 1500);
        } else {
            // Sunucudan gelen özel bir hata mesajı varsa onu, yoksa genel başarısızlık metnini basar
            showToast(data.error || "Şifre sıfırlama işlemi başarısız!", "error");
        }
    } catch(err) {
        showToast("Sunucuya bağlanılamadı. Node.js çalışıyor mu?", "error");
    }
}

// --- FATURALANDIRMA (BILLING) MANTIĞI ---
let billItems = []; // Sepetteki (faturadaki) ürünleri nesne dizisi olarak tutan dinamik liste
let grandTotal = 0; // Faturanın toplam parasal tutarını kuruşsuz/tamsayı olarak tutan değişken
let n = 1; // Faturaya eklenen her satır ürün için benzersiz (id) sıra numarası
let selectedProductStock = 0; // O an listeden seçilmiş olan ürünün güncel stok limit değeri

// Ürün listesinden bir ürüne tıklandığında fatura form alanlarını otomatik dolduran fonksiyon
function selectProductForBill(name, price, stock) {
    document.getElementById("billPrName").value = name; // Seçilen ürün adını inputa yazar
    document.getElementById("billPrPrice").value = price; // Seçilen ürün fiyatını inputa yazar
    selectedProductStock = stock; // Stok değerini kontrol mekanizması için hafızaya alır
}

// Orijinal Sepete Ekleme (AddBtn_Click)
// Form alanlarındaki seçili ürünü ve girilen miktarı doğrulayarak sepete/faturaya ekleyen fonksiyon
function addToBill() {
    const prName = document.getElementById("billPrName").value;
    const prQty = parseInt(document.getElementById("billPrQty").value);
    const prPrice = parseInt(document.getElementById("billPrPrice").value);

    // Ürün adı seçilmemişse, miktar sayı değilse veya fiyat yoksa ekleme işlemini iptal eder
    if (!prName || isNaN(prQty) || !prPrice) {
        showToast("Lütfen bir ürün seçin ve miktar girin!", "warning");
        return;
    }

    // Talep edilen miktar, ürünün mevcut stok miktarından büyükse işleme izin vermez
    if (prQty > selectedProductStock) {
        showToast("Stok yetersiz! Mevcut stok: " + selectedProductStock, "error");
        return;
    }

    // Eklenen ürünün ara toplam tutarını hesaplar (Miktar x Birim Fiyat)
    const total = prQty * prPrice;
    grandTotal += total; // Genel toplam tutara bu ara toplamı ilave eder

    // Ürünü fatura kalemleri dizisine nesne olarak ekler
    billItems.push({ id: n, name: prName, qty: prQty, price: prPrice, total: total });
    renderBillTable(); // HTML tablosunu yeni veriye göre günceller

    // Arayüzdeki genel toplam metnini günceller
    document.getElementById("grandTotalText").innerText = "Genel Toplam: " + grandTotal + " TL";
    selectedProductStock -= prQty; // Eklenen miktar kadar lokal stok limitini düşürür
    n++; // Bir sonraki eklenecek ürün için sıra numarasını 1 artırır
    
    // Yeni ürün eklenebilmesi için input form alanlarını temizler
    document.getElementById("billPrName").value = "";
    document.getElementById("billPrQty").value = "";
    document.getElementById("billPrPrice").value = "";
}

// Sepetteki güncel ürünleri HTML tablosunda (tbody içinde) dinamik olarak listeleyen fonksiyon
function renderBillTable() {
    const tbody = document.getElementById("billItemsList");
    tbody.innerHTML = ""; // Tablonun içini tamamen boşaltır (mükerrer kayıt oluşmaması için)
    // billItems dizisindeki her bir ürünü döngüyle tablo satırı (tr/td) formatında HTML'e ekler
    billItems.forEach(item => {
        tbody.innerHTML += `<tr><td>${item.id}</td><td>${item.name}</td><td>${item.qty}</td><td>${item.price}</td><td>${item.total}</td></tr>`;
    });
}

// Orijinal Yazdır ve Kaydet (PrintDocument & InsertBill)
// Tamamlanan faturayı veritabanına kaydeden ve tarayıcının yazdırma penceresini açan asenkron fonksiyon
async function printAndSaveBill() {
    // Sepette hiç ürün yoksa boş faturanın kaydedilmesini engeller
    if (billItems.length === 0) {
        showToast("Sepet boş, fatura kesilemez!", "warning");
        return;
    }

    // Müşteri adı alanları varsa değerini alır, yoksa varsayılan değerleri atar
    const custName = document.getElementById("custName") ? document.getElementById("custName").value : "Bilinmiyor";
    const custId = document.getElementById("custIdCB") ? document.getElementById("custIdCB").value : 1; 
    const empName = sessionStorage.getItem("empName"); // Faturayı kesen personelin adını oturumdan alır

    try {
        // Backend API'sine fatura üst başlık bilgilerini ve sepetteki tüm alt kalemleri (items) JSON olarak gönderir
        const response = await fetch('http://localhost:3000/api/bills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ custID: custId, custName: custName, empName: empName, totalAmount: grandTotal, items: billItems })
        });

        // Veritabanı kaydı başarıyla tamamlandıysa (HTTP 200-299 arası dönüş aldıysa)
        if (response.ok) {
            // YAZDIRMA İŞLEMİ (Tarayıcının yazdırma ekranını açar)
            // Sayfanın o anki CSS yapısına göre çıktı alınmasını tetikler
            window.print();
            
            showToast("Fatura kaydedildi ve yazdırıldı! Toplam: " + grandTotal + " TL", "success");
            
            // Faturayı sıfırla
            // Yeni fatura kesilebilmesi için sepeti, genel toplamı ve satır sayacını başlangıç durumuna getirir
            billItems = [];
            grandTotal = 0;
            n = 1;
            renderBillTable(); // Boş sepeti ekrana yansıtır
            document.getElementById("grandTotalText").innerText = "Genel Toplam: 0 TL";
            
            // Ürünlerin stok durumları veritabanında değiştiği için fatura sayfasındaki ürün listesini yeniler
            if(typeof loadProductsForBilling === "function") loadProductsForBilling();
        }
    } catch (error) {
        showToast("Hata oluştu: " + error.message, "error");
    }
}

// Fatura sayfasındaki Müşterileri Dropdown'a çekme
// Kayıtlı müşterileri API'den çekerek fatura ekranındaki açılır menüye (select) dolduran asenkron fonksiyon
async function loadCustomersForBilling() {
    const select = document.getElementById("custIdCB");
    if (!select) return; // Sayfada bu select elementi yoksa fonksiyonu çalıştırmaz ve çıkar
    try {
        const res = await fetch('http://localhost:3000/api/customers');
        const customers = await res.json();
        select.innerHTML = '<option value="">Müşteri Seçin...</option>'; // İlk seçeneği sıfırlar
        // Gelen müşteri dizisini döngüye alarak select içerisine option elementleri ekler
        customers.forEach(c => select.innerHTML += `<option value="${c.id}">${c.id} - ${c.CustName}</option>`);
    } catch (err) {}
}

// Müşteri ID'si seçildiğinde seçilen text içerisinden müşteri adını ayıklayıp input alanına yazan fonksiyon
function fetchCustName() {
    const select = document.getElementById("custIdCB");
    const nameInput = document.getElementById("custName");
    // Eğer boş/seçiniz seçeneği işaretlendiyse müşteri adı inputunu da temizler
    if (select.value === "") { nameInput.value = ""; return; }
    // "1 - Ahmet Taş" gibi olan metni ' - ' işaretine göre böler ve sağdaki ismi alıp inputa yazar
    nameInput.value = select.options[select.selectedIndex].text.split(' - ')[1]; 
}

// Eğer şu an fatura sayfasındaysak (billing.html URL içinde geçiyorsa)
if (window.location.href.includes("billing.html")) {
    // Sayfa DOM ağacı hazır olduğunda müşteri listesini dropdown'a yüklemesi için olay dinleyici ekler
    document.addEventListener('DOMContentLoaded', loadCustomersForBilling);
}