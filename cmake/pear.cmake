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

  pear_include_directories(PEAR_INCLUDE)

  target_include_directories(
    ${name}
    PUBLIC
      ${PEAR_INCLUDE}
  )

  if(APPLE)
    target_link_options(
      ${name}
      PUBLIC
        -undefined dynamic_lookup
    )
  endif()
endfunction()

function(pear_include_directories result)
  execute_process(
    COMMAND pearjs-dev --include
    OUTPUT_VARIABLE PEAR_INCLUDE
  )

  execute_process(
    COMMAND pearjs-dev --require napi-macros --cwd ${CMAKE_SOURCE_DIR}
    OUTPUT_VARIABLE NAPI_MACROS_INCLUDE
  )

  list(APPEND ${result}
    ${PEAR_INCLUDE}
    ${NAPI_MACROS_INCLUDE}
  )

  return(PROPAGATE ${result})
endfunction()
