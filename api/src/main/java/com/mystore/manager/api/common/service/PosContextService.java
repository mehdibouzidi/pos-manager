package com.mystore.manager.api.common.service;

import com.mystore.manager.api.admin.model.PosEntity;
import com.mystore.manager.api.admin.repository.PosRepository;
import com.mystore.manager.api.common.context.PosContext;
import org.springframework.stereotype.Service;

@Service
public class PosContextService {
    
    private final PosRepository posRepository;
    
    public PosContextService(PosRepository posRepository) {
        this.posRepository = posRepository;
    }
    
    public Integer getCurrentPosId() {
        return PosContext.getPosId();
    }
    
    public String getCurrentPosCode() {
        return PosContext.getPosCode();
    }
    
    public boolean isSuperAdmin() {
        return PosContext.isSuperAdmin();
    }
    
    public PosEntity getCurrentPos() {
        Integer posId = getCurrentPosId();
        if (posId == null) {
            return null;
        }
        return posRepository.findById(posId).orElse(null);
    }
    
    public PosEntity getPosReference() {
        Integer posId = getCurrentPosId();
        if (posId == null) {
            return null;
        }
        return posRepository.getReferenceById(posId);
    }
    
    public boolean canAccessPos(Integer posId) {
        if (isSuperAdmin()) {
            return true;
        }
        Integer currentPosId = getCurrentPosId();
        return currentPosId != null && currentPosId.equals(posId);
    }
}

