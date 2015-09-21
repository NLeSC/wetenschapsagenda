Visualizatie Nationale Wetenschapsagenda
========================================

Getting started (windows, from scratch)
---------------------------------------

1. Install Git : 	http://git-scm.com/downloads
2. Install Node.js : 	http://nodejs.org/ (Make sure add node to PATH option is checked)
  1. Create '$HOME/npm' folder (Where $HOME is c:\Users\<username>\AppData\Roaming).
  2. Open node command prompt and run `npm install -g bower grunt-cli`
3. Start Git bash
4. Type: "git clone https://github.com/NLeSC/wetenschapsagenda"
5. Type: "cd wetenschapsagenda"
6. Type: "npm install -g grunt grunt-cli"
7. Type: "npm install"
8. Type: "bower install"
9. Type: "bower update"
10. Type: "grunt serve"
11. (this should happen automatically) Open browser, go to "http://localhost:9000"

Getting started (Linux, Debian and Ubuntu based)
-------------------------------------------------

Prerequisites
------------

1. nodejs, http://nodejs.org/
2. bower, http://bower.io
3. Java Development Kit, https://www.java.com/

Installation
------------

### Install nodejs

Follow instructions at joyents github website:
https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#debian-and-ubuntu-based-linux-distributions

### Install nodejs modules
Install bower and grunt-cli globally
```
sudo npm install -g bower grunt-cli
```

### Fetch git repository
```
git clone https://github.com/NLeSC/wetenschapsagenda.git
```

### setup with bower
```
cd wetenschapsagenda
npm install
bower install
```
If you already have a installed the bower packages before, but need to update them for a new version of the code, run
```
bower update
```

### start development server & open browser
```
grunt serve
```
Changes made to code will automatically reload web page.

### Build a distro

```
grunt build
```
The `dist` folder has production ready distribution.
