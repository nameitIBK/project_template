# Jack & Jones Frontend Project Template

### An easy project starter for frontend projects on jackjones.com

#### Version 1.0

***

### How to use:

***

#### Install tools globally

##### Node.js

Visit the [Node website](http://nodejs.org/) and install the node package for your platform

##### Gulp

Open your commandline interface and install gulp

Mac:

	sudo npm install -g gulp


Windows (Make sure cmd is opened as admin):

	npm install -g gulp

##### XAMPP

For windows go [here](https://www.apachefriends.org/index.html) and install the appropriate package

When running XAMPP remember to do so with admin rights

##### Livereload

Install the [LiveReload extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei) for Google Chrome

LiveReload will refresh the localhost preview automatically when you do changes.

***

#### Set up project

##### Create project files

First, copy all the files from this repo into your new project

Folder structure:

	project/
		src/
			fonts/
			images/
			scripts/
				< Project scripts here >
				vendor/
					< Plugins and vendor scripts here >
			styles/
				< Styles go here >
				modules/
					< Modules go here, fx mixins and functions >
				partials/
					< Imports go here, fx shared styling across pages >
		build/
			< Compiled project will be automatically created here >
			.local/
			assets/
				< Compiled files for deployment >
		node_modules/
			< Project specific node modules will automatically be installed here >

Project folder should be renamed to fit the project your're working on. All other folders should not be renamed.

##### Add files to config

Find **config.json** in the root of the project, and add your project files

Make sure to add any JS or CSS files you add, also vendor files.

Adding files here will minify them in the project code.

When you introduce new files to the project, remember to do a gulp build

```json
{
"local":
{
	"assets_root": "build/.local/"
},
"production":
{
	"assets_root": "build/assets/"	
},
"jsfiles":
[
	"src/scripts/jsFilesGoHere.js"
],
"cssfiles":
[
	"src/styles/cssFilesGoHere.css"
]
}
```

##### Set up localhost

Change the listening port of XAMPP to **1337** in **/xampp/apache/conf/httpd.conf**

Add a virtualhost configuration to **/xampp/apache/conf/extra/httpd-vhosts.conf**

```conf
<VirtualHost project.dev:1337>
    ServerAdmin email@email.com
    DocumentRoot "/path/to/project"
    ServerName project.dev
    ServerAlias project.dev
    <Directory "/path/to/project">
        Options Indexes FollowSymLinks ExecCGI Includes
        Order Allow,Deny
        Allow from all
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Add a custom localhost domain to your hosts file

	Windows: %SystemRoot%\system32\drivers\etc\hosts

	Mac: /etc/hosts

Config to be added:

	127.0.0.1 	project.dev

Start XAMPP with admin rights and your project is now available to browsers at **http://project.dev:1337**

##### Init project

Navigate to your project root in your command-line and install modules

	npm intall

Make an initial build of the project

	gulp build

***

### Development

##### Dependencies

Make sure to always run **Node** and **XAMPP** when developing locally.

Node is what handles gulp and LiveReload, while XAMPP provides the localhost server for your project.

##### Languages

Styling: **stylus** (nib is supported in this package)

Scripting: **coffeescript**

##### Markup

The markup for the project should be added to **project/src/html/index.php.template**

If you're working with a project contained in a content asset, wrap it all in a content asset container, like so:

```html
<div class='contentasset'>
	Project markup here
</div>
```

If you're working on a content slot template, your markup should mimic the DMW generated HTML.

After updating the markup you need to do a **gulp build**

##### Watching for changes

Before you start editing scripts and styles, make sure to start the watcher:

	gulp watch

This monitors the project folders for changes and triggers LiveReload when needed. It also logs errors to the commandline for bugfixing.

***

### Commands

Installing gulp globally

	npm imstall -g gulp

Install modules for project

	npm install

Build the project for localhost preview

	gulp build

Build the project for deployment
	
	gulp deploy

Initiate the watcher

	gulp watch