package org.domeos.framework.engine.aop;

import com.alibaba.druid.support.spring.stat.DruidStatInterceptor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Created by feiliu206363 on 2017/5/25.
 */
@Aspect
@Component("druidMapperAspect")
public class DruidMapperAspect extends DruidStatInterceptor {
    private static Logger logger = LoggerFactory.getLogger(DruidMapperAspect.class);

    @Around("execution(* org.domeos.framework.api.mapper.*..*Mapper.*(..))")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        return point.proceed();
    }
}
