import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'portfolioFinal',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  // 🟢 CONFIGURACIÓN DE VARIABLES DE ENTORNO PARA ANDROID
  android: {
    build: {
      environment: {
        supabaseUrl: 'https://syqwdmrvwfjhsvnzpdgm.supabase.co',
        supabaseKey: 'sb_publishable_8j8yWHA0wxBX7I_6Fx8sEQ_CwTN8pQt'
      }
    }
  }
};

export default config;