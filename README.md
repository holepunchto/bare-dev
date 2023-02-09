# @pearjs/dev

Development tooling for :pear:.js.

```sh
Usage: pear-dev [options] [command]

Options:
  -c, --cwd <path>          the path to the working directory (default: process.cwd())
  -q, --quiet               stay silent (default: false)
  -i, --include             print the include path
  -r, --require <module>    require and run a local module
  --cmake-module-path       print the CMake module path
  -h, --help                display help for command

Commands:
  init [options]            initialize a build definition
  configure [options]       configure a build
  build [options]           perform a build
  prebuild [options]        perform a prebuild for the current platform and architecture
  clean [options]           clean build artifacts
  rebuild [options]         clean, configure, and build
  link [options] <entry>    link together a module tree
  bundle [options] <entry>  bundle a module tree to a single module
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
  -p, --platform <name>   the operating system platform to build for (choices: "darwin", "ios", "linux", "android", "win32", default:
                          "darwin")
  --simulator             build for a simulator
  -g, --generator <name>  the build generator to use (choices: "make", "ninja", "xcode")
  -d, --debug             configure a debug build (default: false)
  --sanitize <type>       enable sanitizer (choices: "address")
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
  -p, --platform <name>   the operating system platform to build for (choices: "darwin", "ios", "linux", "android", "win32", default:
                          "darwin")
  --simulator             build for a simulator
  -g, --generator <name>  the build generator to use (choices: "make", "ninja", "xcode")
  -d, --debug             configure a debug build (default: false)
  -s, --sanitize <type>   enable sanitizer (choices: "address")
  -v, --verbose           spill the beans (default: false)
  -h, --help              display help for command
```

```sh
Usage: pear-dev link [options] <entry>

link together a module tree

Arguments:
  entry                the entry point to the module tree

Options:
  -f, --format <name>  the format of the output (choices: "json", "c", default: "json")
  -n, --name <name>    the name of the manifest (default: "manifest")
  --print              write the manifest to stdout (default: true)
  -o, --out <path>     write the manifest to a file
  --indent <n>         number of spaces to use for indents (default: 2)
  -h, --help           display help for command
```

```sh
Usage: pear-dev bundle [options] <entry>

bundle a module tree to a single module

Arguments:
  entry                  the entry point to the module tree

Options:
  -p, --protocol <name>  the protocol to prepend to source URLs (default: "app")
  -f, --format <name>    the format of the output (choices: "js", "c", default: "js")
  -n, --name <name>      the name of the manifest (default: "manifest")
  --print                write the bundle to stdout (default: true)
  -o, --out <path>       write the bundle to a file
  -h, --help             display help for command
```

## License

MIT
