package com.mystore.manager.api.business.common.util;

import lombok.Getter;

@Getter
public enum BusinessError {
    NON_EXISTING_PRODUCT("Non existing Product");


    private String libelle;

    BusinessError(String libelle) {
        this.libelle = libelle;
    }

    @Override
    public String toString() {
        return name();
    }
}
