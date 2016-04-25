package org.domeos.framework.engine.aop;

import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by xupeng on 16-4-5.
 */
@Aspect
public class LoggerAspect {

    private static Logger logger = LoggerFactory.getLogger(LoggerAspect.class);

//    @Pointcut("execution(* org.domeos.framework.api.controller..*.*(..))")
//    private void controller() {}

//    @AfterReturning(value = "controller()", returning = "ret")
//    public void succeed(JoinPoint jp, HttpResponseTemp<?> ret) {
//        User user = AuthUtil.getUser();
//        logger.error("succeed, return:" + ret.getResultCode());
//    }

//    @AfterThrowing(value = "controller()", throwing = "ex")
//    public void failed(JoinPoint jp, Throwable ex) {
//        User user = AuthUtil.getUser();
//        logger.error("Exceptions:" + ex.getMessage());
//    }
}
