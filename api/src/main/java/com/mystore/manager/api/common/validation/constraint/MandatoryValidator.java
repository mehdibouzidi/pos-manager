package com.mystore.manager.api.common.validation.constraint;

import com.mystore.manager.api.common.validation.annotation.Mandatory;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.Collection;

public class MandatoryValidator  implements ConstraintValidator<Mandatory, Object> {

    @Override
    public void initialize(Mandatory annotation) {

    }

    @Override
    public boolean isValid(Object object, ConstraintValidatorContext context) {
        boolean isValid = false;

        if (object != null) {
            if (object instanceof String) {
                String value = (String) object;
                isValid = !value.trim().isEmpty();

            } else if (object instanceof Collection) {
                Collection<?> value = (Collection<?>) object;
                isValid = !value.isEmpty();

            } else {
                isValid = true;
            }
        }

        return isValid;
    }
}
