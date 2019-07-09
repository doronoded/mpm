# Multiple Package Manager (MPM)

######An open-source library to manage multiple packages.
`mpm` enable you to clone, install, sync, build your packages in a multi-package / component solution.
It is perfect to be used as a dev tool in a micro-services environment. 
Instead of cloning multiple repositories / packages, navigating to each one, installing it, building,
starting it manually and configure how each package "talks" with the other in your local dev environment,
you can use simple `mpm install`, `mpm start` commands to install all your packages, and start those.
The library if fully customizable and gives you **full control** via the `multi-package.json` file. 
There you define the packages, their scripts and more. 

###Platforms
Currenly supported only for Mac OS and Linux. You are welcomed to contribute more support ;)

###Installation

`npm install -g mpm`

###Usage

1. Initiate an mpm project
    ```
    $ mkdir <your-projects-folder>
    $ cd <your-projects-folder>
    $ mpm init
    ```
2. Follow the `mpm init` instructions to create your `multi-package.json`
3. Install your packages
    ```
    $ mpm install
    ```
4. Run
    ```
    $ mpm start
    ```
5. Sync (git-wise)
    ```
    $ mpm pull
    ```
6. Add whichever commands and scripts you would like.

####The `mutli-package.json` file:
The `multi-package.json` file holds the packages configuration for the different scripts.

```
{
   "packages": {
      "package1": {
         "name": "package1",
         "repository": "https://github.com/<package1>.git",
         "branch": "<The desired working branch to sync with>",
         "scripts": {
            "install": "git clone https://github.com/<package1>.git <package1> && cd <package1> && git checkout <working-branch> && npm install",
            "pull": "git stash && git pull --rebase && git stash pop && npm install"
         }
      },
      "package2": {
         "name": "package2",
         "repository": "https://github.com/<package2>.git",
         "branch": "<The desired working branch to sync with>",
         "scripts": {
            "install": "git clone https://github.com/<package1>.git <package2> && cd <package2> && git checkout <working-branch> && npm install && node **do-something-important-after-install.js**",
            "pull": "git stash && git pull --rebase && git stash pop && npm install"
         }
      }
   },
   "scripts": {
        "build": "node my-custom-build-script.js"
   }
}
```
 
It has 2 sections:
1. `packages`: an object with all the packages configuration. 
Each package configuration has a `name` key, and `scripts` section. 
The `repository` and `branch` keys are not required, and are added during the "wizard"-like `mpm init` process.
The important section is the `scripts` section, in which the different custom scripts are defined.
When running `mpm install` for example, **mpm** iterates through the *install* scripts (defined in the multi-package.json) for each package and run it (synchronized).
In case the script is not defined in the `multi-package.json` file, but it is a valid npm script (e.g. `update`), mpm would run it as well. 
Meaning, all npm scripts are inherently supported, unless overriden by the `multi-package.json` file.
Running `mpm my-script` will run all matching scripts in the `multi-package.json` packages sections.
> Important note: In case of an overlap between a script name defined in the `packages` section, and a script defined in the `scripts` section, the `scripts` will run, and the `packages` scripts will not.   
* `init`: Initiates the `multi-package.json` file.
* `start`: Runs the *start* script of the different packages (as defined in the `multi-package.json` file) - **each in its own terminal tab**.
e.g. running `mpm start` for 5 packages, opens 5 different terminal tabs, navigates to each package in the corresponding tab, and run the start script for it. You may pass a `-p` or `--package` parameter to run specific packages (e.g. `mpm start -p package1 -p package4`)  
2. `scripts`: Holds the custom scripts you may want to add to mpm. 
In the initial `multi-package.json` file created in the init process, this section is empty.
You may add scripts you can run via `mpm myCustomeScript`. 