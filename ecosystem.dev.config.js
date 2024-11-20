module.exports = {
    apps: [
      {
          name: 'latentdictionary-backend',
          cwd: './backend',
          script: './.venv/bin/uvicorn app:app --host 0.0.0.0 --port 5001',
          env: {
            NODE_ENV: 'development',
          },
      },     
      {
        name: 'latentdictionary-frontend',
        cwd: './frontend',
        script: 'npm',
        args: 'start',
        env: {
          NODE_ENV: 'development',
        },
      },
    ],
  };
  