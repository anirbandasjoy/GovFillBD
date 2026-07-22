import { registerContentMessages } from '@/content/registerContentMessages';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    registerContentMessages();
  }
});
