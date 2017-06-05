package org.domeos.framework.engine.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

/**
 * Created by feiliu206363 on 2016/4/18.
 */
@Component
public class CustomObjectMapper extends ObjectMapper {
    public CustomObjectMapper() {
        super();
        this.setSerializationInclusion(JsonInclude.Include.NON_EMPTY);
        this.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }
}
