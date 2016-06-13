package org.domeos.client.kubernetesclient.unitstream;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * Created by anningluo on 15-12-3.
 */
public abstract class DefinitionUnitInputStream<T> extends BasicUnitInputStream<T> {
    protected static ObjectMapper objectMapper = initObjectMapper();
    private static ObjectMapper initObjectMapper() {
        ObjectMapper tmpObjectMapper = new ObjectMapper();
        tmpObjectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        tmpObjectMapper.setSerializationInclusion(JsonInclude.Include.NON_DEFAULT);
        // tmpObjectMapper.configure(SerializationFeature.WRITE_NULL_MAP_VALUES, false);
        return tmpObjectMapper;
    }

    @Override
    protected T formatOutput(ByteArrayOutputStream stream) throws IOException {
        return objectMapper.readValue(stream.toByteArray(), getDefinitionClass());
    }

    protected abstract Class<T> getDefinitionClass();
}
