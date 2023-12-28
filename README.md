# Latent Dictionary
An interactive 3D map of DistilBert word embeddings.

### Dev Install
1. Get `docker-compose`
2. Build the frontend
```
cd frontend
npm install
```
3. Launch docker. This will take a few minutes the first time because the embeddings models are being downloaded and setup.
```
cd ..
docker-compose up --build
```
4. If everything worked, you'll see the app at `localhost:80`. 

### Production Install (on Debian 11)
1. Run `server_setup.sh` to setup your deps, install docker-compose and clone the project
2. Setup SSL certificates following the Certbot Instructions
3. Run the project using the production script
```
cd latent-dictionary
docker-compose -f docker-compose.prod.yaml up --build -d
```
4. View logs stream with `docker-compose logs -f`
