// BẮT ĐẦU VỚI DANH SÁCH TRỐNG TRƠN!
let danhSachPhanQuat = []; 

let currentAngle = 0;
let isSpinning = false;

document.addEventListener("DOMContentLoaded", () => {
    hienThiLichSu();
    capNhatToanBoGiaoDien();
});

// Chuyển tab
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
    capNhatToanBoGiaoDien();
}

// Cập nhật cả bánh xe, danh sách xóa và hộp quà cùng 1 lúc
function capNhatToanBoGiaoDien() {
    veVongQuay(currentAngle);
    khoiTaoBocTham();
    hienThiDanhSachQuanLy();
}

// Thêm quà trực tiếp
function themQuaMoi() {
    const input = document.getElementById("inputTenQua");
    const tenQua = input.value.trim();

    if (!tenQua) {
        alert("Vui lòng nhập tên món quà nha!");
        return;
    }

    const danhSachMau = ['#ff9ff3', '#feca57', '#48dbfb', '#ff6b6b', '#1dd1a1', '#c8d6e5', '#ff9a9e', '#7bed9f'];
    const mauNgauNhien = danhSachMau[Math.floor(Math.random() * danhSachMau.length)];

    danhSachPhanQuat.push({ text: tenQua, color: mauNgauNhien });
    input.value = "";
    
    capNhatToanBoGiaoDien();
}

// Hàm mới: Hiển thị danh sách để xóa
function hienThiDanhSachQuanLy() {
    const list = document.getElementById("manageGiftsList");
    if (!list) return;
    list.innerHTML = "";
    
    if (danhSachPhanQuat.length === 0) {
        list.innerHTML = "<div class='empty-msg'>Chưa có món quà nào. Bạn thêm vào nha!</div>";
        return;
    }

    danhSachPhanQuat.forEach((qua, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span><span style="color:${qua.color}; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">⬤</span> ${qua.text}</span>
            <button class="btn-remove-gift" onclick="xoaQua(${index})">Xóa</button>
        `;
        list.appendChild(li);
    });
}

// Hàm mới: Xóa món quà khỏi mảng
function xoaQua(index) {
    danhSachPhanQuat.splice(index, 1);
    capNhatToanBoGiaoDien();
}

// Vẽ vòng quay hình tròn bằng Canvas
function veVongQuay(angle) {
    const canvas = document.getElementById("wheelCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 135; 

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const total = danhSachPhanQuat.length;

    // Xử lý khi chưa có quà (vẽ một vòng xám trống)
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

        // Vẽ miếng bánh
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = qua.color;
        ctx.fill();
        
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        // Vẽ chữ
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + arcSize / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#2f3640"; 
        ctx.font = "bold 14px 'Nunito', Arial";
        ctx.fillText(qua.text, radius - 15, 5);
        ctx.restore();
    });

    // Vẽ tâm vòng quay
    ctx.beginPath();
    ctx.arc(centerX, centerY, 18, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ff6b81";
    ctx.stroke();
}

// Hiệu ứng quay
function batDauQuay() {
    if (danhSachPhanQuat.length === 0) {
        alert("Bánh xe trống trơn rồi, thêm quà vào trước đã nha!");
        return;
    }
    
    if (isSpinning) return;
    isSpinning = true;

    document.getElementById("result").innerHTML = "Đang quay tít thò lò... 💫";
    document.getElementById("btnQuay").style.display = "none";
    document.getElementById("btnReset").style.display = "none";

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
            const winningItem = danhSachPhanQuat[winningIndex];

            const ketQua = `✨ Tadaaa! Bạn nhận được: ${winningItem.text}`;
            document.getElementById("result").innerHTML = ketQua;
            luuLichSu(ketQua);
            document.getElementById("btnReset").style.display = "inline-block";
        }
    }

    requestAnimationFrame(animate);
}

function resetVongQuay() {
    document.getElementById("result").innerHTML = "";
    document.getElementById("btnQuay").style.display = "inline-block";
    document.getElementById("btnReset").style.display = "none";
}

// Giao diện bốc thăm
function khoiTaoBocTham() {
    const container = document.getElementById("giftList");
    container.innerHTML = ""; 
    
    if (danhSachPhanQuat.length === 0) {
        container.innerHTML = "<div style='grid-column: 1 / -1; color: #a4b0be; font-size: 13px;'>Chưa có món quà nào, hãy qua Tab Vòng Quay để thêm nhé!</div>";
        return;
    }

    danhSachPhanQuat.forEach((qua) => {
        const div = document.createElement("div");
        div.className = "gift-item";
        div.innerHTML = `🎁<span>${qua.text}</span>`;
        div.onclick = () => chonHopQua(qua.text);
        container.appendChild(div);
    });
}

function chonHopQua(tenQua) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "Đang mở hộp quà... 🎀";
    
    setTimeout(() => {
        const ketQua = `💖 Wow! Hộp quà giấu: ${tenQua}`;
        resultDiv.innerHTML = ketQua;
        luuLichSu(ketQua);
    }, 500);
}

// Lịch sử
function luuLichSu(ketQua) {
    let history = JSON.parse(localStorage.getItem("minigameHistory")) || [];
    const thoiGian = new Date().toLocaleTimeString();
    history.unshift(`[${thoiGian}] ${ketQua}`); 
    if (history.length > 10) history.pop();
    localStorage.setItem("minigameHistory", JSON.stringify(history));
    hienThiLichSu();
}

function hienThiLichSu() {
    const historyList = document.getElementById("historyList");
    let history = JSON.parse(localStorage.getItem("minigameHistory")) || [];
    historyList.innerHTML = "";
    if (history.length === 0) {
        historyList.innerHTML = "<li style='color: #a4b0be; list-style: none; margin-left: -20px;'>Chưa có gì trong túi đồ nè.</li>";
        return;
    }
    history.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        historyList.appendChild(li);
    });
}

function xoaLichSu() {
    if (confirm("Bạn có chắc muốn dọn sạch túi đồ không?")) {
        localStorage.removeItem("minigameHistory");
        hienThiLichSu();
        document.getElementById("result").innerHTML = "";
    }
}