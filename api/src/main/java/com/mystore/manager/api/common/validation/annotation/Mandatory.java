package com.mystore.manager.api.common.validation.annotation;



import com.mystore.manager.api.common.validation.constraint.MandatoryValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.*;

@Target({ METHOD, FIELD, ANNOTATION_TYPE, PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = { MandatoryValidator.class })
public @interface Mandatory {
    String message() default "ERR_CLI_MANDATORY_FIELD";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
