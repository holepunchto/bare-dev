#ifndef BARE_H
#define BARE_H

#ifdef __cplusplus
extern "C" {
#endif

#include <node_api.h>

#define BARE_MODULE(id, fn) \
  napi_value napi_register_module_v1(napi_env env, napi_value exports) { \
    return fn(env, exports); \
  }

#ifdef __cplusplus
}
#endif

#endif // BARE_H
