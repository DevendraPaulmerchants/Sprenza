if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "/Users/kuberjha/.gradle/caches/8.13/transforms/018b8854034d9fb5ccdb5083f6ef7ec4/transformed/jetified-hermes-android-0.14.0-debug/prefab/modules/hermesvm/libs/android.arm64-v8a/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/kuberjha/.gradle/caches/8.13/transforms/018b8854034d9fb5ccdb5083f6ef7ec4/transformed/jetified-hermes-android-0.14.0-debug/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

