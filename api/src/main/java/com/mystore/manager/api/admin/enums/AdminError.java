package com.mystore.manager.api.admin.enums;

import lombok.Getter;

@Getter
public enum AdminError {
    USER_CANNOT_UPDATED("L'Utilisateur ne peut pas être modifié"),
    PASSWORD_DOESNT_MATCH("Mot de passe incorrect"),
    PASSWORD_EMPTY("Mot de passe vide"),;

    private String libelle;

    AdminError(String libelle) {
        this.libelle = libelle;
    }

    @Override
    public String toString() {
        return name();
    }
}
