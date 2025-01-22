chmod +x backend/setup.sh
./backend/setup.sh

cd frontend
npm install
npm run build

cd ..
pm2 start ecosystem.dev.config.js