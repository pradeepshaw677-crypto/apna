export async function initWhatsApp() {
  const apiKey = process.env.WUAPI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ WUAPI_API_KEY set nahi hai! Render Environment ya .env mein add karein.');
  } else {
    console.log('✅ Wuapi WhatsApp API Ready! Ab OTP seedha Wuapi se jayega.');
  }
}

export async function sendWhatsAppMessage(recipientPhone: string, message: string): Promise<boolean> {
  const apiKey = process.env.WUAPI_API_KEY;
  const accountId = process.env.WUAPI_ACCOUNT_ID || 'j57dvgdfh820bapc133y8ct7y58hfezt';

  if (!apiKey) {
    console.error('❌ WUAPI_API_KEY missing hai!');
    return false;
  }

  try {
    // Phone number ko +91XXXXXXXXXX (E.164 format) mein set karein
    let cleanNum = recipientPhone.replace(/\D/g, '');
    if (cleanNum.length === 10) {
      cleanNum = '91' + cleanNum;
    }
    const formattedTo = `+${cleanNum}`;

    const response = await fetch('https://api.wuapi.dev/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accountId: accountId,
        to: formattedTo,
        type: 'text',
        text: message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Wuapi API Error:', data);
      return false;
    }

    console.log(`✅ WhatsApp OTP delivered to ${formattedTo} via Wuapi!`);
    return true;
  } catch (err) {
    console.error('❌ WhatsApp message send error:', err);
    return false;
  }
}
