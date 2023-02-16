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
  elseif(arch MATCHES "x86_64")
    set(${result} "x64")
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

  target_include_directories(
    ${target}
    PRIVATE
      ${includes}
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

    add_debug_options(${target}_module)

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

    pear_target(destination)

    install(
      TARGETS ${target}_module
      LIBRARY DESTINATION ${destination}
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

function(add_debug_options target)
  if(PEAR_ENABLE_ASAN)
    target_compile_options(
      ${target}
      PUBLIC
        -fsanitize=address
        -fno-omit-frame-pointer
    )

    target_link_options(
      ${target}
      PUBLIC
        -fsanitize=address
    )
  endif()
endfunction()

function(pear_include_directories result)
  find_program(pear_dev NAMES pear-dev REQUIRED)

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
