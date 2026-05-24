const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./petshop.db", (err) => {
    if (err) {
        console.error("Veritabanı bağlantı hatası:", err.message);
    } else {
        console.log("SQLite veritabanına bağlandı.");
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS EmployeeTbl (
            EmpNum INTEGER PRIMARY KEY AUTOINCREMENT,
            EmpName TEXT NOT NULL,
            EmpAdd TEXT NOT NULL,
            EmpDOB TEXT NOT NULL,
            EmpPhone TEXT NOT NULL,
            EmpPass TEXT NOT NULL,
            EmpRole TEXT DEFAULT 'employee'
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS ProductTbl (
            ProID INTEGER PRIMARY KEY AUTOINCREMENT,
            PrName TEXT NOT NULL,
            PrCat TEXT NOT NULL,
            PrQty INTEGER NOT NULL DEFAULT 0,
            PrPrice REAL NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS CustomerTbl (
            CustID INTEGER PRIMARY KEY AUTOINCREMENT,
            CustName TEXT NOT NULL,
            CustAdd TEXT NOT NULL,
            CustPhone TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS BillTbl (
            BillID INTEGER PRIMARY KEY AUTOINCREMENT,
            BillDate TEXT DEFAULT CURRENT_DATE,
            CustID INTEGER,
            CustName TEXT,
            EmpName TEXT,
            TotalAmount REAL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS BillItemTbl (
            ItemID INTEGER PRIMARY KEY AUTOINCREMENT,
            BillID INTEGER,
            ProID INTEGER,
            PrName TEXT,
            Quantity INTEGER,
            UnitPrice REAL,
            Total REAL
        )
    `);

    db.get("SELECT COUNT(*) AS count FROM EmployeeTbl", (err, row) => {
        if (!err && row.count === 0) {
            db.run(`
                INSERT INTO EmployeeTbl 
                (EmpName, EmpAdd, EmpDOB, EmpPhone, EmpPass, EmpRole)
                VALUES 
                ('Admin', 'Mağaza Merkezi', '1990-01-01', '05001234567', 'admin123', 'admin'),
                ('Ahmet Yılmaz', 'Ankara', '1995-05-15', '05321234567', 'emp123', 'employee')
            `);
        }
    });

    db.get("SELECT COUNT(*) AS count FROM ProductTbl", (err, row) => {
        if (!err && row.count === 0) {
            db.run(`
                INSERT INTO ProductTbl 
                (PrName, PrCat, PrQty, PrPrice)
                VALUES 
                ('Kedi Maması', 'Kedi', 20, 350),
                ('Köpek Maması', 'Köpek', 15, 500),
                ('Kuş Yemi', 'Kuş', 30, 120),
                ('Akvaryum Balığı', 'Balık', 50, 80),
                ('Kedi Oyuncağı', 'Aksesuar', 25, 90)
            `);
        }
    });

    db.get("SELECT COUNT(*) AS count FROM CustomerTbl", (err, row) => {
        if (!err && row.count === 0) {
            db.run(`
                INSERT INTO CustomerTbl 
                (CustName, CustAdd, CustPhone)
                VALUES 
                ('Mehmet Demir', 'Ankara', '05411234567'),
                ('Ayşe Kaya', 'İstanbul', '05551234567'),
                ('Fatma Şahin', 'Sivas', '05321234568')
            `);
        }
    });
});

module.exports = db;