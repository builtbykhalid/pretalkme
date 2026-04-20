export function toQrPayload(qr: string) {
  return {
    qr,
    qrBase64: Buffer.from(qr).toString('base64'),
    generatedAt: new Date().toISOString(),
  };
}
