package com.rateio.roleapi.service;

import com.rateio.roleapi.model.Evento;
import com.rateio.roleapi.repository.EventoRepository;
import org.springframework.stereotype.Service;

@Service
public class EventoService {

    private final EventoRepository repository;

    public EventoService(EventoRepository repository) {
        this.repository = repository;
    }

    public Evento criar(Evento evento) {
        evento.setAtivo(true);
        return repository.save(evento);
    }
}