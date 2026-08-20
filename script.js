const supabaseUrl = 'https://ohsvsxltuctosomaoayp.supabase.co';
const supabaseKey = 'sb_publishable_Y8GKTLcYFyaeBjeH03O3yQ_jg-9Yc9o';
let supabaseClient = null;

if (window.supabase) {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
}

let danhSachPhanQuat = [];
let currentAngle = 0;
let isSpinning = false;
let tenKhachHang = "";

const BANG_MAU = ['#ff9ff3', '#feca57', '#48dbfb', '#ff6b6b', '#1dd1a1', '#c8d6e5', '#ff9a9e', '#7bed9f'];

document.addEventListener("DOMContentLoaded", () => {
    const dataCu = localStorage.getItem("daNhanQua_TramQuaTang");
    if (dataCu) {
        const parsed = JSON.parse(dataCu);
        hienThiManHinhDaChoi(parsed.ten, parsed.qua);
        return; 
    }
    layDuLieuTuSupabase();
});

async function layDuLieuTuSupabase() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient.from('KhoQua').select('*').order('id', { ascending: true });
        if (!error && data) {
            danhSachPhanQuat = data;
            veVongQuay(0);
            khoiTaoBocTham();
            hienThiDanhSachQuanLy();
        }
    } catch (err) { console.error("Lỗi:", err); }
}

window.themQuaMoi = async function() {
    const input = document.getElementById("inputTenQua");
    const tenQua = input ? input.value.trim() : "";
    if (!tenQua) { alert("Nhập tên quà nha!"); return; }

    input.value = "Đang lưu... ⏳";
    if (supabaseClient) {
        await supabaseClient.from('KhoQua').insert([{ text: tenQua }]);
        input.value = "";
        layDuLieuTuSupabase();
    }
};

window.xoaQua = async function(id) {
    if(!confirm("Xóa món quà này nhé?")) return;
    if (supabaseClient) {
        await supabaseClient.from('KhoQua').delete().eq('id', id);
        layDuLieuTuSupabase();
    }
};

window.hienThiDanhSachQuanLy = function() {
    const list = document.getElementById("manageGiftsList");
    if (!list) return;
    list.innerHTML = "";
    if (danhSachPhanQuat.length === 0) return;

    danhSachPhanQuat.forEach((qua, i) => {
        let colorIndex = i % BANG_MAU.length;
        if (i === danhSachPhanQuat.length - 1 && colorIndex === 0 && danhSachPhanQuat.length > 1) colorIndex = 1;

        const li = document.createElement("li");
        li.innerHTML = `<span><span style="color:${BANG_MAU[colorIndex]};">⬤</span> ${qua.text}</span>
                        <button class="btn-remove-gift" onclick="xoaQua(${qua.id})">Xóa</button>`;
        list.appendChild(li);
    });
};

window.moAdmin = async function() {
    const pass = prompt("Nhập mật khẩu Admin:");
    if (pass !== "2711") { alert("Sai mật khẩu!"); return; }

    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("mainGameScreen").style.display = "none";
    document.getElementById("adminScreen").style.display = "block";

    const tbody = document.getElementById("adminHistoryList");
    tbody.innerHTML = "<tr><td colspan='3' style='text-align:center; padding: 15px;'>Đang tải... ⏳</td></tr>";

    if (supabaseClient) {
        const { data, error } = await supabaseClient.from('LichSu').select('*').order('id', { ascending: false });
        if (!error && data) {
            tbody.innerHTML = "";
            if (data.length === 0) tbody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>Chưa có ai trúng quà.</td></tr>";
            else {
                data.forEach(row => {
                    tbody.innerHTML += `
                        <tr style="border-bottom: 1px solid #ffe4e1;">
                            <td style="padding: 10px 5px; font-size: 11px; color: #636e72;">${row.thoiGian || ''}</td>
                            <td style="padding: 10px 5px; font-weight: 800; color: #ff477e;">${row.tenKhach || ''}</td>
                            <td style="padding: 10px 5px; font-weight: bold; color: #2d3436;">${row.quaTrung || ''}</td>
                        </tr>
                    `;
                });
            }
        }
    }
};

window.dongAdmin = function() { window.location.reload(); };

// XÓA TRÍ NHỚ ĐỂ TEST LẠI
window.xoaNhoTam = function() {
    localStorage.removeItem("daNhanQua_TramQuaTang");
    alert("Đã mở khóa thiết bị! Giờ bạn có thể test lại từ đầu như khách mới.");
    window.location.reload();
};

window.xacNhanTen = function() {
    const input = document.getElementById("inputTenKhach");
    const ten = input ? input.value.trim() : "";
    if (!ten) { alert("Nhập tên vô nha! 🌸"); return; }
    
    tenKhachHang = ten;
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("mainGameScreen").style.display = "block";
    document.getElementById("tenHienThi").innerText = tenKhachHang;
    
    veVongQuay(0);
    khoiTaoBocTham();
};

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

function hienThiManHinhDaChoi(ten, qua) {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("mainGameScreen").style.display = "block";
    const tabs = document.querySelector(".tab-buttons");
    if(tabs) tabs.style.display = "none";
    document.getElementById("bocThamSection").style.display = "none";
    document.getElementById("vongQuaySection").style.display = "none";
    document.getElementById("tenHienThi").innerText = ten;
    document.getElementById("result").innerHTML = `
        <div style="background: #fff0f3; padding: 20px; border-radius: 20px; border: 2px dashed #ff477e; margin-top: 20px;">
            <h3 style="color: #ff477e; margin-bottom: 10px;">Tadaaa! 🎉</h3>
            <p><strong>${ten}</strong> đã nhận được:</p>
            <h2 style="color: #2f3542; margin: 10px 0;">${qua}</h2>
            <p style="font-size: 13px; color: #ff6b81; font-weight: bold; margin-top: 15px;">Hệ thống đã lưu kết quả. Chụp màn hình gửi Mị nha! 💌</p>
        </div>`;
}

function veVongQuay(angle) {
    const canvas = document.getElementById("wheelCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 135; 

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const total = danhSachPhanQuat.length;
    
    if (total === 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "#f1f2f6";
        ctx.fill();
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
        
        let colorIndex = i % BANG_MAU.length;
        if (i === total - 1 && colorIndex === 0 && total > 1) colorIndex = 1;
        ctx.fillStyle = BANG_MAU[colorIndex];
        
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
        div.onclick = () => window.chonHopQua(qua.text);
        container.appendChild(div);
    });
}

window.batDauQuay = function() {
    if (danhSachPhanQuat.length === 0 || isSpinning || localStorage.getItem("daNhanQua_TramQuaTang")) return; 

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
    setTimeout(() => { tienHanhKhoaGameVaBaoCao(tenQua); }, 800);
};

async function tienHanhKhoaGameVaBaoCao(tenQuaTrung) {
    localStorage.setItem("daNhanQua_TramQuaTang", JSON.stringify({ ten: tenKhachHang, qua: tenQuaTrung }));
    hienThiManHinhDaChoi(tenKhachHang, tenQuaTrung);
    
    if (supabaseClient) {
        const thoiGian = new Date().toLocaleString('vi-VN');
        await supabaseClient.from('LichSu').insert([
            { thoiGian: thoiGian, tenKhach: tenKhachHang, quaTrung: tenQuaTrung }
        ]);
    }
}
