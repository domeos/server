package org.domeos.client.kubernetesclient.util;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Created by xupeng on 16-6-21.
 */
public class ObjectMapperManager {
    private static ObjectMapper objectMapper = initObjectMapper();

    private ObjectMapperManager() {
    }

    private static ObjectMapper initObjectMapper() {
        ObjectMapper tmpObjectMapper = new ObjectMapper();
        tmpObjectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        tmpObjectMapper.setSerializationInclusion(JsonInclude.Include.NON_DEFAULT);
        tmpObjectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        // tmpObjectMapper.configure(SerializationFeature.WRITE_NULL_MAP_VALUES, false);
        return tmpObjectMapper;
    }

    public static ObjectMapper getObjectMapper() {
        return objectMapper;
    }
}