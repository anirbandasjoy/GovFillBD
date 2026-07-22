import { registerBackgroundMessages } from '@/background/registerBackgroundMessages';

export default defineBackground(() => {
  registerBackgroundMessages();
});
