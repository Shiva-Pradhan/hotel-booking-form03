const ROOM_PRICES = {
    classic: 2500,
    luxury: 4500,
    premium: 7000
};

const OCCUPANCY_LIMITS = {
    single: 2,
    double: 4
};

const EXTRA_GUEST_PRICE = 800; 


const bookingForm = document.getElementById("bookingForm");

const checkIn = document.getElementById("checkin");
const checkOut = document.getElementById("checkout");
const roomType = document.getElementById("roomType");
const roomOccupancy = document.getElementById("roomOccupancy");
const adults = document.getElementById("adults");
const children = document.getElementById("children");

const customerName = document.getElementById("customerName");
const customerEmail = document.getElementById("customerEmail");
const customerPhone = document.getElementById("customerPhone");

const govtIdType = document.getElementById("govtIdType");
const govtIdFile = document.getElementById("govtIdFile");

const paymentSection = document.getElementById("paymentSection");
const totalPriceText = document.getElementById("totalPrice");
const paymentMethods = document.getElementsByName("paymentMethod");
const pricePreview = document.getElementById("pricePreview");

const hotelLocation = document.getElementById("hotelLocation");

let finalPrice = 0;

checkIn.addEventListener("change", () => {
    checkOut.min = checkIn.value;
});

checkOut.addEventListener("change", () => {
    if (checkOut.value <= checkIn.value) {
        alert("Check-out date must be after Check-in date");
        checkOut.value = "";
    }
});


function calculatePrice() {
    if (!checkIn.value || !checkOut.value) return 0;

    const inDate = new Date(checkIn.value);
    const outDate = new Date(checkOut.value);

    const days =
    (outDate - inDate) / (1000 * 60 * 60 * 24);

    if (days <= 0) return 0;

    const basePrice = ROOM_PRICES[roomType.value] * days;

    const totalGuests =
        Number(adults.value) + Number(children.value);

    const occupancy = roomOccupancy.value;
    const maxAllowed = OCCUPANCY_LIMITS[occupancy];

    if (totalGuests > maxAllowed) {
        alert(
            `Maximum ${maxAllowed} guests allowed for a ${occupancy.toUpperCase()} room`
        );
        return 0;
    }

    const extraGuests = Math.max(0, totalGuests - maxAllowed);
    const extraGuestCharge = extraGuests * EXTRA_GUEST_PRICE * days;

    return basePrice + extraGuestCharge;
}


document.querySelectorAll(
    "#checkin, #checkout, #roomType, #roomOccupancy, #adults, #children"
).forEach((input) => {
    input.addEventListener("change", () => {
        const price = calculatePrice();
        pricePreview.innerText =
            price > 0 ? `Estimated Price: ₹${price}` : "";
    });
});

bookingForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!customerName.value || !customerEmail.value || !customerPhone.value) {
        alert("Please fill all customer details");
        return;
    }

    if (!checkIn.value || !checkOut.value) {
        alert("Please select valid dates");
        return;
    }

    if (adults.value < 1) {
        alert("At least one adult is required");
        return;
    }

    if (!hotelLocation.value) {
        alert("Please select hotel location");
        return;
    }

    if (!govtIdType.value) {
        alert("Please select a Government ID type");
        return;
    }

    if (!govtIdFile.files.length) {
        alert("Please upload your Government ID document");
        return;
    }

    const file = govtIdFile.files[0];
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
        alert("Only PDF, JPG or PNG files are allowed");
        govtIdFile.value = "";
        return;
    }

    if (file.size > maxSize) {
        alert("Government ID file size must be under 5 MB");
        govtIdFile.value = "";
        return;
    }

    finalPrice = calculatePrice();

    if (finalPrice === 0) {
        alert("Unable to calculate price. Please check details.");
        return;
    }

    totalPriceText.innerText = `Total Payable Amount: ₹${finalPrice}`;
    paymentSection.style.display = "block";
    paymentSection.scrollIntoView({ behavior: "smooth" });
});

function confirmBooking() {
    let selectedPayment = "";

    Array.from(paymentMethods).forEach((method) => {
        if (method.checked) selectedPayment = method.value;
    });

    if (!selectedPayment) {
        alert("Please select a payment method");
        return;
    }

    showConfirmation(selectedPayment);
}


function showConfirmation(paymentMode) {
    const bookingId = "HB" + Math.floor(Math.random() * 1000000);

    document.body.innerHTML = `
    <style>
        body {
            margin: 0;
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #020617, #0f172a);
        }
        .confirm-box {
            max-width: 850px;
            margin: 70px auto;
            background: white;
            border-radius: 20px;
            padding: 45px;
            box-shadow: 0 30px 80px rgba(0,0,0,0.4);
            animation: scaleIn 0.8s ease;
        }
        @keyframes scaleIn {
            from { transform: scale(0.85); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        h1 { color: #16a34a; }
        .btn {
            margin-top: 30px;
            padding: 14px 34px;
            border: none;
            border-radius: 10px;
            background: #0f172a;
            color: white;
            cursor: pointer;
        }
    </style>

    <div class="confirm-box">
        <h1>🎉 Booking Confirmed!</h1>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Name:</strong> ${customerName.value}</p>
        <p><strong>Location:</strong> ${hotelLocation.value}</p>
        <p><strong>Room Type:</strong> ${roomType.value.toUpperCase()}</p>
        <p><strong>Check-in:</strong> ${checkIn.value}</p>
        <p><strong>Check-out:</strong> ${checkOut.value}</p>
        <p><strong>Guests:</strong> ${adults.value} Adults, ${children.value} Children</p>
        <p><strong>Payment:</strong> ${paymentMode}</p>
        <p><strong>Total Paid:</strong> ₹${finalPrice}</p>
        <button class="btn" onclick="location.reload()">Book Another Stay</button>
    </div>
    `;
}
