package org.domeos.client.kubernetesclient.unitstream;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.domeos.client.kubernetesclient.util.ObjectMapperManager;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * Created by anningluo on 15-12-3.
 */
public abstract class DefinitionUnitInputStream<T> extends BasicUnitInputStream<T> {
    protected static ObjectMapper objectMapper = ObjectMapperManager.getObjectMapper();

    @Override
    protected T formatOutput(ByteArrayOutputStream stream) throws IOException {
        return objectMapper.readValue(stream.toByteArray(), getDefinitionClass());
    }

    protected abstract Class<T> getDefinitionClass();
}
