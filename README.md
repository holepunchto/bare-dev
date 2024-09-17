# bare-dev

Development tooling for Bare.

## Install

```sh
npm install -g bare-dev
```

## Usage

Run command `bare-dev --help`

```sh
bare-dev [options] [command]

Options:
  -V, --version                   output the version number
  -c, --cwd <path>                the path to the working directory
  -q, --quiet                     stay silent (default: false)
  --verbose                       spill the beans (default: false)
  -h, --help                      display help for command

Commands:
  paths <path>                    print paths
  vendor                          manage vendored dependencies
  drive [options]                 manage drives
  init                            initialize templates
  configure [options]             configure a build
  build [options]                 perform a build
  install [options]               perform a clean build unless prebuilds are available
  clean [options]                 clean build artifacts
  test [options]                  build and run tests
  bundle [options] <entry>        bundle a module tree
  dependencies [options] <entry>  compute the dependencies of module tree
  ios                             manage iOS
  android [options]               manage Android
  help [command]                  display help for command
```

## License

Apache-2.0
