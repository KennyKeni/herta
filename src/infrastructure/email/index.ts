import { Resend } from 'resend';
import { config } from '@/config';

export const resend = new Resend(config.email.RESEND_API_KEY);
