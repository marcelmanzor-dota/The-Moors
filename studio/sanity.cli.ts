import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'replace-me',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // The editing dashboard will live at https://the-moors.sanity.studio
  studioHost: 'the-moors',
  deployment: { autoUpdates: true },
});
