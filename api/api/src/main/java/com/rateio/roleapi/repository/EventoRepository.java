package com.rateio.roleapi.repository;

import com.rateio.roleapi.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventoRepository extends JpaRepository<Evento, Long> {
}