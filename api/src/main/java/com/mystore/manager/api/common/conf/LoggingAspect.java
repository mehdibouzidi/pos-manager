package com.mystore.manager.api.common.conf;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Simple aspect that traces application execution with DEBUG logs.
 */
@Aspect
@Component
public class LoggingAspect {

    private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);

    @Pointcut("execution(* com.mystore.manager.api..controller..*(..)) || " +
            "execution(* com.mystore.manager.api..service..*(..)) || " +
            "execution(* com.mystore.manager.api..repository..*(..))")
    void applicationBeanPointcut() {
        // Pointcut definition
    }

    @Before("applicationBeanPointcut()")
    public void logMethodEntry(JoinPoint joinPoint) {
        if (!logger.isDebugEnabled()) {
            return;
        }
        String declaringType = joinPoint.getSignature().getDeclaringType().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        int argCount = joinPoint.getArgs() == null ? 0 : joinPoint.getArgs().length;
        logger.debug("Entering {}.{}() with {} parameter(s)", declaringType, methodName, argCount);
    }
}
