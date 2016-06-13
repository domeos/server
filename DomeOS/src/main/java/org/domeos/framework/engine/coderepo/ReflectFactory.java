package org.domeos.framework.engine.coderepo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;

/**
 * Created by feiliu206363 on 2015/12/10.
 */
public class ReflectFactory {
    private static Logger logger = LoggerFactory.getLogger(ReflectFactory.class);
    public static CodeApiInterface createCodeApiInterface(String className, int id) {
        try {
            Class[] parameter = new Class[]{int.class};
            Constructor constructor = Class.forName(className).getConstructor(parameter);
            Object[] arg = new Object[]{id};
            return (CodeApiInterface) constructor.newInstance(arg);
        } catch (InstantiationException | IllegalAccessException | ClassNotFoundException | NoSuchMethodException | InvocationTargetException e) {
            logger.warn("get reflect factory error, class name: " + className, ", message: " + e.getMessage());
            return null;
        }
    }
}
