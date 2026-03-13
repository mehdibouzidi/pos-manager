package com.mystore.manager.api.common.mapper;

import java.util.List;

public interface IMapper<T,S>  {
    public List<T> entityListToPayload(List<S> entities, boolean detailed);
}
