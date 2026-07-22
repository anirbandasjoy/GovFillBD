import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'GovApply Autofill',
    short_name: 'GovApply',
    description: 'Bangladesh Government Job Application Autofill Assistant',
    permissions: ['activeTab', 'scripting', 'storage'],
    host_permissions: ['<all_urls>'],
    options_ui: {
      page: 'options.html',
      open_in_tab: true
    },
    action: {
      default_title: 'GovApply Autofill'
    }
  }
});
