function(pear_platform result)
  set(platform ${CMAKE_SYSTEM_NAME})

  if(NOT platform)
    set(platform ${CMAKE_HOST_SYSTEM_NAME})
  endif()

  if(platform MATCHES "Darwin")
    set(${result} "darwin")
  elseif(platform MATCHES "iOS")
    set(${result} "ios")
  elseif(platform MATCHES "Linux")
    set(${result} "linux")
  elseif(platform MATCHES "Android")
    set(${result} "android")
  elseif(platform MATCHES "Windows")
    set(${result} "win32")
  else()
    set(${result} "unknown")
  endif()

  return(PROPAGATE ${result})
endfunction()

function(pear_arch result)
  set(arch ${CMAKE_SYSTEM_PROCESSOR})

  if(NOT arch)
    set(arch ${CMAKE_HOST_SYSTEM_PROCESSOR})
  endif()

  if(arch MATCHES "arm64|aarch64")
    set(${result} "arm64")
  elseif(arch MATCHES "armv7-a")
    set(${result} "arm")
  elseif(arch MATCHES "x86_64")
    set(${result} "x64")
  elseif(arch MATCHES "x86|i386|i486|i586|i686")
    set(${result} "ia32")
  else()
    set(${result} "unknown")
  endif()

  return(PROPAGATE ${result})
endfunction()

function(pear_simulator result)
  set(sysroot ${CMAKE_OSX_SYSROOT})

  if(sysroot MATCHES "iPhoneSimulator")
    set(${result} YES)
  else()
    set(${result} NO)
  endif()

  return(PROPAGATE ${result})
endfunction()

function(pear_target result)
  pear_platform(platform)
  pear_arch(arch)
  pear_simulator(simulator)

  set(target ${platform}-${arch})

  if(simulator)
    set(target ${target}-simulator)
  endif()

  set(${result} ${target})

  return(PROPAGATE ${result})
endfunction()

function(add_pear_module target)
  add_library(${target} OBJECT)

  set_target_properties(
    ${target}
    PROPERTIES
    C_STANDARD 99
    POSITION_INDEPENDENT_CODE ON
  )

  pear_include_directories(includes)
  pear_target(destination)

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
      SUFFIX ".pear"

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

    install(
      TARGETS ${target}_module
      LIBRARY
        DESTINATION ${destination}
        COMPONENT addon
        OPTIONAL
    )
  endif()
endfunction()

function(include_pear_module target path)
  if(NOT TARGET ${target})
    add_subdirectory(
      ${CMAKE_SOURCE_DIR}/${path}
      ${path}
      EXCLUDE_FROM_ALL
    )

    target_compile_definitions(
      ${target}
      PUBLIC
        PEAR_MODULE_FILENAME="/${path}"
        NAPI_MODULE_FILENAME="/${path}"
    )
  endif()
endfunction()

function(link_pear_module receiver target path)
  include_pear_module(${target} ${path})

  target_link_libraries(
    ${receiver}
    PUBLIC
      $<TARGET_OBJECTS:${target}>
      $<TARGET_PROPERTY:${target},INTERFACE_LINK_LIBRARIES>
  )
endfunction()

function(pear_include_directories result)
  find_pear_dev(pear_dev)

  execute_process(
    COMMAND ${pear_dev} paths include
    OUTPUT_VARIABLE pear
  )

  list(APPEND ${result} ${pear})

  execute_process(
    COMMAND ${pear_dev} --cwd ${CMAKE_SOURCE_DIR} require napi-macros
    OUTPUT_VARIABLE napi_macros
    OUTPUT_STRIP_TRAILING_WHITESPACE
    ERROR_QUIET
  )

  if(napi_macros)
    list(APPEND ${result} ${CMAKE_SOURCE_DIR}/${napi_macros})
  endif()

  return(PROPAGATE ${result})
endfunction()

function(add_pear_bundle)
  cmake_parse_arguments(
    PARSE_ARGV 0 ARGV "" "CWD;ENTRY;OUT;TARGET;IMPORT_MAP;CONFIG" "DEPENDS"
  )

  if(ARGV_CWD)
    list(APPEND args --cwd ${ARGV_CWD})
  endif()

  if(ARGV_OUT)
    list(APPEND args --out ${ARGV_OUT})
  endif()

  if(ARGV_CONFIG)
    list(APPEND args --config ${ARGV_CONFIG})
  endif()

  if(ARGV_TARGET)
    list(APPEND args --target ${ARGV_TARGET})
  endif()

  if(ARGV_IMPORT_MAP)
    list(APPEND args --import-map ${ARGV_IMPORT_MAP})
  endif()

  list(APPEND args ${ARGV_ENTRY})

  if(ARGV_CWD)
    cmake_path(ABSOLUTE_PATH ARGV_CWD BASE_DIRECTORY ${CMAKE_CURRENT_LIST_DIR})
  else()
    set(ARGV_CWD ${CMAKE_CURRENT_LIST_DIR})
  endif()

  if(ARGV_OUT)
    cmake_path(ABSOLUTE_PATH ARGV_OUT BASE_DIRECTORY ${ARGV_CWD})
  endif()

  find_pear_dev(pear_dev)

  add_custom_command(
    COMMAND ${pear_dev} bundle ${args}
    WORKING_DIRECTORY ${ARGV_CWD}
    OUTPUT ${ARGV_OUT}
    DEPENDS ${ARGV_ENTRY} ${ARGV_DEPENDS}
    VERBATIM
  )
endfunction()

function(mirror_drive)
  cmake_parse_arguments(
    PARSE_ARGV 0 ARGV "" "CWD;SOURCE;DESTINATION;PREFIX" ""
  )

  if(ARGV_CWD)
    list(APPEND args --cwd ${ARGV_CWD})
  endif()

  if(ARGV_PREFIX)
    list(APPEND args --prefix ${ARGV_PREFIX})
  endif()

  list(APPEND args ${ARGV_SOURCE} ${ARGV_DESTINATION})

  if(ARGV_CWD)
    cmake_path(ABSOLUTE_PATH ARGV_CWD BASE_DIRECTORY ${CMAKE_CURRENT_LIST_DIR})
  else()
    set(ARGV_CWD ${CMAKE_CURRENT_LIST_DIR})
  endif()

  find_pear_dev(pear_dev)

  message("-- Mirroring drive ${ARGV_SOURCE} into ${ARGV_DESTINATION}")

  execute_process(
    COMMAND ${pear_dev} drive mirror ${args}
    WORKING_DIRECTORY ${ARGV_CWD}
  )
endfunction()

function(find_pear_dev result)
  find_program(
    ${result}
    NAMES pear-dev
    HINTS ${PROJECT_SOURCE_DIR}/node_modules/.bin
  )

  return(PROPAGATE ${result})
endfunction()
