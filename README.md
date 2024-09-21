<p align="center"><b>WARNING: Educational purposes only.</b></p>
<p align="center">
  <img src="https://user-images.githubusercontent.com/60201017/229349090-f355267d-01dc-4fd7-a30a-5de319315140.png", width="256" height="256" />
</p>
<h1 align="center"> copenJS </h1>
<p align="center"><i>This project started as a joke but we are here now.</i></p>

# Requirements 
- [NodeJS v18+](https://nodejs.org/en/download) (DONT USE NodeJS 22) and [Java](https://www.java.com/tr/download/)

- Minimum 4+ GB Ram (didnt test with v2 but prob needs less ram)

# Usage

Change the `adminName` and `adminPass` sections in the install.sh also you need to change `ip.for.access.database` to access local db externally & configure the `config.json` file in src then run `install.sh` it with sudo.

also you need to change node_modules/minecraft-protocol/src/transforms/framing.js line 67 to `          } else {}` from `          } else { throw e }` also at line 55 delete the `throw e` line

# Development
You need any JDK 17 for developing the parser also you can use the same NodeJS version for developing JavaScript.

# License
This project is licensed under [MIT](https://opensource.org/licenses/MIT) license.
