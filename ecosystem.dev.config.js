module.exports = {
    apps: [
      {
          name: 'latentdictionary-backend',
          cwd: './backend',
          script: './.venv/bin/uvicorn app:app --host 0.0.0.0 --port 5001',
          watch: true,
          env: {
            NODE_ENV: 'development',
          },
      },
      {
        name: 'latentdictionary-frontend',
        cwd: './frontend',
        script: 'npm run dev',
        watch: false, // Disabled because Vite handles hot reloading
        env: {
          NODE_ENV: 'development',
        },
      },
    ],
  };
  