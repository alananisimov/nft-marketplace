import crypto from 'crypto';
import { TelegramAutoLogin } from '../modules/auth/application/dto';

export function verifyInitData(telegramInitData: TelegramAutoLogin, botToken: string): { isVerified: boolean } {
  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken);
  const calculatedHash = crypto.createHmac('sha256', secret.digest()).update(JSON.stringify(telegramInitData)).digest('hex');

  const isVerified = calculatedHash === telegramInitData.hash;

  return { isVerified };
}
