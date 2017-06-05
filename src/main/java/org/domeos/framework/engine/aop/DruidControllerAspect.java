package org.domeos.framework.engine.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

/**
 * Created by feiliu206363 on 2017/5/25.
 */
@Aspect
@Component("druidControllerAspect")
public class DruidControllerAspect {
    @Around("execution(* org.domeos.framework.api.service..*Service.*(..))")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        return point.proceed();
    }
}
