package org.domeos.framework.engine.model;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ser.FilterProvider;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/**
 * Created by sparkchen on 16/4/7.
 */
@Component("objectMapper")
public class ModelObjectMapper extends ObjectMapper {
    public ModelObjectMapper() {
        super();
        Set<String> excluded = new HashSet<String>() {{
            add("ver");
            add("fqcn");
        }};
        SimpleBeanPropertyFilter simpleBeanPropertyFilter = SimpleBeanPropertyFilter.serializeAllExcept(excluded);
        FilterProvider filterProvider = new SimpleFilterProvider().setFailOnUnknownId(false)
                .addFilter("myFilter", simpleBeanPropertyFilter);
        this.setFilters(filterProvider);
        this.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
//        this.setSerializationInclusion(JsonInclude.Include.NON_EMPTY);
    }
}
