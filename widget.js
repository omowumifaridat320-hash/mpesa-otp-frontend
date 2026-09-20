const BACKEND_URL = 'https://mpesa-otp-backend.onrender.com';
let isVerified = false;

// Initialize JotForm Widget API safely
if (window.JotFormCustomWidget) {
  JotFormCustomWidget.subscribe('ready', function() {
    JotFormCustomWidget.subscribe('submit', function() {
      JotFormCustomWidget.sendSubmit({
        valid: isVerified,
        value: document.getElementById('phone').value
      });
    });
  });
}

async function sendOtp() {
 let phoneInput = document.getElementById('phone').value.trim();

// Automatically convert 07... / 01... or +254... to standard 254 format
if (phoneInput.startsWith('0')) {
    phoneInput = '254' + phoneInput.substring(1);
} else if (phoneInput.startsWith('+254')) {
    phoneInput = phoneInput.substring(1);
}

const phone = phoneInput;
  const statusMsg = document.getElementById('status-msg');

  if (!phone) {
    statusMsg.className = 'status error';
    statusMsg.innerText = 'Please enter a valid phone number.';
    return;
  }

  statusMsg.className = 'status';
  statusMsg.innerText = 'Sending OTP...';

  try {
    const response = await fetch(`${BACKEND_URL}/api/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: phone })
    });
    const data = await response.json();

    if (data.success) {
      statusMsg.className = 'status success';
      statusMsg.innerText = 'OTP SENT! Check your SMS messages for the code.';
      document.getElementById('otp-section').style.display = 'block';
    } else {
      statusMsg.className = 'status error';
      statusMsg.innerText = data.message || 'Failed to send OTP.';
    }
  } catch (err) {
    statusMsg.className = 'status error';
    statusMsg.innerText = 'Server error. Is backend running?';
  }
}

async function verifyOtp() {
  const phone = document.getElementById('phone').value.trim();
  const otp = document.getElementById('otp').value.trim();
  const statusMsg = document.getElementById('status-msg');

  if (!otp) {
    statusMsg.className = 'status error';
    statusMsg.innerText = 'Please enter the 6-digit OTP.';
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: phone, otp: otp })
    });
    const data = await response.json();

    if (data.success && data.verified) {
      isVerified = true;
      statusMsg.className = 'status success';
      statusMsg.innerText = '✓ Phone number verified successfully!';
      document.getElementById('send-btn').disabled = true;
      document.getElementById('verify-btn').disabled = true;

      if (window.JotFormCustomWidget) {
        JotFormCustomWidget.sendSubmit({
          valid: true,
          value: phone
        });
      }
    } else {
      statusMsg.className = 'status error';
      statusMsg.innerText = data.message || 'Invalid OTP code.';
    }
  } catch (err) {
    statusMsg.className = 'status error';
    statusMsg.innerText = 'Error verifying OTP.';
  }
}