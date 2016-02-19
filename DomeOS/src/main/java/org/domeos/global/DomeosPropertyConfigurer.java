package org.domeos.global;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.config.PropertyPlaceholderConfigurer;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Created by zhenfengchen on 15-12-7.
 * read in config from domeos.properties, so we can access these value in java program
 */

public class DomeosPropertyConfigurer extends PropertyPlaceholderConfigurer {
    private static Map<String, Object> domeosPropertiesMap;

    @Override
    protected void processProperties(
        ConfigurableListableBeanFactory beanFactoryToProcess,
        Properties props) throws BeansException {
        super.processProperties(beanFactoryToProcess, props);
        domeosPropertiesMap = new HashMap<>();
        for (Object key : props.keySet()) {
            String keyStr = key.toString();
            String value = props.getProperty(keyStr);
            domeosPropertiesMap.put(keyStr, value);
        }
    }

    public static Object getDomeosProperty(String name) {
        return domeosPropertiesMap.get(name);
    }
}
