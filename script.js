// ==========================================
// 1. CẤU HÌNH & KHỞI TẠO SUPABASE AN TOÀN
// ==========================================
const supabaseUrl = 'https://ohsvsxltuctosomaoayp.supabase.co';
const supabaseKey = 'sb_publishable_Y8GKTLcYFyaeBjeH03O3yQ_jg-9Yc9o';

let supabaseClient = null;
try {
    if (window.supabase && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    }
} catch (e) {
    console.error("Lỗi khởi tạo Supabase:", e);
}

let danhSachPhanQuat = [];
let currentAngle = 0;
let isSpinning = false;
let tenKhachHang = "";

document.addEventListener("DOMContentLoaded", () => {
    kiemTraDaChoiChua();
    layDuLieuTuSupabase();
});

// ==========================================
// 2. TẢI QUÀ TỪ SUPABASE
// ==========================================
async function layDuLieuTuSupabase() {
    const resultEl = document.getElementById("result");
    if (resultEl) resultEl.innerHTML = "Đang tải kho quà... ⏳";
    
    if (!supabaseClient) {
        if (resultEl) resultEl.innerHTML = "Lỗi kết nối máy chủ!";
        return;
    }

    try {
        // Lấy danh sách quà và sắp xếp theo ID
        const { data, error } = await supabaseClient.from('KhoQua').select('*').order('id', { ascending: true });

        if (error) {
            console.error("Lỗi Supabase:", error);
            if (resultEl) resultEl.innerHTML = "Lỗi kết nối kho quà!";
            return;
        }

        danhSachPhanQuat = data || [];
        
        if (danhSachPhanQuat.length > 0) {
            if (resultEl) resultEl.innerHTML = ""; 
        } else {
            if (resultEl) resultEl.innerHTML = "Kho quà đang trống, hãy thêm quà nhé!";
        }
        
        // Vẽ lại toàn bộ giao diện sau khi tải
        veVongQuay(0);
        khoiTaoBocTham();
        hienThiDanhSachQuanLy();

    } catch (err) {
        console.error("Lỗi mạng:", err);
    }
}

// ==========================================
// 3. THÊM & XÓA QUÀ TRỰC TIẾP TRÊN WEB
// ==========================================
window.themQuaMoi = async function() {
    const input = document.getElementById("inputTenQua");
    const tenQua = input ? input.value.trim() : "";

    if (!tenQua) {
        alert("Vui lòng nhập tên món quà nha!");
        return;
    }

    // Tự động lấy một màu ngẫu nhiên cho món quà
    const danhSachMau = ['#ff9ff3', '#feca57', '#48dbfb', '#ff6b6b', '#1dd1a1', '#c8d6e5', '#ff9a9e', '#7bed9f'];
    const mauNgauNhien = danhSachMau[Math.floor(Math.random() * danhSachMau.length)];

    input.value = "Đang lưu lên máy chủ... ⏳";
    input.disabled = true;

    if (supabaseClient) {
        const { error } = await supabaseClient.from('KhoQua').insert([
            { text: tenQua, color: mauNgauNhien }
        ]);

        if (error) {
            console.error("Lỗi thêm quà:", error);
            alert("Có lỗi xảy ra khi lưu lên Supabase!");
        }
        
        input.value = "";
        input.disabled = false;
        // Bắn lệnh tải lại kho quà
        layDuLieuTuSupabase(); 
    }
};

window.xoaQua = async function(id) {
    if(!confirm("Bạn có chắc muốn xóa món quà này khỏi Supabase không?")) return;
    
    if (supabaseClient) {
        const { error } = await supabaseClient.from('KhoQua').delete().eq('id', id);
        
        if (error) {
            console.error("Lỗi xóa quà:", error);
            alert("Có lỗi xảy ra khi xóa!");
        } else {
            // Xóa thành công thì tải lại kho quà
            layDuLieuTuSupabase(); 
        }
    }
};

window.hienThiDanhSachQuanLy = function() {
    const list = document.getElementById("manageGiftsList");
    if (!list) return;
    list.innerHTML = "";
    
    if (danhSachPhanQuat.length === 0) {
        list.innerHTML = "<div class='empty-msg'>Chưa có món quà nào. Bạn thêm vào nha!</div>";
        return;
    }

    danhSachPhanQuat.forEach((qua) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span><span style="color:${qua.color}; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">⬤</span> ${qua.text}</span>
            <button class="btn-remove-gift" onclick="xoaQua(${qua.id})">Xóa</button>
        `;
        list.appendChild(li);
    });
};

// ==========================================
// 4. XỬ LÝ GIAO DIỆN & NÚT VÀO CHƠI
// ==========================================
window.xacNhanTen = function() {
    const input = document.getElementById("inputTenKhach");
    const ten = input ? input.value.trim() : "";
    
    if (!ten) {
        alert("Bạn nhập tên vào để Mị trao quà nha! 🌸");
        return;
    }
    
    tenKhachHang = ten;
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("mainGameScreen").style.display = "block";
    document.getElementById("tenHienThi").innerText = tenKhachHang;
    
    veVongQuay(0);
    khoiTaoBocTham();
};

function kiemTraDaChoiChua() {
    const dataCu = localStorage.getItem("daNhanQua_TramQuaTang");
    if (dataCu) {
        const parsed = JSON.parse(dataCu);
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("mainGameScreen").style.display = "block";
        const tabBtns = document.querySelector(".tab-buttons");
        if (tabBtns) tabBtns.style.display = "none";
        
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

window.doiGiaoDien = function(loai) {
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
};

// ==========================================
// 5. VẼ CANVAS VÀ TẠO HỘP QUÀ
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
    
    // Nếu chưa có quà, vẽ vòng xám
    if (total === 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "#f1f2f6";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.fillStyle = "#a4b0be";
        ctx.font = "bold 16px 'Nunito', Arial";
        ctx.fillText("Chưa có quà", centerX, centerY + 6);
        return;
    }

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
    if (!container) return;
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
// 6. CHƠI VÀ LƯU LỊCH SỬ LÊN SUPABASE
// ==========================================
window.batDauQuay = function() {
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
};

window.chonHopQua = function(tenQua) {
    if (localStorage.getItem("daNhanQua_TramQuaTang")) return; 
    document.getElementById("result").innerHTML = "Đang mở hộp quà... 🎀";
    document.getElementById("giftList").style.display = "none";
    setTimeout(() => {
        tienHanhKhoaGameVaBaoCao(tenQua);
    }, 800);
};

async function tienHanhKhoaGameVaBaoCao(tenQuaTrung) {
    localStorage.setItem("daNhanQua_TramQuaTang", JSON.stringify({ ten: tenKhachHang, qua: tenQuaTrung }));
    
    document.getElementById("result").innerHTML = `
        <div style="background: #fff0f3; padding: 20px; border-radius: 20px; border: 2px dashed #ff477e; margin-top: 20px;">
            <h3 style="color: #ff477e; margin-bottom: 10px;">Tadaaa! 🎉</h3>
            <p><strong>${tenKhachHang}</strong> đã nhận được:</p>
            <h2 style="color: #2f3542; margin: 10px 0;">${tenQuaTrung}</h2>
            <p style="font-size: 13px; color: #ff6b81; font-weight: bold; margin-top: 15px;">Hệ thống đã lưu kết quả. Chụp màn hình gửi Mị nha! 💌</p>
        </div>`;
    
    const tabBtns = document.querySelector(".tab-buttons");
    if (tabBtns) tabBtns.style.display = "none";
    document.getElementById("vongQuaySection").style.display = "none";
    document.getElementById("bocThamSection").style.display = "none";
    
    if (supabaseClient) {
        const thoiGianHienTai = new Date().toLocaleString('vi-VN');
        const { error } = await supabaseClient.from('LichSu').insert([
            { thoiGian: thoiGianHienTai, tenKhach: tenKhachHang, quaTrung: tenQuaTrung }
        ]);
        if (error) console.error("Lỗi gửi Supabase:", error);
    }
}
