export async function sendTelegram(chatId, text) {
  const token = process.env.BOT_TOKEN;
  if (!token || !chatId) {
    console.warn("Сообщение в Telegram не отправлено: нет BOT_TOKEN или chat id");
    return { ok: false, retry: false };
  }

  let response;
  try {
    response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (error) {
    console.error("Сеть Telegram недоступна", error);
    return { ok: false, retry: true };
  }

  if (!response.ok) {
    const body = await response.text();
    console.error("Telegram отклонил сообщение", response.status, body);
    return { ok: false, retry: response.status >= 500 || response.status === 429 };
  }

  return { ok: true, retry: false };
}

export async function notifyGroup(text) {
  const chatId = process.env.GROUP_CHAT_ID;
  if (!chatId) {
    console.warn("Уведомление в Telegram не отправлено: нет BOT_TOKEN или GROUP_CHAT_ID");
    return false;
  }
  const result = await sendTelegram(chatId, text);
  return result.ok;
}
