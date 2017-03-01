package org.domeos.framework.engine.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import org.springframework.stereotype.Component;

/**
 * Created by KaiRen on 2016/11/24.
 */
@Component("yamlObjectMapper")
public class CustomYamlObjectMapper extends ObjectMapper {
    public CustomYamlObjectMapper() {
        super(new YAMLFactory());
        this.setSerializationInclusion(JsonInclude.Include.NON_EMPTY);
    }
}
