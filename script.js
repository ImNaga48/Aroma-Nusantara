// -------------------- GLOBAL STATE --------------------
let menuData = [];
let cart = JSON.parse(localStorage.getItem('aromaCart')) || [];
let cafeInfo = {};
let contactInfo = {};

// -------------------- DOM ELEMENTS --------------------
const sections = {
    home: document.getElementById('home'),
    menu: document.getElementById('menu'),
    cart: document.getElementById('cart'),
    checkout: document.getElementById('checkout'),
    payment: document.getElementById('payment'),
    success: document.getElementById('success')
};

const cartCountEl = document.getElementById('cartCount');
const menuGrid = document.getElementById('menuGrid');
const searchInput = document.getElementById('searchInput');
const filterButtonsContainer = document.querySelector('.filter-buttons');
const cartItemsContainer = document.getElementById('cartItems');
const emptyCartMsg = document.getElementById('emptyCart');
const cartSummary = document.getElementById('cartSummary');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutItemsList = document.getElementById('checkoutItems');
const checkoutTotalEl = document.getElementById('checkoutTotal');
const checkoutForm = document.getElementById('checkoutForm');
const backToCartBtn = document.getElementById('backToCartBtn');
const paymentTotal = document.getElementById('paymentTotal');
const paymentName = document.getElementById('paymentName');
const paymentTable = document.getElementById('paymentTable');
const qrImage = document.getElementById('qrImage');
const qrFallback = document.getElementById('qrFallback');
const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
const timerEl = document.getElementById('timer');
const successOrderId = document.getElementById('successOrderId');
const darkModeToggle = document.getElementById('darkModeToggle');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const loadingScreen = document.getElementById('loading-screen');

let countdownInterval;
let currentOrderTotal = 0;
let currentCustomerName = '';
let currentTableNumber = '';

// -------------------- LOADING & INIT --------------------
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await Promise.all([
            loadCafeInfo(),
            loadMenu(),
            loadContactInfo()
        ]);
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 500);
        initNavigation();
        renderMenu();
        updateCartUI();
        checkDarkMode();
    } catch (err) {
        console.error('Gagal memuat data:', err);
        loadingScreen.innerHTML = '<p>Gagal memuat data. Silakan muat ulang.</p>';
    }
});

// -------------------- DATA FETCH --------------------
async function loadCafeInfo() {
    const res = await fetch('data/cafe.json');
    if (!res.ok) throw new Error('Gagal memuat cafe.json');
    cafeInfo = await res.json();
    // Update elemen home
    document.getElementById('cafeAddress').textContent = cafeInfo.alamat;
    document.getElementById('cafeHours').innerHTML = cafeInfo.jam_operasional.replace(/\n/g, '<br>');
    document.querySelector('.logo-img').src = cafeInfo.logo || 'assets/logo.png';
    document.querySelector('.hero-banner').src = cafeInfo.banner || 'assets/banner.jpg';
    document.title = cafeInfo.nama;
}

async function loadMenu() {
    const res = await fetch('data/menu.json');
    if (!res.ok) throw new Error('Gagal memuat menu.json');
    menuData = await res.json();
    renderCategoryFilters();
}

async function loadContactInfo() {
    const res = await fetch('data/contact.json');
    if (res.ok) {
        contactInfo = await res.json();
        document.getElementById('socialIg').href = contactInfo.instagram || '#';
        document.getElementById('socialFb').href = contactInfo.facebook || '#';
        document.getElementById('socialTiktok').href = contactInfo.tiktok || '#';
        document.getElementById('socialEmail').href = `mailto:${contactInfo.email || ''}`;
    }
}

// -------------------- NAVIGATION SPA --------------------
function initNavigation() {
    // Klik link navigasi dan anchor
    document.querySelectorAll('.nav-link, .cta-btn, .btn-secondary, .btn-primary[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const sectionId = href.substring(1);
                navigateTo(sectionId);
                // Tutup hamburger jika mobile
                navLinks.classList.remove('open');
            }
        });
    });

    // Hamburger toggle
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    // Klik di luar nav-link (opsional)
}

function navigateTo(sectionId) {
    // Sembunyikan semua section
    Object.values(sections).forEach(sec => sec.classList.remove('active'));
    // Tampilkan section yang dipilih
    if (sections[sectionId]) {
        sections[sectionId].classList.add('active');
        // Scroll ke atas
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
        // Trigger khusus saat masuk ke section tertentu
        if (sectionId === 'cart') renderCart();
        if (sectionId === 'payment') setupPayment();
    }
}

// Fungsi navigasi dipanggil dari luar
window.navigateTo = navigateTo;

// -------------------- DARK MODE --------------------
function checkDarkMode() {
    const darkPref = localStorage.getItem('aromaDarkMode') === 'true';
    if (darkPref) {
        document.body.classList.add('dark');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark');
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

darkModeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('aromaDarkMode', isDark);
    darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// -------------------- MENU RENDERING --------------------
function renderCategoryFilters() {
    const categories = ['all', ...new Set(menuData.map(item => item.kategori))];
    filterButtonsContainer.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (cat === 'all' ? ' active' : '');
        btn.textContent = cat === 'all' ? 'Semua' : cat;
        btn.dataset.category = cat;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterAndSearchMenu();
        });
        filterButtonsContainer.appendChild(btn);
    });
}

function filterAndSearchMenu() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const activeCategory = document.querySelector('.filter-btn.active')?.dataset.category || 'all';
    
    let filtered = menuData;
    if (activeCategory !== 'all') {
        filtered = filtered.filter(item => item.kategori === activeCategory);
    }
    if (searchTerm) {
        filtered = filtered.filter(item => item.nama.toLowerCase().includes(searchTerm));
    }
    renderMenuCards(filtered);
}

function renderMenuCards(items = menuData) {
    if (!menuGrid) return;
    menuGrid.innerHTML = '';
    if (items.length === 0) {
        menuGrid.innerHTML = '<p class="text-center" style="grid-column:1/-1">Menu tidak ditemukan.</p>';
        return;
    }
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        const statusClass = item.status === 'Tersedia' ? 'status-tersedia' : 'status-kosong';
        card.innerHTML = `
            <img src="${item.gambar}" alt="${item.nama}" onerror="this.src='assets/menu/default.jpg'">
            <div class="menu-info">
                <h3>${item.nama}</h3>
                <p class="menu-price">Rp ${item.harga.toLocaleString('id-ID')}</p>
                <span class="menu-status ${statusClass}">${item.status}</span>
                <p>${item.deskripsi || ''}</p>
                <button class="add-to-cart-btn" data-id="${item.id}" ${item.status !== 'Tersedia' ? 'disabled' : ''}>
                    ${item.status === 'Tersedia' ? '+ Keranjang' : 'Kosong'}
                </button>
            </div>
        `;
        menuGrid.appendChild(card);
    });

    // Tambahkan event listener ke tombol tambah keranjang
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            addToCart(id);
        });
    });
}

searchInput.addEventListener('input', filterAndSearchMenu);

// -------------------- CART FUNCTIONS --------------------
function addToCart(menuId) {
    const menuItem = menuData.find(m => m.id === menuId);
    if (!menuItem || menuItem.status !== 'Tersedia') return;
    
    const existing = cart.find(item => item.id === menuId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: menuItem.id,
            nama: menuItem.nama,
            harga: menuItem.harga,
            gambar: menuItem.gambar,
            quantity: 1
        });
    }
    saveCart();
    updateCartUI();
    // Animasi atau feedback kecil
    showToast(`${menuItem.nama} ditambahkan ke keranjang`);
}

function removeFromCart(menuId) {
    cart = cart.filter(item => item.id !== menuId);
    saveCart();
    updateCartUI();
    if (sections.cart.classList.contains('active')) renderCart();
}

function changeQuantity(menuId, delta) {
    const item = cart.find(i => i.id === menuId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(menuId);
    } else {
        saveCart();
        updateCartUI();
        if (sections.cart.classList.contains('active')) renderCart();
    }
}

function saveCart() {
    localStorage.setItem('aromaCart', JSON.stringify(cart));
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountEl) cartCountEl.textContent = totalItems;
}

function renderCart() {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        emptyCartMsg.classList.remove('hidden');
        cartSummary.classList.add('hidden');
        return;
    }
    emptyCartMsg.classList.add('hidden');
    cartSummary.classList.remove('hidden');
    
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.gambar}" alt="${item.nama}" onerror="this.src='assets/menu/default.jpg'">
            <div class="cart-item-info">
                <h4>${item.nama}</h4>
                <p class="cart-item-price">Rp ${item.harga.toLocaleString('id-ID')}</p>
                <div class="cart-item-quantity">
                    <button class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
        `;
        cartItemsContainer.appendChild(div);
    });

    // Event delegation untuk tombol di cart
    cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        const id = parseInt(target.dataset.id);
        if (target.classList.contains('remove-item') || target.closest('.remove-item')) {
            removeFromCart(id);
            renderCart(); // re-render setelah hapus
        } else if (target.classList.contains('qty-btn')) {
            const action = target.dataset.action;
            changeQuantity(id, action === 'increase' ? 1 : -1);
            renderCart();
        }
    });

    const total = cart.reduce((sum, i) => sum + (i.harga * i.quantity), 0);
    cartTotalEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

// Event listener untuk checkout button
document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Keranjang masih kosong!');
        return;
    }
    populateCheckout();
    navigateTo('checkout');
});

function populateCheckout() {
    checkoutItemsList.innerHTML = '';
    cart.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${item.nama} x${item.quantity}</span> <span>Rp ${(item.harga * item.quantity).toLocaleString('id-ID')}</span>`;
        checkoutItemsList.appendChild(li);
    });
    const total = cart.reduce((sum, i) => sum + (i.harga * i.quantity), 0);
    checkoutTotalEl.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

// -------------------- CHECKOUT & PAYMENT --------------------
checkoutForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    currentCustomerName = document.getElementById('customerName').value.trim();
    currentTableNumber = document.getElementById('tableNumber').value.trim();
    if (!currentCustomerName || !currentTableNumber) {
        alert('Nama dan nomor meja harus diisi.');
        return;
    }
    currentOrderTotal = cart.reduce((sum, i) => sum + (i.harga * i.quantity), 0);
    setupPayment();
    navigateTo('payment');
});

backToCartBtn?.addEventListener('click', () => {
    navigateTo('cart');
});

function setupPayment() {
    paymentTotal.textContent = `Rp ${currentOrderTotal.toLocaleString('id-ID')}`;
    paymentName.textContent = currentCustomerName;
    paymentTable.textContent = currentTableNumber;

    // QR Code dinamis
    const qrPath = `assets/qr/${currentOrderTotal}.png`;
    qrImage.src = qrPath;
    qrImage.style.display = 'block';
    qrFallback.classList.add('hidden');
    
    qrImage.onerror = () => {
        qrImage.style.display = 'none';
        qrFallback.classList.remove('hidden');
    };
    qrImage.onload = () => {
        qrImage.style.display = 'block';
        qrFallback.classList.add('hidden');
    };

    // Countdown 15 menit
    startCountdown(15 * 60);
}

function startCountdown(duration) {
    clearInterval(countdownInterval);
    let timer = duration;
    const display = timerEl;
    const updateTimer = () => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        if (--timer < 0) {
            clearInterval(countdownInterval);
            display.textContent = 'Waktu habis';
            confirmPaymentBtn.disabled = true;
        }
    };
    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
}

confirmPaymentBtn?.addEventListener('click', async () => {
    clearInterval(countdownInterval);

    const orderData = {
        customer_name: currentCustomerName,
        table_number: currentTableNumber,
        total: currentOrderTotal,
        payment_method: 'qris',
        items: cart.map(item => ({
            menu_id: item.id,
            nama: item.nama,
            harga: item.harga,
            quantity: item.quantity,
            subtotal: item.harga * item.quantity
        }))
    };

    // Simpan ke localStorage sebagai fallback
    const orders = JSON.parse(localStorage.getItem('aromaOrders') || '[]');
    const orderId = 'ORD-' + Date.now().toString(36).toUpperCase();
    orders.push({ id: orderId, ...orderData, created_at: new Date().toISOString() });
    localStorage.setItem('aromaOrders', JSON.stringify(orders));

    // Coba kirim ke backend (abaikan jika gagal)
    try {
        const response = await fetch('backend/save_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        if (response.ok) {
            const result = await response.json();
            if (result.success) orderId = result.order_id;
        }
    } catch (e) {
        // Backend tidak tersedia, tetap lanjutkan
    }

    // Kosongkan keranjang
    cart = [];
    saveCart();
    updateCartUI();
    successOrderId.textContent = `ID Pesanan: ${orderId}`;
    navigateTo('success');
});

// -------------------- TOAST NOTIFICATION --------------------
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }, 10);
}
// Tambahkan style toast di CSS via JS atau langsung di style.css
const style = document.createElement('style');
style.textContent = `
.toast {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--primary);
    color: white;
    padding: 0.7rem 2rem;
    border-radius: 50px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 9999;
}
.toast.show {
    opacity: 1;
}
`;
document.head.appendChild(style);

// Render awal menu setelah data tersedia
function renderMenu() {
    renderMenuCards(menuData);
    filterAndSearchMenu();
}