package com.rateio.roleapi.service;

import com.rateio.roleapi.model.Grupo;
import com.rateio.roleapi.repository.GrupoRepository;
import org.springframework.stereotype.Service;

@Service
public class GrupoService {

    private final GrupoRepository repository;

    public GrupoService(GrupoRepository repository) {
        this.repository = repository;
    }

    public Grupo criar(Grupo grupo) {
        return repository.save(grupo);
    }
}