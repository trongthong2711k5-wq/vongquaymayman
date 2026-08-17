// ==========================================
// 1. CẤU HÌNH KẾT NỐI SUPABASE
// ==========================================
const supabaseUrl = 'https://ohsvsxltuctosomaoayp.supabase.co';
const supabaseKey = 'sb_publishable_Y8GKTLcYFyaeBjeH03O3yQ_jg-9Yc9o';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let danhSachPhanQuat = [];
let currentAngle = 0;
let isSpinning = false;
let tenKhachHang = "";

document.addEventListener("DOMContentLoaded", () => {
    kiemTraDaChoiChua();
    layDuLieuTuSupabase();
});

// ==========================================
// 2. TẢI QUÀ TỪ SUPABASE (DATABASE)
// ==========================================
async function layDuLieuTuSupabase() {
    document.getElementById("result").innerHTML = "Đang tải kho quà từ máy chủ... ⏳";
    
    const { data, error } = await supabase.from('KhoQua').select('*');

    if (error) {
        console.log("Lỗi tải quà Supabase:", error);
        document.getElementById("result").innerHTML = "Lỗi kết nối mạng, vui lòng tải lại trang!";
        return;
    }

    if (data && data.length > 0) {
        danhSachPhanQuat = data;
        document.getElementById("result").innerHTML = ""; 
        veVongQuay(0);
        khoiTaoBocTham();
    } else {
        document.getElementById("result").innerHTML = "Kho quà đang trống, chờ shop cập nhật nhé!";
    }
}

// ==========================================
// 3. LOGIC CHỐNG GIAN LẬN & GIAO DIỆN
// ==========================================
function kiemTraDaChoiChua() {
    const dataCu = localStorage.getItem("daNhanQua_TramQuaTang");
    if (dataCu) {
        const parsed = JSON.parse(dataCu);
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("mainGameScreen").style.display = "block";
        document.querySelector(".tab-buttons").style.display = "none";
        document.getElementById("bocThamSection").style.display = "none";
        document.getElementById("vongQuaySection").style.display = "none";
        
        document.getElementById("tenHienThi").innerText = parsed.ten;
        document.getElementById("result").innerHTML = `
            <div style="background: #fff0f3; padding: 20px; border-radius: 20px; border: 2px dashed #ff477e; margin-top: 20px;">
                <h3 style="color: #ff477e; margin-bottom: 10px;">Tadaaa! 🎉</h3>
                <p><strong>${parsed.ten}</strong> đã nhận được:</p>
                <h2 style="color: #2f3542; margin: 10px 0;">${parsed.qua}</h2>
                <p style="font-size: 13px; color: #ff6b81; font-weight: bold; margin-top: 15px;">Hệ thống đã lưu kết quả. Chụp màn hình gửi Mị nha! 💌</p>
            </div>`;
    }
}

function xacNhanTen() {
    const input = document.getElementById("inputTenKhach").value.trim();
    if (!input) {
        alert("Bạn nhập tên vào để Mị trao quà nha! 🌸");
        return;
    }
    tenKhachHang = input;
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("mainGameScreen").style.display = "block";
    document.getElementById("tenHienThi").innerText = tenKhachHang;
}

function doiGiaoDien(loai) {
    const bocThamSec = document.getElementById("bocThamSection");
    const vongQuaySec = document.getElementById("vongQuaySection");
    const buttons = document.querySelectorAll(".tab-btn");

    buttons.forEach(btn => btn.classList.remove("active"));
    document.getElementById("result").innerHTML = "";

    if (loai === 'bocTham') {
        bocThamSec.style.display = "block";
        vongQuaySec.style.display = "none";
        buttons[0].classList.add("active");
    } else {
        bocThamSec.style.display = "none";
        vongQuaySec.style.display = "block";
        buttons[1].classList.add("active");
    }
    veVongQuay(currentAngle);
    khoiTaoBocTham();
}

// ==========================================
// 4. VẼ VÒNG QUAY & BỐC THĂM
// ==========================================
function veVongQuay(angle) {
    const canvas = document.getElementById("wheelCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 135; 

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const total = danhSachPhanQuat.length;

    if (total === 0) return;

    const arcSize = (2 * Math.PI) / total;

    danhSachPhanQuat.forEach((qua, i) => {
        const startAngle = angle + i * arcSize;
        const endAngle = startAngle + arcSize;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = qua.color || "#ffb6c1";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + arcSize / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#2f3640"; 
        ctx.font = "bold 14px 'Nunito', Arial";
        ctx.fillText(qua.text, radius - 15, 5);
        ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, 18, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ff6b81";
    ctx.stroke();
}

function khoiTaoBocTham() {
    const container = document.getElementById("giftList");
    container.innerHTML = ""; 
    
    if (danhSachPhanQuat.length === 0) return;

    let mangXaoTron = [...danhSachPhanQuat].sort(() => Math.random() - 0.5);
    mangXaoTron.forEach((qua) => {
        const div = document.createElement("div");
        div.className = "gift-item";
        div.innerHTML = `🎁<span>Chọn tớ đi!</span>`; 
        div.onclick = () => chonHopQua(qua.text);
        container.appendChild(div);
    });
}

// ==========================================
// 5. CHƠI GAME & GỬI BÁO CÁO LÊN SUPABASE
// ==========================================
function batDauQuay() {
    if (danhSachPhanQuat.length === 0) return;
    if (isSpinning) return;
    if (localStorage.getItem("daNhanQua_TramQuaTang")) return; 

    isSpinning = true;
    document.getElementById("result").innerHTML = "Đang quay tít thò lò... 💫";
    document.getElementById("btnQuay").style.display = "none";

    const total = danhSachPhanQuat.length;
    const randomSpin = Math.floor(Math.random() * 360) + 1440; 
    const targetAngle = currentAngle + (randomSpin * Math.PI) / 180;

    let startTime = null;
    const duration = 3500; 

    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        currentAngle = currentAngle + (targetAngle - currentAngle) * easeOut;
        veVongQuay(currentAngle);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            const normalizedAngle = (currentAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
            const arcSize = (2 * Math.PI) / total;
            let pointerAngle = (1.5 * Math.PI - normalizedAngle) % (2 * Math.PI);
            if (pointerAngle < 0) pointerAngle += 2 * Math.PI;
            
            const winningIndex = Math.floor(pointerAngle / arcSize);
            tienHanhKhoaGameVaBaoCao(danhSachPhanQuat[winningIndex].text);
        }
    }
    requestAnimationFrame(animate);
}

function chonHopQua(tenQua) {
    if (localStorage.getItem("daNhanQua_TramQuaTang")) return; 
    document.getElementById("result").innerHTML = "Đang mở hộp quà... 🎀";
    document.getElementById("giftList").style.display = "none";
    setTimeout(() => {
        tienHanhKhoaGameVaBaoCao(tenQua);
    }, 800);
}

// Hàm Xử lý Khóa Game & Lưu lịch sử vĩnh viễn lên Supabase
async function tienHanhKhoaGameVaBaoCao(tenQuaTrung) {
    // Lưu tạm vào máy khách để chống quay 2 lần
    localStorage.setItem("daNhanQua_TramQuaTang", JSON.stringify({ ten: tenKhachHang, qua: tenQuaTrung }));
    
    // Hiển thị kết quả ra màn hình
    document.getElementById("result").innerHTML = `
        <div style="background: #fff0f3; padding: 20px; border-radius: 20px; border: 2px dashed #ff477e; margin-top: 20px;">
            <h3 style="color: #ff477e; margin-bottom: 10px;">Tadaaa! 🎉</h3>
            <p><strong>${tenKhachHang}</strong> đã nhận được:</p>
            <h2 style="color: #2f3542; margin: 10px 0;">${tenQuaTrung}</h2>
            <p style="font-size: 13px; color: #ff6b81; font-weight: bold; margin-top: 15px;">Hệ thống đã lưu kết quả. Chụp màn hình gửi Mị nha! 💌</p>
        </div>`;
    
    // Ẩn các nút chơi
    document.querySelector(".tab-buttons").style.display = "none";
    document.getElementById("vongQuaySection").style.display = "none";
    document.getElementById("bocThamSection").style.display = "none";
    
    // Đẩy dữ liệu về bảng LichSu trên Supabase
    const thoiGianHienTai = new Date().toLocaleString('vi-VN');
    const { error } = await supabase.from('LichSu').insert([
        { thoiGian: thoiGianHienTai, tenKhach: tenKhachHang, quaTrung: tenQuaTrung }
    ]);
    
    if (error) console.log("Lỗi lưu lịch sử Supabase:", error);
}

// Các hàm rác (Thêm xóa thủ công) được gỡ bỏ vì dùng Database rồi.
function hienThiLichSu() {} // Ẩn lỗi nếu HTML cũ còn gọi
function xoaLichSu() {}