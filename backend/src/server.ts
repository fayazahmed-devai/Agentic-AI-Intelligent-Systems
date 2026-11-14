import { app } from './app.js';
import { config } from './config/env.js';
import { initDatabase } from './database/db.js';
import { SampleDataService } from './services/demo/sampleDataService.js';

async function bootstrap() {
  try {
    await initDatabase();
    await SampleDataService.seedDemoWorkspace();

    app.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`🚀 NexusMind AI Server running on port ${config.port}`);
      console.log(`🌐 System Health: http://localhost:${config.port}/api/health`);
      console.log(`🤖 Gemini Model: ${config.geminiModel} (${config.geminiApiKey ? 'Configured' : 'Standby Mode'})`);
      console.log(`📂 Supabase Storage: ${config.supabaseUrl ? 'Active' : 'Local Fallback'}`);
      console.log(`=======================================================`);
    });
  } catch (err: any) {
    console.error('Fatal server bootstrap failure:', err);
    process.exit(1);
  }
}

bootstrap();
