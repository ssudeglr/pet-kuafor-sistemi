document.addEventListener('DOMContentLoaded', async () => {
    try {
        // server.js'teki dashboard rotasına bağlan
        const response = await fetch('http://localhost:3000/api/dashboard/counts');
        const data = await response.json();
        
        // Ekrana yazdır
        document.getElementById('catCount').innerText = data.cats;
        document.getElementById('dogCount').innerText = data.dogs;
        document.getElementById('birdCount').innerText = data.birds;
    } catch (err) {
        console.error("İstatistikler yüklenemedi", err);
    }
});