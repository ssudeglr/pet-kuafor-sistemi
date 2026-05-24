const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();

app.use(express.json());
app.use(cors());

// --- KLASÖR YAPISI AYARLARI ---
app.use(express.static(path.join(__dirname, 'html')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// =========================================================
// 1. GİRİŞ İŞLEMİ
// =========================================================
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    db.get(
        `SELECT 
            EmpNum AS id,
            EmpName,
            EmpPass,
            EmpRole
         FROM EmployeeTbl
         WHERE EmpName = ? AND EmpPass = ?`,
        [username, password],
        (err, user) => {
            if (err) {
                console.error("Login hatası:", err.message);
                return res.status(500).json({ success: false, error: err.message });
            }

            if (user) {
                res.json({
                    success: true,
                    user: user.EmpName,
                    role: user.EmpRole
                });
            } else {
                res.json({ success: false });
            }
        }
    );
});

// =========================================================
// 1.1 ŞİFRE SIFIRLAMA İŞLEMİ (Şifremi Unuttum)
// =========================================================
app.post('/api/forgot-password', (req, res) => {
    const { username, phone, newPassword } = req.body;

    db.get(
        `SELECT EmpNum FROM EmployeeTbl WHERE EmpName = ? AND EmpPhone = ?`,
        [username, phone],
        (err, user) => {
            if (err) {
                console.error("Şifre sıfırlama hatası (Select):", err.message);
                return res.status(500).json({ success: false, error: err.message });
            }

            if (!user) {
                return res.json({ success: false, error: "Kullanıcı adı veya telefon numarası hatalı!" });
            }

            db.run(
                `UPDATE EmployeeTbl SET EmpPass = ? WHERE EmpNum = ?`,
                [newPassword, user.EmpNum],
                function (updateErr) {
                    if (updateErr) {
                        console.error("Şifre sıfırlama hatası (Update):", updateErr.message);
                        return res.status(500).json({ success: false, error: updateErr.message });
                    }

                    res.json({ success: true, message: "Şifreniz başarıyla güncellendi!" });
                }
            );
        }
    );
});

// =========================================================
// 2. DASHBOARD İSTATİSTİKLERİ
// =========================================================
app.get('/api/dashboard/counts', (req, res) => {
    db.all(
        `SELECT PrCat, COUNT(*) AS count 
         FROM ProductTbl 
         GROUP BY PrCat`,
        [],
        (err, rows) => {
            if (err) {
                console.error("Dashboard hatası:", err.message);
                return res.status(500).json({ error: err.message });
            }

            let cats = 0;
            let dogs = 0;
            let birds = 0;

            rows.forEach(row => {
                if (row.PrCat === 'Cats' || row.PrCat === 'Kedi') cats = row.count;
                if (row.PrCat === 'Dogs' || row.PrCat === 'Köpek') dogs = row.count;
                if (row.PrCat === 'Birds' || row.PrCat === 'Kuş') birds = row.count;
            });

            res.json({ cats, dogs, birds });
        }
    );
});

// =========================================================
// 3. ÜRÜNLER API
// =========================================================

// Ürünleri listele
app.get('/api/products', (req, res) => {
    db.all(
        `SELECT 
            ProID AS id,
            PrName,
            PrCat,
            PrQty,
            PrPrice
         FROM ProductTbl
         ORDER BY ProID DESC`,
        [],
        (err, rows) => {
            if (err) {
                console.error("Ürün listeleme hatası:", err.message);
                return res.status(500).json({ error: err.message });
            }

            res.json(rows);
        }
    );
});

// Ürün ekle
app.post('/api/products', (req, res) => {
    const { PrName, PrCat, PrQty, PrPrice } = req.body;

    db.run(
        `INSERT INTO ProductTbl (PrName, PrCat, PrQty, PrPrice)
         VALUES (?, ?, ?, ?)`,
        [PrName, PrCat, parseInt(PrQty), parseFloat(PrPrice)],
        function (err) {
            if (err) {
                console.error("Ürün ekleme hatası:", err.message);
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({
                message: "Ürün başarıyla eklendi.",
                id: this.lastID
            });
        }
    );
});

// Ürün güncelle
app.put('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { PrName, PrCat, PrQty, PrPrice } = req.body;

    db.run(
        `UPDATE ProductTbl
         SET PrName = ?, PrCat = ?, PrQty = ?, PrPrice = ?
         WHERE ProID = ?`,
        [PrName, PrCat, parseInt(PrQty), parseFloat(PrPrice), id],
        function (err) {
            if (err) {
                console.error("Ürün güncelleme hatası:", err.message);
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.sendStatus(404);
            }

            res.sendStatus(200);
        }
    );
});

// Ürün sil
app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);

    db.run(
        `DELETE FROM ProductTbl WHERE ProID = ?`,
        [id],
        function (err) {
            if (err) {
                console.error("Ürün silme hatası:", err.message);
                return res.status(500).json({ error: err.message });
            }

            res.sendStatus(200);
        }
    );
});

// =========================================================
// 4. MÜŞTERİLER API
// =========================================================

// Müşterileri listele
app.get('/api/customers', (req, res) => {
    db.all(
        `SELECT 
            CustID AS id,
            CustName,
            CustPhone,
            CustAdd
         FROM CustomerTbl
         ORDER BY CustID DESC`,
        [],
        (err, rows) => {
            if (err) {
                console.error("Müşteri listeleme hatası:", err.message);
                return res.status(500).json({ error: err.message });
            }

            res.json(rows);
        }
    );
});

// Müşteri ekle
app.post('/api/customers', (req, res) => {
    const { CustName, CustPhone, CustAdd } = req.body;

    db.run(
        `INSERT INTO CustomerTbl (CustName, CustPhone, CustAdd)
         VALUES (?, ?, ?)`,
        [CustName, CustPhone, CustAdd],
        function (err) {
            if (err) {
                console.error("Müşteri ekleme hatası:", err.message);
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({
                message: "Müşteri başarıyla eklendi.",
                id: this.lastID
            });
        }
    );
});

// Müşteri güncelle
app.put('/api/customers/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { CustName, CustPhone, CustAdd } = req.body;

    db.run(
        `UPDATE CustomerTbl
         SET CustName = ?, CustPhone = ?, CustAdd = ?
         WHERE CustID = ?`,
        [CustName, CustPhone, CustAdd, id],
        function (err) {
            if (err) {
                console.error("Müşteri güncelleme hatası:", err.message);
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.sendStatus(404);
            }

            res.sendStatus(200);
        }
    );
});

// Müşteri sil
app.delete('/api/customers/:id', (req, res) => {
    const id = parseInt(req.params.id);

    db.run(
        `DELETE FROM CustomerTbl WHERE CustID = ?`,
        [id],
        function (err) {
            if (err) {
                console.error("Müşteri silme hatası:", err.message);
                return res.status(500).json({ error: err.message });
            }

            res.sendStatus(200);
        }
    );
});

// =========================================================
// 5. ÇALIŞANLAR API
// =========================================================

// Çalışanları listele
app.get('/api/employees', (req, res) => {
    db.all(
        `SELECT 
            EmpNum AS id,
            EmpName,
            EmpDOB,
            EmpPhone,
            EmpPass,
            EmpAdd,
            EmpRole
         FROM EmployeeTbl
         ORDER BY EmpNum DESC`,
        [],
        (err, rows) => {
            if (err) {
                console.error("Çalışan listeleme hatası:", err.message);
                return res.status(500).json({ error: err.message });
            }

            res.json(rows);
        }
    );
});

// Çalışan ekle
app.post('/api/employees', (req, res) => {
    const { EmpName, EmpDOB, EmpPhone, EmpPass, EmpAdd } = req.body;

    db.run(
        `INSERT INTO EmployeeTbl 
         (EmpName, EmpDOB, EmpPhone, EmpPass, EmpAdd, EmpRole)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [EmpName, EmpDOB, EmpPhone, EmpPass, EmpAdd, 'Employee'],
        function (err) {
            if (err) {
                console.error("Çalışan ekleme hatası:", err.message);
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({
                message: "Çalışan başarıyla eklendi.",
                id: this.lastID
            });
        }
    );
});

// Çalışan güncelle
app.put('/api/employees/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { EmpName, EmpDOB, EmpPhone, EmpPass, EmpAdd } = req.body;

    db.run(
        `UPDATE EmployeeTbl
         SET EmpName = ?, EmpDOB = ?, EmpPhone = ?, EmpPass = ?, EmpAdd = ?
         WHERE EmpNum = ?`,
        [EmpName, EmpDOB, EmpPhone, EmpPass, EmpAdd, id],
        function (err) {
            if (err) {
                console.error("Çalışan güncelleme hatası:", err.message);
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.sendStatus(404);
            }

            res.sendStatus(200);
        }
    );
});

// Çalışan sil
app.delete('/api/employees/:id', (req, res) => {
    const id = parseInt(req.params.id);

    db.run(
        `DELETE FROM EmployeeTbl WHERE EmpNum = ?`,
        [id],
        function (err) {
            if (err) {
                console.error("Çalışan silme hatası:", err.message);
                return res.status(500).json({ error: err.message });
            }

            res.sendStatus(200);
        }
    );
});

// =========================================================
// 6. FATURA API
// =========================================================
app.post('/api/bills', (req, res) => {
    const { custID, custName, empName, totalAmount, items } = req.body;

    db.run(
        `INSERT INTO BillTbl 
         (CustID, CustName, EmpName, TotalAmount)
         VALUES (?, ?, ?, ?)`,
        [custID, custName, empName, parseFloat(totalAmount)],
        function (err) {
            if (err) {
                console.error("Fatura ekleme hatası:", err.message);
                return res.status(500).json({ error: err.message });
            }

            const billID = this.lastID;

            if (!items || items.length === 0) {
                return res.sendStatus(201);
            }

            let completed = 0;
            let hasError = false;

            items.forEach(item => {
                const productName = item.name || item.PrName;
                const quantity = parseInt(item.qty || item.Quantity);
                const unitPrice = parseFloat(item.price || item.UnitPrice || 0);
                const total = quantity * unitPrice;

                db.get(
                    `SELECT ProID FROM ProductTbl WHERE PrName = ?`,
                    [productName],
                    (findErr, product) => {
                        if (findErr || !product) {
                            if (!hasError) {
                                hasError = true;
                                return res.status(500).json({
                                    error: "Ürün bulunamadı veya fatura kalemi eklenemedi."
                                });
                            }
                            return;
                        }

                        db.run(
                            `INSERT INTO BillItemTbl 
                             (BillID, ProID, PrName, Quantity, UnitPrice, Total)
                             VALUES (?, ?, ?, ?, ?, ?)`,
                            [billID, product.ProID, productName, quantity, unitPrice, total]
                        );

                        db.run(
                            `UPDATE ProductTbl 
                             SET PrQty = PrQty - ?
                             WHERE ProID = ?`,
                            [quantity, product.ProID],
                            (stockErr) => {
                                completed++;

                                if (stockErr && !hasError) {
                                    hasError = true;
                                    return res.status(500).json({ error: stockErr.message });
                                }

                                if (completed === items.length && !hasError) {
                                    res.sendStatus(201);
                                }
                            }
                        );
                    }
                );
            });
        }
    );
});

// Faturaları listelemek istersen kullanılır
app.get('/api/bills', (req, res) => {
    db.all(
        `SELECT * FROM BillTbl ORDER BY BillID DESC`,
        [],
        (err, rows) => {
            if (err) {
                console.error("Fatura listeleme hatası:", err.message);
                return res.status(500).json({ error: err.message });
            }

            res.json(rows);
        }
    );
});

// =========================================================
// SUNUCU BAŞLATMA
// =========================================================
app.listen(3000, () => {
    console.log("PetShop Sunucusu SQLite veritabanıyla 3000 portunda çalışıyor!");
});