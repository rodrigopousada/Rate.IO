package com.rateio.roleapi.service;

import com.rateio.roleapi.model.Evento;
import com.rateio.roleapi.model.Gasto;
import com.rateio.roleapi.repository.GastoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GastoService {

    private final GastoRepository repository;

    public GastoService(GastoRepository repository) {
        this.repository = repository;
    }

    public Gasto criar(Gasto gasto) {
        // Garante que o gasto nasça ativo
        gasto.setAtivo(true);
        return repository.save(gasto);
    }

}