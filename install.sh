sudo mv ./extra/mongod.conf /etc/mongod.conf 
sudo apt-get install -y curl 
curl -fsSL https://deb.nodesource.com/setup_21.x -o nodesource_setup.sh &&
sudo -E bash nodesource_setup.sh 
sudo apt-get install -y nodejs 
npm i && 
sudo apt install software-properties-common gnupg apt-transport-https ca-certificates -y 
curl -fsSL https://pgp.mongodb.com/server-7.0.asc |  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor 
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update -y
sudo apt install mongodb-org -y 
sudo chown -R mongodb:mongodb /var/lib/mongodb 
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock 
sudo systemctl start mongod 
sudo mongosh --eval "use admin" --eval 'db.createUser({ user: "adminName", pwd: "adminPass", roles: [{ role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase"] } )' 
sudo ufw enable 
sudo ufw allow 80 
sudo ufw allow 9534 
sudo ufw allow from ip.for.access.database to any port 27017
sudo node ./src/scanner.mjs