// ==========================================
// CÀI ĐẶT QUÀ VÀ TỶ LỆ TRÚNG
// ==========================================
const danhSachQua = [
    { ten: "🎁 Voucher giảm 50K", tyLe: 5 },
    { ten: "🧸 1 Bé Son dưỡng xinh", tyLe: 10 },
    { ten: "🌸 Freeship đơn sau", tyLe: 25 },
    { ten: "🍀 Chúc bạn may mắn lần sau!", tyLe: 60 }
];
const SO_LUONG_TUI_MU = 6;
let tenKhachHang = "";

document.addEventListener("DOMContentLoaded", () => {
    kiemTraKhachDaChoiChua();
});

function kiemTraKhachDaChoiChua() {
    const dataCu = localStorage.getItem("duLieuKhuiQua");
    if (dataCu) {
        const dataParsed = JSON.parse(dataCu);
        document.getElementById("loginScreen").style.display = "none";
        hienThiKetQua(dataParsed.ten, dataParsed.qua);
    }
}

function xacNhanTen() {
    const input = document.getElementById("inputTenKhach").value.trim();
    if (!input) {
        alert("Mị cần biết tên bạn để phát quà nè! Hãy nhập tên nhé 🌸");
        return;
    }
    tenKhachHang = input;
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("tenHienThi").innerText = tenKhachHang;
    document.getElementById("gameScreen").style.display = "block";
    taoTuiMu();
}

function taoTuiMu() {
    const grid = document.getElementById("boxGrid");
    grid.innerHTML = "";
    for (let i = 0; i < SO_LUONG_TUI_MU; i++) {
        const box = document.createElement("div");
        box.className = "blind-box";
        box.innerHTML = "🛍️";
        box.onclick = () => khuiTuiMu();
        grid.appendChild(box);
    }
}

function khuiTuiMu() {
    if (localStorage.getItem("duLieuKhuiQua")) return; 

    let beBocTham = [];
    danhSachQua.forEach(qua => {
        for (let i = 0; i < qua.tyLe; i++) {
            beBocTham.push(qua.ten);
        }
    });

    const phanThuongTrung = beBocTham[Math.floor(Math.random() * beBocTham.length)];

    const duLieu = { ten: tenKhachHang, qua: phanThuongTrung };
    localStorage.setItem("duLieuKhuiQua", JSON.stringify(duLieu));

    document.getElementById("gameScreen").style.display = "none";
    hienThiKetQua(tenKhachHang, phanThuongTrung);

    if (!phanThuongTrung.includes("may mắn")) {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, colors: ['#ff477e', '#ffb6c1', '#feca57', '#48dbfb'] });
    }

    guiBaoCaoChoMi(tenKhachHang, phanThuongTrung);
}

function hienThiKetQua(ten, ketQua) {
    document.getElementById("tenKhachKetQua").innerText = ten;
    
    // Nếu trượt thì đổi màu nền kết quả cho bớt nổi bật
    const resultText = document.getElementById("resultText");
    resultText.innerText = ketQua;
    if(ketQua.includes("may mắn")) {
        resultText.style.background = "linear-gradient(135deg, #a4b0be 0%, #dfe4ea 100%)";
        resultText.style.color = "#2f3542";
    }

    document.getElementById("resultCard").style.display = "block";
}

// ==========================================
// GỬI BÁO CÁO VỀ GOOGLE SHEETS CỦA MỊ
// ==========================================
function guiBaoCaoChoMi(ten, qua) {
    const thoiGianHienTai = new Date().toLocaleString('vi-VN');
    const duLieu = {
        thoiGian: thoiGianHienTai,
        tenKhach: ten,
        quaTrung: qua
    };

    // MỊ DÁN CÁI LINK GOOGLE DÀI NGOẰNG VÀO BÊN DƯỚI NHÉ:
    const linkGoogleSheet = "https://script.google.com/macros/s/AKfycbxBChxqho4jazJjF_bw4JYaaWBo8bOGCu3D9hyaVg9GneoQZOYnyD-WXDb6pMcdkc_tag/exec";

    if (linkGoogleSheet !== "https://script.google.com/macros/s/AKfycbxBChxqho4jazJjF_bw4JYaaWBo8bOGCu3D9hyaVg9GneoQZOYnyD-WXDb6pMcdkc_tag/exec" && linkGoogleSheet !== "") {
        fetch(linkGoogleSheet, {
            method: "POST",
            body: JSON.stringify(duLieu)
        }).catch(err => console.log("Lỗi gửi:", err));
    }
}