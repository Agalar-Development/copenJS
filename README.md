<p align="center">
  <img src="https://user-images.githubusercontent.com/60201017/229349090-f355267d-01dc-4fd7-a30a-5de319315140.png", width="256" height="256" />
</p>
<h1 align="center"> copenJS </h1>
<p align="center"><i>This project started as a joke but we are here now.</i></p>

# Requirements 
- [NodeJS v18+](https://nodejs.org/en/download) and [Java](https://www.java.com/tr/download/)

- Minimum 4+ GB Ram
# Getting Started
Install Node Modules with:
 ```bash 
 npm i
 ```

# Usage

## Method 1 (If you have scan.json)

 Add your scan.json in the repository folder then head into the src folder and start the scanner with 
 ```bash
 node scanner.js
 ```

 ## Method 2 (If you dont have scan.json)

 First of all, you need a Linux Server for this method. (I tried this method with Ubuntu Server)

 When the server is ready, we need to clone masscan repo and build masscan via these commands:
  ```bash
  sudo apt-get --assume-yes install git make gcc
git clone https://github.com/robertdavidgraham/masscan
cd masscan
make
```
then 
 ```bash
make install
```
If this returns something like this: "install -pDm755 bin/masscan /usr/bin/masscan" you can directly copy and paste it into the terminal.

## Try using: 
```bash
masscan
```
If this does not return anything restart the server if it returns something head back to the repository folder then start scanning the entire internet with this command:
```bash
masscan 0.0.0.0/0 -p0-65535 -oJ scan.json --max-rate 1200000 --excludefile exclude.conf
```
When the program scan is done you can do the same thing with Method 1.

# Development
You need any JDK 17 for developing the parser also you can use the same NodeJS version for developing JavaScript.

# License
This project is licensed under [MIT](https://opensource.org/licenses/MIT) license.