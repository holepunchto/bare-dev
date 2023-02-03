# @pearjs/dev

Development tooling for :pear:.js.

```sh
Usage: pear-dev [options] [command]

Options:
  -c, --cwd <path>        the path to the working directory (default: process.cwd())
  -q, --quiet             stay silent (default: false)
  -i, --include           print the include path
  -r, --require <module>  require and run a local module
  --cmake-module-path     print the CMake module path
  -h, --help              display help for command

Commands:
  init [options]          initialize a build definition
  configure [options]     configure a build
  build [options]         perform a build
  prebuild [options]      perform a prebuild for the current platform and architecture
  clean [options]         clean build artifacts
  rebuild [options]       clean, configure, and build
```

```sh
Usage: pear-dev init [options]

initialize a build definition

Options:
  -f, --force  overwrite any existing build definition (default: false)
  -h, --help   display help for command
```

```sh
Usage: pear-dev configure [options]

configure a build

Options:
  -s, --source            the path to the source tree
  -b, --build             the path to the build tree
  -g, --generator <name>  the build generator to use
  -d, --debug             configure a debug build (default: false)
  -s, --sanitize          enable sanitizer (choices: "address")
  -h, --help              display help for command
```

```sh
Usage: pear-dev build [options]

perform a build

Options:
  -b, --build          the path to the build tree
  -t, --target <name>  the target to build
  -v, --verbose        spill the beans (default: false)
  -h, --help           display help for command
```

```sh
Usage: pear-dev prebuild [options]

perform a prebuild for the current platform and architecture

Options:
  -b, --build      the path to the build tree
  -p, --prebuilds  the path to the prebuilds directory
  -v, --verbose    spill the beans (default: false)
  -h, --help       display help for command
```

```sh
Usage: pear-dev clean [options]

clean build artifacts

Options:
  -b, --build    the path to the build tree
  -v, --verbose  spill the beans (default: false)
  -h, --help     display help for command
```

```sh
Usage: pear-dev rebuild [options]

clean, configure, and build

Options:
  -s, --source            the path to the source tree
  -b, --build             the path to the build tree
  -t, --target <name>     the target to build
  -g, --generator <name>  the build generator to use
  -d, --debug             configure a debug build (default: false)
  -s, --sanitize          enable sanitizer (choices: "address")
  -v, --verbose           spill the beans (default: false)
  -h, --help              display help for command
```

## License

MIT
