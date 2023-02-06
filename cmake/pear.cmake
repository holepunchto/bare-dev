if(APPLE)
  if(IOS)
    set(PEAR_PLATFORM "ios")
  else()
    set(PEAR_PLATFORM "darwin")
  endif()
elseif(WIN32)
  set(PEAR_PLATFORM "win32")
elseif(CMAKE_SYSTEM_NAME MATCHES "Linux")
  set(PEAR_PLATFORM "linux")
else()
  set(PEAR_PLATFORM "unknown")
endif()

if(CMAKE_SYSTEM_PROCESSOR MATCHES "arm64|aarch64")
  set(PEAR_ARCH "arm64")
elseif(CMAKE_SYSTEM_PROCESSOR MATCHES "x86_64")
  set(PEAR_ARCH "x64")
else()
  set(PEAR_ARCH "unknown")
endif()

set(PEAR_TARGET ${PEAR_PLATFORM}-${PEAR_ARCH})

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
    add_library(${target}_module MODULE)

    set_target_properties(
      ${target}_module
      PROPERTIES
      OUTPUT_NAME ${target}
      PREFIX ""
      SUFFIX ".pear"
    )

    add_debug_options(${target}_module)

    target_link_libraries(
      ${target}_module
      PUBLIC
        $<TARGET_OBJECTS:${target}>
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
      LIBRARY DESTINATION ${PEAR_TARGET}
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
  find_program(pear_dev NAMES pear-dev)

  execute_process(
    COMMAND ${pear_dev} --include
    OUTPUT_VARIABLE pear
    OUTPUT_STRIP_TRAILING_WHITESPACE
  )

  list(APPEND ${result} ${pear})

  execute_process(
    COMMAND ${pear_dev} --require napi-macros --cwd ${CMAKE_SOURCE_DIR}
    OUTPUT_VARIABLE napi_macros
    OUTPUT_STRIP_TRAILING_WHITESPACE
    ERROR_QUIET
  )

  if(napi_macros)
    list(APPEND ${result} ${CMAKE_SOURCE_DIR}/${napi_macros})
  endif()

  return(PROPAGATE ${result})
endfunction()
