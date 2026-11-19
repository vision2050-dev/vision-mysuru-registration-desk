import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generates a base64 Data URL for a given pass code or verification payload.
 * High-contrast QR with Mysuru Royal Crimson styling or crisp dark format.
 */
export async function generateQRCodeDataURL(
  payload: string,
  options?: QRCodeOptions
): Promise<string> {
  const defaultOptions: QRCode.QRCodeToDataURLOptions = {
    errorCorrectionLevel: 'H', // High error correction for fast and damaged camera scanning
    width: options?.width || 360,
    margin: options?.margin ?? 2,
    color: {
      dark: options?.color?.dark || '#1f140c', // Vision Mysuru deep dark tone
      light: options?.color?.light || '#ffffff',
    },
  };

  try {
    const dataUrl = await QRCode.toDataURL(payload, defaultOptions);
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}

/**
 * Generates a PNG Buffer for a given pass code or verification payload.
 * Ideal for email CID inline attachments and direct PNG stream responses.
 */
export async function generateQRCodeBuffer(
  payload: string,
  options?: QRCodeOptions
): Promise<Buffer> {
  const defaultOptions: QRCode.QRCodeToBufferOptions = {
    errorCorrectionLevel: 'H',
    width: options?.width || 360,
    margin: options?.margin ?? 2,
    color: {
      dark: options?.color?.dark || '#1f140c',
      light: options?.color?.light || '#ffffff',
    },
  };

  try {
    const buffer = await QRCode.toBuffer(payload, defaultOptions);
    return buffer;
  } catch (err) {
    console.error('Error generating QR code buffer:', err);
    throw err;
  }
}

/**
 * Parses scanned text (which might be a full URL, JSON, or raw code) into the standardized passCode.
 */
export function extractPassCodeFromScan(rawScan: string): string {
  if (!rawScan) return '';
  const trimmed = rawScan.trim();

  // If it's a URL like https://domain.com/pass/VM2050-7821-MYS
  const urlMatch = trimmed.match(/\/pass\/([A-Za-z0-9_-]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1].toUpperCase();
  }

  // If it contains VM2050-XXXX-XXX pattern anywhere
  const codeMatch = trimmed.match(/VM2050-[A-Za-z0-9]+-[A-Za-z0-9]+/i);
  if (codeMatch && codeMatch[0]) {
    return codeMatch[0].toUpperCase();
  }

  // Fallback to raw trimmed uppercase string
  return trimmed.toUpperCase();
}
