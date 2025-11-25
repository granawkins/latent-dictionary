module.exports = {
    apps: [
      {
          name: 'latentdictionary',
          cwd: './backend',
          script: './.venv/bin/uvicorn app:app --host 0.0.0.0 --port 5001',
          watch: false,
          env: {
            NODE_ENV: 'production',
          },
          max_memory_restart: '600M'
      },
    ],
  };
  