package org.domeos.framework.engine.model;


import com.fasterxml.jackson.annotation.JsonFilter;
import com.fasterxml.jackson.databind.ser.FilterProvider;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.domeos.framework.engine.exception.DaoConvertingException;

import java.util.HashSet;
import java.util.Set;

/**
 * Created by sparkchen on 16/4/4.
 */

@JsonFilter("myFilter")
public class DataModelBase implements IJsonable {
    private static Logger logger = LoggerFactory.getLogger(DataModelBase.class);

    @Override
    public int VERSION_NOW() {
        return 1;
    }

    protected static CustomObjectMapper objectMapper = new CustomObjectMapper();

    private int ver = 1;
    private String fqcn = "";

    protected Set<String> excludeForJSON() {
        return new HashSet<>();
    }

    public String getFqcn() {
        return fqcn;
    }

    public void setFqcn(String fqcn) {
        this.fqcn = fqcn;
    }

    public int getVer() {
        return ver;
    }

    public void setVer(int ver) {
        this.ver = ver;
    }

    public <T extends IJsonable> T fromString(String inputstr) throws DaoConvertingException {
        if (inputstr == null || inputstr.length() == 0) {
            return null;
        }
        try {
            String str = inputstr.replaceAll("\r\n", "\\\\r\\\\n").replaceAll("\n", "\\\\n");
            fqcn = objectMapper.readTree(str).get("fqcn").asText();
            ver = objectMapper.readTree(str).get("ver").asInt();
            Class clazz = Class.forName(fqcn);
            T tmp = (T) clazz.newInstance();
            int versionNow = tmp.VERSION_NOW();
            if (versionNow == ver) {
                return (T) objectMapper.readValue(str, clazz);
            } else {
                return tmp.fromString(str, ver);
            }
        } catch (Exception e) {
            logger.error("Parse Data from JSON failed, str = " + inputstr);
            throw new DaoConvertingException("Parse Data from JSON failed, str = " + inputstr + e.getMessage(), e);
        }
    }

    public <T extends IJsonable> T fromString(String str, int ver) {
        if (str == null || str.length() == 0) {
            return null;
        }
        if (ver == VERSION_NOW()) {
            return fromString(str);
        } else {
            return null;
        }
    }

    public String toString() {
        try {
            ver = VERSION_NOW();
            fqcn = this.getClass().getName();
            SimpleBeanPropertyFilter simpleBeanPropertyFilter = SimpleBeanPropertyFilter.serializeAllExcept(
                    this.excludeForJSON());
            FilterProvider filterProvider = new SimpleFilterProvider().setFailOnUnknownId(false)
                    .addFilter("myFilter", simpleBeanPropertyFilter);
            return objectMapper.writer(filterProvider).writeValueAsString(this);
        } catch (Exception e) {
            logger.error("ObjectMapper to JSON failed for class:" + this.getClass().getName(), e);
            throw new DaoConvertingException("ObjectMapper to JSON failed for class:" + this.getClass().getName() + e.getMessage(), e);
        }
    }
}
