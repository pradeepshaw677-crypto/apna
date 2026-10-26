import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';

let sock: any = null;
let isConnected = false;
let pairingRequested = false;

export async function initWhatsApp() {
  const senderPhone = (process.env.WHATSAPP_SENDER_PHONE || '919153352808').replace(/\D/g, '');
  console.log(`🔄 Initializing WhatsApp Bot (+${senderPhone})...`);

  try {
    const { state, saveCreds } = await useMultiFileAuthState("./.apna_whatsapp_auth");
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }) as any,
      printQRInTerminal: false,
      // Fixed browser signature required by WhatsApp for Phone Pairing
      browser: ["Ubuntu", "Chrome", "20.0.04"],
      // Purani chats bilkul sync mat karo (isse loading hang nahi hogi aur chats private rahengi)
      syncFullHistory: false,
      markOnlineOnConnect: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 15000,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if ((connection === 'connecting' || qr) && !sock.authState.creds.registered && !pairingRequested) {
        pairingRequested = true;
        console.log('⏳ Generating fresh 8-Digit Pairing Code...');
        setTimeout(async () => {
          try {
            if (!sock.authState.creds.registered) {
              const code = await sock.requestPairingCode(senderPhone);
              const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
              console.log('\n======================================================');
              console.log(`📲 WHATSAPP LINKING CODE (FOR +${senderPhone}):`);
              console.log(`\n👉   ${formattedCode}   👈\n`);
              console.log('======================================================');
              console.log('⚡ TIP: Agar ho sake toh Split-Screen mein WhatsApp khol kar code daalo!\n');
            }
          } catch (err: any) {
            console.error('❌ Pairing code request error:', err?.message || err);
          }
        }, 4000);
      }

      if (connection === 'close') {
        isConnected = false;
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        console.log(`⚠️ WhatsApp connection closed (Code: ${statusCode}).`);

        // 515 means pairing succeeded and WhatsApp requires immediate stream restart!
        if (statusCode === 515 || statusCode !== DisconnectReason.loggedOut) {
          console.log('🔄 Reconnecting WhatsApp stream...');
          setTimeout(initWhatsApp, 2000);
        } else {
          console.log('❌ Session expired (401). Run: rm -rf whatsapp_auth && npm run dev');
        }
      } else if (connection === 'open') {
        isConnected = true;
        console.log('\n✅ LIVE WHATSAPP BOT CONNECTED SUCCESSFULLY! Ab OTP seedha WhatsApp par jayega!\n');
      }
    });
  } catch (err) {
    console.error('❌ Failed to start WhatsApp Bot:', err);
  }
}

export async function sendWhatsAppMessage(recipientPhone: string, message: string): Promise<boolean> {
  if (!sock || !isConnected) {
    console.warn('⚠️ WhatsApp abhi link nahi hua hai.');
    return false;
  }
  try {
    const cleanNum = recipientPhone.replace(/\D/g, '');
    const jid = `${cleanNum}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text: message });
    console.log(`✅ Original WhatsApp OTP delivered to +${cleanNum}!`);
    return true;
  } catch (err) {
    console.error('❌ WhatsApp message send error:', err);
    return false;
  }
}
