# genversion

[![npm version](https://badge.fury.io/js/genversion.svg)](https://www.npmjs.com/package/genversion)

![Logo](doc/logo.png?raw=true "Abracadabra...and behold!")

So you want `yourmodule.version` to follow the version in package.json but are tired of updating it manually every time the version changes? On server side, you could just `require('package.json').version` but on client side however, that would expose the versions of your dependencies and possibly other sensitive data too, so [it is usually a naughty thing to do](https://stackoverflow.com/a/10855054/638546)! How to import only the version? Genversion to the rescue!

## Try it out

Usage is simple:

    $ cd yourmodule
    $ npm install genversion
    $ npx genversion version.js

Voilà! The new `version.js`:

    // generated by genversion
    module.exports = '1.2.3'

Use flags to match your coding style. `$ genversion --es6 --semi version.js` creates:

    export const version = '1.2.3';

[Node API](#node-api) is also available:

    > const gv = require('genversion')
    > gv.generate('lib/version.js', { useSemicolon: true }, (err) => { ... })

By default, genversion reads the version from the `package.json` nearest to the target `version.js`. In case your project contains multiple `package.json` files along the target path you can specify the one with `--source <path>` parameter.

## Integrate to your build

First install via [npm](https://www.npmjs.com/package/genversion).

    $ npm install genversion --save-dev

Genversion works by first reading the current version from package.json and then generating a simple CommonJS module file that exports the version string. For safety, the version file begins with a signature that tells genversion that it is safe to overwrite the file.

    // generated by genversion
    module.exports = '1.2.3'

Therefore, your job is to 1) choose a path for the version file, 2) require() the new file into your module, and 3) add genversion as a part of your build or release pipeline. For example, let us choose the path 'lib/version.js' and require it in yourmodule/index.js:

    ...
    exports.version = require('./lib/version')
    ...

If you use `--es6` flag:

    ...
    import { version } from './lib/version'
    export const version
    ...

Then, let us integrate genversion into your build task.

    "scripts": {
      "build": "genversion lib/version.js && other build stuff"
    }

The target path is given as the first argument. If the file already exists and has been previously created by genversion, it is replaced with the new one.

Finished! Now your module has a version property that matches with package.json and is updated every time you build the project.

    > var yourmodule = require('yourmodule')
    > yourmodule.version
    '1.2.3'

Great! Having a version property in your module is very convenient for debugging. More than once we have had the need to painstakingly debug a module, just to find out that it was a cached old version that caused the error. An inspectable version property would have helped a big time.


## Command line API

Directly from `$ genversion --help`:

    Usage: genversion [options] <target>

    Generates a version module at the target filepath.

    Options:
      -V, --version        output genversion's own version
      -v, --verbose        increased output verbosity
      -s, --semi           use semicolons in generated code
      -d, --double         use double quotes in generated code
      -e, --es6            use es6 syntax in generated code
      -u, --strict         add "use strict" in generated code
      -p, --source <path>  search for package.json along a custom path
      -c, --check-only     check if the version module is up to date
      -h, --help           display help for command

### -V, --version

Output the genversion's own version number.

### -s, --semi

End each generated line of code with a semicolon as required by some style guides.

### -d, --double

Use double quotes `"` instead of single quotes `'` as required by some style guides.

### -e, --es6

Use ECMAScript 6 `export const` statement instead of `module.exports` in the generated code.

### -u, --strict

Prepend each generated file with `'use strict'` as required by some style guides.

### -p, --source <path>

Search for the package.json along a custom path up to the system root. Defaults to the target filepath.

### -c, --check-only

When `--check-only` flag is used, only the existence and validity of the version module is checked. No files are generated. The flag is useful for pre-commit hooks and similar.

The command exits with exit code:
  - `0` if the version module exits and does need a refresh.
  - `1` if the version module does not exist at all.
  - `2` if the version module exists but needs a refresh.

The command does not produce any output by default. Use `-v` to increase its verbosity.


## Node API

You can also use genversion within your code:

    const gv = require('genversion');

The available properties and functions are listed below.


### genversion.check(targetPath, opts, callback)

Check if it is possible to generate the version module into `targetPath`.

**Parameters:**

- *targetPath:* string. An absolute or relative file path. Relative to `process.cwd()`.
- *opts:* optional options. Available keys are:
  - *source:* optional string. An absolute or relative path to a file or directory. Genversion searches for the source package.json along this path. Defaults to the value of `targetPath`.
  - *useSemicolon:* optional boolean. Defaults to `false`.
  - *useDoubleQuotes:* optional boolean. Defaults to `false`.
  - *useEs6Syntax:* optional boolean. Defaults to `false`.
- *callback:* function (err, doesExist, isByGenversion, isUpToDate), where:
  - *doesExist:* boolean. True if a file at targetPath already exists.
  - *isByGenversion:* boolean. True if the existing file seems like it has been generated by genversion.
  - *isUpToDate:* boolean. True if the existing file contents are exactly as freshly generated.

**Example:**

    gv.check('lib/version.js', function (err, doesExist, isByGv, isUpToDate) {
      if (err) {
        throw err;
      }

      if (isByGenversion) {
        gv.generate(...)
      }
      ...
    });


### genversion.generate(targetPath, opts, callback)

Read the version property from the nearest `package.json` along the `targetPath` and then generate a version module file at `targetPath`. A custom path to `package.json` can be specified with `opts.source`.

**Parameters:**

- *targetPath:* string. An absolute or relative file path. Relative to `process.cwd()`.
- *opts:* optional options. Available keys are:
  - *source:* optional string. An absolute or relative path to a file or directory. Genversion searches for the source package.json along this path. Defaults to the value of `targetPath`.
  - *useSemicolon:* optional boolean. Defaults to `false`.
  - *useDoubleQuotes:* optional boolean. Defaults to `false`.
  - *useEs6Syntax:* optional boolean. Defaults to `false`.
  - *useStrict:* optional boolean. Defaults to `false`.
- *callback:* function (err, version). Parameter *version* is the version string read from `package.json`. Parameter *err* is non-null if `package.json` cannot be found, its version is not a string, or writing the module fails.

**Examples:**

    gv.generate('lib/version.js', function (err, version) {
      if (err) {
        throw err;
      }
      console.log('Sliding into', version, 'like a sledge.');
    });

    gv.generate('src/v.js', { useSemicolon: true }, function (err) {
      if (err) { throw err }
      console.log('Generated version file with a semicolon.')
    })



### genversion.version

The version string of genversion module in [semantic versioning](http://semver.org/) format. Generated with genversion itself, of course.


## Projects using genversion

- [genversion](https://www.npmjs.com/package/genversion)
- [poisson-process](https://www.npmjs.com/package/poisson-process)
- [tapspace](https://www.npmjs.com/package/tapspace)

Do you use genversion in your project? We are happy to mention it in the list. Just hit us with an issue or a pull request.


## Related projects

- [versiony](https://github.com/ciena-blueplanet/versiony) for version increments
- [package-json-versionify](https://github.com/nolanlawson/package-json-versionify) for browserify builds


## For developers

Run test suite:

    $ npm run test

To make release, bump the version in `package.json` and run:

    $ npm run release

### Visual Studio Code integration

To configure VSCode debugger, create a file `.vscode/launch.json` with the following contents:

```
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "skipFiles": [
        "<node_internals>/**"
      ],
      "program": "${workspaceFolder}/bin/genversion.js",
      "args": [
        "--check-only",
        "--es6",
        "--semi",
        "--double",
        "--strict",
        "--verbose",
        "target.js"
      ]
    }
  ]
}
```


## License

[MIT](LICENSE)

## Artwork

Free Creative Commons Attribution CC-BY artwork (c) Genversion, Akseli Palén

![a Sprinkler.js rain](doc/lightfield.png?raw=true "a Sprinkler.js rain")
![genversion social icon](doc/genversion-social-1280x640.png?raw=true "genversion social icon")
![too much](doc/logofield.png?raw=true "too much")

Made with [axelpale/sprinkler](https://github.com/axelpale/sprinkler)
