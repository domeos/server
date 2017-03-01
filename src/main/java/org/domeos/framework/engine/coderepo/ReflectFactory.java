package org.domeos.framework.engine.coderepo;

import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.engine.k8s.handler.DeployResourceHandler;
import org.domeos.framework.engine.k8s.util.KubeUtils;
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

    public static DeployResourceHandler createDeployResourceHandler(String className, KubeUtils kubeUtils, Deployment deployment) {
        try {
            Class[] parameter = new Class[]{Deployment.class, KubeUtils.class};
            Constructor constructor = Class.forName(className).getConstructor(parameter);
            Object[] arg = new Object[]{deployment, kubeUtils};
            return (DeployResourceHandler) constructor.newInstance(arg);
        } catch (InstantiationException | IllegalAccessException | ClassNotFoundException | NoSuchMethodException | InvocationTargetException e) {
            logger.warn("get reflect factory error, class name: " + className, ", message: " + e.getMessage());
            return null;
        }
    }

    public static DeployResourceHandler createDeployResourceHandler(String className, KubeUtils kubeUtils, Deployment deployment, String domeosServer) {
        try {
            Class[] parameter = new Class[]{Deployment.class, KubeUtils.class, String.class};
            Constructor constructor = Class.forName(className).getConstructor(parameter);
            Object[] arg = new Object[]{deployment, kubeUtils, domeosServer};
            return (DeployResourceHandler) constructor.newInstance(arg);
        } catch (InstantiationException | IllegalAccessException | ClassNotFoundException | NoSuchMethodException | InvocationTargetException e) {
            logger.warn("get reflect factory error, class name: " + className, ", message: " + e.getMessage());
            return null;
        }
    }

}
