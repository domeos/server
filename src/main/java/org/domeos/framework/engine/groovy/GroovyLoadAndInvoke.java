package org.domeos.framework.engine.groovy;

/**
 * Created by feiliu206363 on 2017/2/23.
 */

import groovy.lang.GroovyClassLoader;
import groovy.lang.GroovyObject;

import java.io.File;
import java.io.IOException;

public class GroovyLoadAndInvoke {
    public static Object loadAndInvokeGroovy(String groovyFileName, String method, Object params)
            throws IOException, IllegalAccessException, InstantiationException {
        GroovyClassLoader loader = new GroovyClassLoader();
        Class groovyClass = loader.parseClass(new File(groovyFileName));
        GroovyObject groovyObject = (GroovyObject) groovyClass.newInstance();
        return groovyObject.invokeMethod(method, params);
    }
}
