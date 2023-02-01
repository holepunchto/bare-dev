function(add_pear_module name)
  add_library(${name} MODULE)

  set_target_properties(
    ${name}
    PROPERTIES
    C_STANDARD 99
    POSITION_INDEPENDENT_CODE ON
    PREFIX ""
    SUFFIX ".pear"
  )

  pear_include_directories(includes)

  target_include_directories(
    ${name}
    PUBLIC
      ${includes}
  )

  add_debug_options(${name})

  if(APPLE)
    target_link_options(
      ${name}
      PUBLIC
        -undefined dynamic_lookup
    )
  endif()
endfunction()

function(bundle_pear_module target path)
  add_subdirectory(
    ${CMAKE_SOURCE_DIR}/${path}
    ${path}
    EXCLUDE_FROM_ALL
  )

  target_compile_definitions(
    ${target}
    PUBLIC
      NAPI_MODULE_FILENAME="/${path}"
  )
endfunction()

function(add_debug_options target)
  if(PEAR_ENABLE_ASAN)
    target_compile_options(
      ${name}
      PUBLIC
        -fsanitize=address
        -fno-omit-frame-pointer
    )

    target_link_options(
      ${name}
      PUBLIC
        -fsanitize=address
    )
  endif()
endfunction()

function(pear_include_directories result)
  execute_process(
    COMMAND pear-dev --include
    OUTPUT_VARIABLE pear
  )

  list(APPEND ${result} ${pear})

  execute_process(
    COMMAND pear-dev --require napi-macros --cwd ${CMAKE_SOURCE_DIR}
    OUTPUT_VARIABLE napi_macros
    ERROR_QUIET
  )

  if(napi_macros)
    list(APPEND ${result} ${napi_macros})
  endif()

  return(PROPAGATE ${result})
endfunction()
