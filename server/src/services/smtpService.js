const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function simulateSMTP({ sender, recipient, subject, message }) {
  const messages = [];
  const add = (command, response, accepted = true) => messages.push({ command, response, accepted });

  if (!emailRegex.test(sender || "")) {
    add("MAIL FROM", "550 Invalid sender email address", false);
    return { status: "Failed", messages, error: "Enter a valid sender email address." };
  }
  if (!emailRegex.test(recipient || "")) {
    add("RCPT TO", "550 Invalid recipient email address", false);
    return { status: "Failed", messages, error: "Enter a valid recipient email address." };
  }
  if (!subject?.trim() || !message?.trim()) {
    add("DATA", "554 Subject and message are required", false);
    return { status: "Failed", messages, error: "Subject and message cannot be empty." };
  }

  add("CONNECT", "220 Server ready");
  add("EHLO client.local", "250 Hello client.local");
  add(`MAIL FROM:<${sender}>`, "250 Sender accepted");
  add(`RCPT TO:<${recipient}>`, "250 Recipient accepted");
  add("DATA", "354 Start mail input; end with <CRLF>.<CRLF>");
  add(`Subject: ${subject}`, "250 Message content accepted");
  add(".", "250 Message queued successfully");
  add("QUIT", "221 Bye");
  return { status: "Success", messages };
}
