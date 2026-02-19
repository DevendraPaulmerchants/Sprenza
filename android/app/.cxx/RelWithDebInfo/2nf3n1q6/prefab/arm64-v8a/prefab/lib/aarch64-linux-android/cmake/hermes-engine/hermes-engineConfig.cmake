if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "/Users/kuberjha/.gradle/caches/8.13/transforms/0e8d451b5f05983379ae1a9ac8381e9f/transformed/jetified-hermes-android-0.14.0-release/prefab/modules/hermesvm/libs/android.arm64-v8a/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/kuberjha/.gradle/caches/8.13/transforms/0e8d451b5f05983379ae1a9ac8381e9f/transformed/jetified-hermes-android-0.14.0-release/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

