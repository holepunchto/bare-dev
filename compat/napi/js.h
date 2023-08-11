#ifndef JS_H
#define JS_H

#ifdef __cplusplus
extern "C" {
#endif

#include <node_api.h>
#include <stdarg.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <utf.h>
#include <uv.h>

typedef struct napi_env__ js_env_t;
typedef struct napi_handle_scope__ js_handle_scope_t;
typedef struct napi_escapable_handle_scope__ js_escapable_handle_scope_t;
typedef struct napi_value__ js_value_t;
typedef struct napi_ref__ js_ref_t;
typedef struct napi_deferred__ js_deferred_t;
typedef struct napi_callback_info__ js_callback_info_t;

typedef struct js_property_descriptor_s js_property_descriptor_t;

typedef js_value_t *(*js_function_cb)(js_env_t *, js_callback_info_t *);
typedef void (*js_finalize_cb)(js_env_t *, void *data, void *finalize_hint);

typedef enum {
  js_undefined,
  js_null,
  js_boolean,
  js_number,
  js_string,
  js_symbol,
  js_object,
  js_function,
  js_external,
  js_bigint,
} js_value_type_t;

typedef enum {
  js_int8_array,
  js_uint8_array,
  js_uint8_clamped_array,
  js_int16_array,
  js_uint16_array,
  js_int32_array,
  js_uint32_array,
  js_float32_array,
  js_float64_array,
  js_bigint64_array,
  js_biguint64_array,
} js_typedarray_type_t;

enum {
  js_writable = 1,
  js_enumerable = 1 << 1,
  js_configurable = 1 << 2,
  js_static = 1 << 10,
};

struct js_property_descriptor_s {
  const char *name;
  void *data;
  int attributes;

  // One of:

  // Method
  js_function_cb method;

  // Accessor
  js_function_cb getter;
  js_function_cb setter;

  // Value
  js_value_t *value;
};

static inline int
js_get_env_loop (js_env_t *env, uv_loop_t **result) {
  napi_status status = napi_get_uv_event_loop(env, result);

  return status == napi_ok ? 0 : -1;
}

static inline int
js_open_handle_scope (js_env_t *env, js_handle_scope_t **result) {
  napi_status status = napi_open_handle_scope(env, result);

  return status == napi_ok ? 0 : -1;
}

static inline int
js_close_handle_scope (js_env_t *env, js_handle_scope_t *scope) {
  napi_status status = napi_close_handle_scope(env, scope);

  return status == napi_ok ? 0 : -1;
}

static inline int
js_open_escapable_handle_scope (js_env_t *env, js_escapable_handle_scope_t **result) {
  napi_status status = napi_open_escapable_handle_scope(env, result);

  return status == napi_ok ? 0 : -1;
}

static inline int
js_close_escapable_handle_scope (js_env_t *env, js_escapable_handle_scope_t *scope) {
  napi_status status = napi_close_escapable_handle_scope(env, scope);

  return status == napi_ok ? 0 : -1;
}

static inline int
js_escape_handle (js_env_t *env, js_escapable_handle_scope_t *scope, js_value_t *escapee, js_value_t **result) {
  napi_status status = napi_escape_handle(env, scope, escapee, result);

  return status == napi_ok ? 0 : -1;
}

static inline int
js_run_script (js_env_t *env, const char *file, size_t len, int offset, js_value_t *source, js_value_t **result) {
  napi_status status = napi_run_script(env, source, result);

  return status == napi_ok ? 0 : -1;
}

static inline int
js_create_reference (js_env_t *env, js_value_t *value, uint32_t count, js_ref_t **result) {
  napi_status status = napi_create_reference(env, value, count, result);

  return status == napi_ok ? 0 : -1;
}

static inline int
js_delete_reference (js_env_t *env, js_ref_t *reference) {
  napi_status status = napi_delete_reference(env, reference);

  return status == napi_ok ? 0 : -1;
}

static inline int
js_reference_ref (js_env_t *env, js_ref_t *reference, uint32_t *result) {
  napi_status status = napi_reference_ref(env, reference, result);

  return status == napi_ok ? 0 : -1;
}

static inline int
js_reference_unref (js_env_t *env, js_ref_t *reference, uint32_t *result) {
  napi_status status = napi_reference_unref(env, reference, result);

  return status == napi_ok ? 0 : -1;
}

static inline int
js_get_reference_value (js_env_t *env, js_ref_t *reference, js_value_t **result) {
  napi_status status = napi_get_reference_value(env, reference, result);

  return status == napi_ok ? 0 : -1;
}

int
js_define_class (js_env_t *env, const char *name, size_t len, js_function_cb constructor, void *data, js_property_descriptor_t const properties[], size_t properties_len, js_value_t **result);

int
js_define_properties (js_env_t *env, js_value_t *object, js_property_descriptor_t const properties[], size_t properties_len);

int
js_wrap (js_env_t *env, js_value_t *object, void *data, js_finalize_cb finalize_cb, void *finalize_hint, js_ref_t **result);

int
js_unwrap (js_env_t *env, js_value_t *object, void **result);

int
js_remove_wrap (js_env_t *env, js_value_t *object, void **result);

int
js_add_finalizer (js_env_t *env, js_value_t *object, void *data, js_finalize_cb finalize_cb, void *finalize_hint, js_ref_t **result);

int
js_create_int32 (js_env_t *env, int32_t value, js_value_t **result);

int
js_create_uint32 (js_env_t *env, uint32_t value, js_value_t **result);

int
js_create_int64 (js_env_t *env, int64_t value, js_value_t **result);

int
js_create_double (js_env_t *env, double value, js_value_t **result);

int
js_create_bigint_int64 (js_env_t *env, int64_t value, js_value_t **result);

int
js_create_bigint_uint64 (js_env_t *env, uint64_t value, js_value_t **result);

static inline int
js_create_string_utf8 (js_env_t *env, const utf8_t *str, size_t len, js_value_t **result) {
  napi_status status = napi_create_string_utf8(env, str, len, result);

  return status == napi_ok ? 0 : -1;
}

static inline int
js_create_string_utf16le (js_env_t *env, const utf16_t *str, size_t len, js_value_t **result) {
  napi_status status = napi_create_string_utf16(env, str, len, result);

  return status == napi_ok ? 0 : -1;
}

int
js_create_symbol (js_env_t *env, js_value_t *description, js_value_t **result);

int
js_create_object (js_env_t *env, js_value_t **result);

int
js_create_function (js_env_t *env, const char *name, size_t len, js_function_cb cb, void *data, js_value_t **result);

int
js_create_function_with_source (js_env_t *env, const char *name, size_t name_len, const char *file, size_t file_len, js_value_t *const args[], size_t args_len, int offset, js_value_t *source, js_value_t **result);

int
js_create_array (js_env_t *env, js_value_t **result);

int
js_create_array_with_length (js_env_t *env, size_t len, js_value_t **result);

int
js_create_external (js_env_t *env, void *data, js_finalize_cb finalize_cb, void *finalize_hint, js_value_t **result);

int
js_create_date (js_env_t *env, double time, js_value_t **result);

int
js_create_error (js_env_t *env, js_value_t *code, js_value_t *message, js_value_t **result);

int
js_create_type_error (js_env_t *env, js_value_t *code, js_value_t *message, js_value_t **result);

int
js_create_range_error (js_env_t *env, js_value_t *code, js_value_t *message, js_value_t **result);

int
js_create_syntax_error (js_env_t *env, js_value_t *code, js_value_t *message, js_value_t **result);

int
js_create_promise (js_env_t *env, js_deferred_t **deferred, js_value_t **promise);

int
js_resolve_deferred (js_env_t *env, js_deferred_t *deferred, js_value_t *resolution);

int
js_reject_deferred (js_env_t *env, js_deferred_t *deferred, js_value_t *resolution);

int
js_create_arraybuffer (js_env_t *env, size_t len, void **data, js_value_t **result);

int
js_create_external_arraybuffer (js_env_t *env, void *data, size_t len, js_finalize_cb finalize_cb, void *finalize_hint, js_value_t **result);

int
js_detach_arraybuffer (js_env_t *env, js_value_t *arraybuffer);

int
js_create_typedarray (js_env_t *env, js_typedarray_type_t type, size_t len, js_value_t *arraybuffer, size_t offset, js_value_t **result);

int
js_create_dataview (js_env_t *env, size_t len, js_value_t *arraybuffer, size_t offset, js_value_t **result);

int
js_typeof (js_env_t *env, js_value_t *value, js_value_type_t *result);

int
js_instanceof (js_env_t *env, js_value_t *object, js_value_t *constructor, bool *result);

int
js_is_undefined (js_env_t *env, js_value_t *value, bool *result);

int
js_is_null (js_env_t *env, js_value_t *value, bool *result);

int
js_is_boolean (js_env_t *env, js_value_t *value, bool *result);

int
js_is_number (js_env_t *env, js_value_t *value, bool *result);

int
js_is_string (js_env_t *env, js_value_t *value, bool *result);

int
js_is_symbol (js_env_t *env, js_value_t *value, bool *result);

int
js_is_object (js_env_t *env, js_value_t *value, bool *result);

int
js_is_function (js_env_t *env, js_value_t *value, bool *result);

int
js_is_array (js_env_t *env, js_value_t *value, bool *result);

int
js_is_external (js_env_t *env, js_value_t *value, bool *result);

int
js_is_bigint (js_env_t *env, js_value_t *value, bool *result);

int
js_is_date (js_env_t *env, js_value_t *value, bool *result);

int
js_is_error (js_env_t *env, js_value_t *value, bool *result);

int
js_is_promise (js_env_t *env, js_value_t *value, bool *result);

int
js_is_arraybuffer (js_env_t *env, js_value_t *value, bool *result);

int
js_is_detached_arraybuffer (js_env_t *env, js_value_t *value, bool *result);

int
js_is_typedarray (js_env_t *env, js_value_t *value, bool *result);

int
js_is_dataview (js_env_t *env, js_value_t *value, bool *result);

int
js_strict_equals (js_env_t *env, js_value_t *a, js_value_t *b, bool *result);

int
js_get_global (js_env_t *env, js_value_t **result);

int
js_get_undefined (js_env_t *env, js_value_t **result);

int
js_get_null (js_env_t *env, js_value_t **result);

int
js_get_boolean (js_env_t *env, bool value, js_value_t **result);

int
js_get_value_bool (js_env_t *env, js_value_t *value, bool *result);

int
js_get_value_int32 (js_env_t *env, js_value_t *value, int32_t *result);

int
js_get_value_uint32 (js_env_t *env, js_value_t *value, uint32_t *result);

int
js_get_value_int64 (js_env_t *env, js_value_t *value, int64_t *result);

int
js_get_value_double (js_env_t *env, js_value_t *value, double *result);

int
js_get_value_bigint_int64 (js_env_t *env, js_value_t *value, int64_t *result);

int
js_get_value_bigint_uint64 (js_env_t *env, js_value_t *value, uint64_t *result);

int
js_get_value_string_utf8 (js_env_t *env, js_value_t *value, utf8_t *str, size_t len, size_t *result);

int
js_get_value_string_utf16le (js_env_t *env, js_value_t *value, utf16_t *str, size_t len, size_t *result);

int
js_get_value_external (js_env_t *env, js_value_t *value, void **result);

int
js_get_value_date (js_env_t *env, js_value_t *value, double *result);

int
js_get_array_length (js_env_t *env, js_value_t *value, uint32_t *result);

int
js_get_prototype (js_env_t *env, js_value_t *object, js_value_t **result);

int
js_get_property (js_env_t *env, js_value_t *object, js_value_t *key, js_value_t **result);

int
js_has_property (js_env_t *env, js_value_t *object, js_value_t *key, bool *result);

int
js_set_property (js_env_t *env, js_value_t *object, js_value_t *key, js_value_t *value);

int
js_delete_property (js_env_t *env, js_value_t *object, js_value_t *key, bool *result);

int
js_get_named_property (js_env_t *env, js_value_t *object, const char *name, js_value_t **result);

int
js_has_named_property (js_env_t *env, js_value_t *object, const char *name, bool *result);

int
js_set_named_property (js_env_t *env, js_value_t *object, const char *name, js_value_t *value);

int
js_delete_named_property (js_env_t *env, js_value_t *object, const char *name, bool *result);

int
js_get_element (js_env_t *env, js_value_t *object, uint32_t index, js_value_t **result);

int
js_has_element (js_env_t *env, js_value_t *object, uint32_t index, bool *result);

int
js_set_element (js_env_t *env, js_value_t *object, uint32_t index, js_value_t *value);

int
js_delete_element (js_env_t *env, js_value_t *object, uint32_t index, bool *result);

int
js_get_callback_info (js_env_t *env, const js_callback_info_t *info, size_t *argc, js_value_t *argv[], js_value_t **receiver, void **data);

int
js_get_new_target (js_env_t *env, const js_callback_info_t *info, js_value_t **result);

int
js_get_arraybuffer_info (js_env_t *env, js_value_t *arraybuffer, void **data, size_t *len);

int
js_get_typedarray_info (js_env_t *env, js_value_t *typedarray, js_typedarray_type_t *type, void **data, size_t *len, js_value_t **arraybuffer, size_t *offset);

int
js_get_dataview_info (js_env_t *env, js_value_t *dataview, void **data, size_t *len, js_value_t **arraybuffer, size_t *offset);

int
js_call_function (js_env_t *env, js_value_t *receiver, js_value_t *function, size_t argc, js_value_t *const argv[], js_value_t **result);

int
js_new_instance (js_env_t *env, js_value_t *constructor, size_t argc, js_value_t *const argv[], js_value_t **result);

int
js_throw (js_env_t *env, js_value_t *error);

int
js_throw_error (js_env_t *env, const char *code, const char *message);

int
js_throw_verrorf (js_env_t *env, const char *code, const char *message, va_list args);

static inline int
js_throw_errorf (js_env_t *env, const char *code, const char *message, ...) {
  va_list args;
  va_start(args, message);

  int err = js_throw_verrorf(env, code, message, args);

  va_end(args);

  return err;
}

int
js_throw_type_error (js_env_t *env, const char *code, const char *message);

int
js_throw_type_verrorf (js_env_t *env, const char *code, const char *message, va_list args);

static inline int
js_throw_type_errorf (js_env_t *env, const char *code, const char *message, ...) {
  va_list args;
  va_start(args, message);

  int err = js_throw_type_verrorf(env, code, message, args);

  va_end(args);

  return err;
}

int
js_throw_range_error (js_env_t *env, const char *code, const char *message);

int
js_throw_range_verrorf (js_env_t *env, const char *code, const char *message, va_list args);

static inline int
js_throw_range_errorf (js_env_t *env, const char *code, const char *message, ...) {
  va_list args;
  va_start(args, message);

  int err = js_throw_range_verrorf(env, code, message, args);

  va_end(args);

  return err;
}

int
js_throw_syntax_error (js_env_t *env, const char *code, const char *message);

int
js_throw_syntax_verrorf (js_env_t *env, const char *code, const char *message, va_list args);

static inline int
js_throw_syntax_errorf (js_env_t *env, const char *code, const char *message, ...) {
  va_list args;
  va_start(args, message);

  int err = js_throw_syntax_verrorf(env, code, message, args);

  va_end(args);

  return err;
}

int
js_is_exception_pending (js_env_t *env, bool *result);

int
js_get_and_clear_last_exception (js_env_t *env, js_value_t **result);

int
js_fatal_exception (js_env_t *env, js_value_t *error);

int
js_adjust_external_memory (js_env_t *env, int64_t change_in_bytes, int64_t *result);

#ifdef __cplusplus
}
#endif

#endif // JS_H
