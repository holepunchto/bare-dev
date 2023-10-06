function(bare_platform result)
  set(platform ${CMAKE_SYSTEM_NAME})

  if(NOT platform)
    set(platform ${CMAKE_HOST_SYSTEM_NAME})
  endif()

  string(TOLOWER ${platform} platform)

  if(platform MATCHES "darwin|ios|linux|android")
    set(${result} ${platform})
  elseif(platform MATCHES "windows")
    set(${result} "win32")
  else()
    set(${result} "unknown")
  endif()

  return(PROPAGATE ${result})
endfunction()

function(bare_arch result)
  if(APPLE AND CMAKE_OSX_ARCHITECTURES)
    set(arch ${CMAKE_OSX_ARCHITECTURES})
  elseif(MSVC AND CMAKE_GENERATOR_PLATFORM)
    set(arch ${CMAKE_GENERATOR_PLATFORM})
  else()
    set(arch ${CMAKE_SYSTEM_PROCESSOR})
  endif()

  if(NOT arch)
    set(arch ${CMAKE_HOST_SYSTEM_PROCESSOR})
  endif()

  string(TOLOWER ${arch} arch)

  if(arch MATCHES "arm64|aarch64")
    set(${result} "arm64")
  elseif(arch MATCHES "armv7-a")
    set(${result} "arm")
  elseif(arch MATCHES "x86_64|amd64")
    set(${result} "x64")
  elseif(arch MATCHES "x86|i386|i486|i586|i686")
    set(${result} "ia32")
  else()
    set(${result} "unknown")
  endif()

  return(PROPAGATE ${result})
endfunction()

function(bare_simulator result)
  set(sysroot ${CMAKE_OSX_SYSROOT})

  if(sysroot MATCHES "iPhoneSimulator")
    set(${result} YES)
  else()
    set(${result} NO)
  endif()

  return(PROPAGATE ${result})
endfunction()

function(bare_target result)
  bare_platform(platform)
  bare_arch(arch)
  bare_simulator(simulator)

  set(target ${platform}-${arch})

  if(simulator)
    set(target ${target}-simulator)
  endif()

  set(${result} ${target})

  return(PROPAGATE ${result})
endfunction()

function(add_bare_module target)
  add_library(${target} OBJECT)

  set_target_properties(
    ${target}
    PROPERTIES
    C_STANDARD 99
    CXX_STANDARD 17
    POSITION_INDEPENDENT_CODE ON
  )

  bare_include_directories(includes)
  bare_target(destination)

  target_include_directories(
    ${target}
    PRIVATE
      ${includes}
  )

  add_library(${target}_static STATIC $<TARGET_OBJECTS:${target}>)

  set_target_properties(
    ${target}_static
    PROPERTIES
    OUTPUT_NAME ${target}
    PREFIX ""

    # Don't build the static target unless explicitly dependend on or requested.
    EXCLUDE_FROM_ALL ON

    # Ensure that modules are placed in the root of the build tree where
    # process.addon() can find them.
    ARCHIVE_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}"
  )

  target_link_libraries(
    ${target}_static
    PUBLIC
      $<TARGET_PROPERTY:${target},INTERFACE_LINK_LIBRARIES>
  )

  install(
    TARGETS ${target}_static
    ARCHIVE
      DESTINATION ${destination}
      COMPONENT addon
      OPTIONAL
  )

  if(NOT IOS)
    add_library(${target}_module MODULE $<TARGET_OBJECTS:${target}>)

    set_target_properties(
      ${target}_module
      PROPERTIES
      OUTPUT_NAME ${target}
      PREFIX ""
      SUFFIX ".bare"

      # Ensure that modules are placed in the root of the build tree where
      # process.addon() can find them.
      LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}"
    )

    target_link_libraries(
      ${target}_module
      PUBLIC
        $<TARGET_PROPERTY:${target},INTERFACE_LINK_LIBRARIES>
    )

    if(APPLE)
      target_link_options(
        ${target}_module
        PUBLIC
          -undefined dynamic_lookup
      )

      if(CMAKE_HOST_SYSTEM_VERSION VERSION_GREATER_EQUAL 21)
        target_link_options(
          ${target}_module
          PUBLIC
            -Xlinker -no_fixup_chains
        )
      endif()
    endif()

    if(MSVC)
      target_link_options(
        ${target}_module
        PUBLIC
          /FORCE
      )
    endif()

    install(
      TARGETS ${target}_module
      LIBRARY
        DESTINATION ${destination}
        COMPONENT addon
        OPTIONAL
    )
  endif()
endfunction()

function(include_bare_module target path)
  if(NOT TARGET ${target})
    bare_module_directory(root)

    add_subdirectory(
      ${root}/${path}
      ${path}
      EXCLUDE_FROM_ALL
    )

    target_compile_definitions(
      ${target}
      PUBLIC
        BARE_MODULE_FILENAME="/${path}"
        NAPI_MODULE_FILENAME="/${path}"
    )
  endif()
endfunction()

function(link_bare_module receiver target path)
  include_bare_module(${target} ${path})

  target_link_libraries(
    ${receiver}
    PUBLIC
      $<TARGET_OBJECTS:${target}>
      $<TARGET_PROPERTY:${target},INTERFACE_LINK_LIBRARIES>
  )
endfunction()

function(bare_include_directories result)
  find_bare_dev(bare_dev)

  execute_process(
    COMMAND ${bare_dev} paths include
    OUTPUT_VARIABLE bare
  )

  list(APPEND ${result} ${bare})

  bare_module_directory(root)

  execute_process(
    COMMAND ${bare_dev} --cwd ${root} require napi-macros
    OUTPUT_VARIABLE napi_macros
    OUTPUT_STRIP_TRAILING_WHITESPACE
    ERROR_QUIET
  )

  if(napi_macros)
    list(APPEND ${result} ${CMAKE_SOURCE_DIR}/${napi_macros})
  endif()

  return(PROPAGATE ${result})
endfunction()

function(bare_module_directory result)
  set(
    BARE_MODULE_DIR
    ${CMAKE_SOURCE_DIR}
    CACHE PATH
    "The path that contains the root node_modules directory"
  )

  cmake_path(NATIVE_PATH BARE_MODULE_DIR NORMALIZE ${result})

  return(PROPAGATE ${result})
endfunction()

function(add_bare_bundle)
  cmake_parse_arguments(
    PARSE_ARGV 0 ARGV "" "CWD;ENTRY;OUT;TARGET;IMPORT_MAP;NODE_MODULES;CONFIG" "DEPENDS"
  )

  if(ARGV_CWD)
    cmake_path(ABSOLUTE_PATH ARGV_CWD BASE_DIRECTORY ${CMAKE_CURRENT_LIST_DIR})
  else()
    set(ARGV_CWD ${CMAKE_CURRENT_LIST_DIR})
  endif()

  list(APPEND args --cwd ${ARGV_CWD})

  if(ARGV_CONFIG)
    cmake_path(ABSOLUTE_PATH ARGV_CONFIG BASE_DIRECTORY ${ARGV_CWD})

    list(APPEND args --config ${ARGV_CONFIG})
  endif()

  if(ARGV_TARGET)
    list(APPEND args --target ${ARGV_TARGET})
  endif()

  if(ARGV_IMPORT_MAP)
    cmake_path(ABSOLUTE_PATH ARGV_IMPORT_MAP BASE_DIRECTORY ${ARGV_CWD})

    list(APPEND args --import-map ${ARGV_IMPORT_MAP})
  endif()

  if(ARGV_OUT)
    cmake_path(ABSOLUTE_PATH ARGV_OUT BASE_DIRECTORY ${ARGV_CWD})

    list(APPEND args --out ${ARGV_OUT})
  endif()

  if(ARGV_NODE_MODULES)
    cmake_path(ABSOLUTE_PATH ARGV_NODE_MODULES BASE_DIRECTORY ${ARGV_CWD})

    list(APPEND args --node-modules ${ARGV_NODE_MODULES})
  else()
    bare_module_directory(root)

    list(APPEND args --node-modules ${root}/node_modules)
  endif()

  cmake_path(ABSOLUTE_PATH ARGV_ENTRY BASE_DIRECTORY ${ARGV_CWD})

  list(APPEND args ${ARGV_ENTRY})

  find_bare_dev(bare_dev)

  add_custom_command(
    COMMAND ${bare_dev} bundle ${args}
    WORKING_DIRECTORY ${ARGV_CWD}
    OUTPUT ${ARGV_OUT}
    DEPENDS
      ${ARGV_ENTRY}
      ${ARGV_CONFIG}
      ${ARGV_IMPORT_MAP}
      ${ARGV_NODE_MODULES}
      ${ARGV_DEPENDS}
    VERBATIM
  )
endfunction()

function(mirror_drive)
  cmake_parse_arguments(
    PARSE_ARGV 0 ARGV "" "CWD;SOURCE;DESTINATION;PREFIX;CHECKOUT" ""
  )

  if(ARGV_CWD)
    list(APPEND args --cwd ${ARGV_CWD})
  endif()

  if(ARGV_PREFIX)
    list(APPEND args --prefix ${ARGV_PREFIX})
  endif()

  if(ARGV_CHECKOUT)
    list(APPEND args --checkout ${ARGV_CHECKOUT})
  endif()

  list(APPEND args ${ARGV_SOURCE} ${ARGV_DESTINATION})

  if(ARGV_CWD)
    cmake_path(ABSOLUTE_PATH ARGV_CWD BASE_DIRECTORY ${CMAKE_CURRENT_LIST_DIR})
  else()
    set(ARGV_CWD ${CMAKE_CURRENT_LIST_DIR})
  endif()

  find_bare_dev(bare_dev)

  message(STATUS "Mirroring drive ${ARGV_SOURCE} into ${ARGV_DESTINATION}")

  execute_process(
    COMMAND ${bare_dev} drive mirror ${args}
    WORKING_DIRECTORY ${ARGV_CWD}
  )
endfunction()

function(find_bare_dev result)
  bare_module_directory(root)

  if(WIN32)
    find_program(
      bare_dev
      NAMES bare-dev.cmd
      HINTS ${root}/node_modules/.bin
    )
  else()
    find_program(
      bare_dev
      NAMES bare-dev
      HINTS ${root}/node_modules/.bin
    )
  endif()

  set(${result} ${bare_dev})

  return(PROPAGATE ${result})
endfunction()

function(add_bare_dependencies)
  find_bare_dev(bare_dev)

  execute_process(
    COMMAND ${bare_dev} paths include
    OUTPUT_VARIABLE bare
  )

  if(NOT TARGET bare)
    add_library(bare INTERFACE IMPORTED)

    target_include_directories(
      bare
      INTERFACE
        ${bare}
    )
  endif()

  if(NOT TARGET uv)
    add_library(uv INTERFACE IMPORTED)

    target_include_directories(
      uv
      INTERFACE
        ${bare}
    )
  endif()

  if(NOT TARGET js)
    add_library(js INTERFACE IMPORTED)

    target_include_directories(
      js
      INTERFACE
        ${bare}
    )
  endif()

  if(NOT TARGET utf)
    add_library(utf INTERFACE IMPORTED)

    target_include_directories(
      utf
      INTERFACE
        ${bare}
    )
  endif()
endfunction()
