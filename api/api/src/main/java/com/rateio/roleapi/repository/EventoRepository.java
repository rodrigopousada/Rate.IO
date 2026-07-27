package com.rateio.roleapi.repository;

import com.rateio.roleapi.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventoRepository extends JpaRepository<Evento, Long> {

    @Query("SELECT e FROM Evento e WHERE e.grupo.id IN (SELECT g.id FROM Usuario u JOIN u.grupos g WHERE u.id = :usuarioId)")
    List<Evento> findEventosDoUsuario(@Param("usuarioId") Long usuarioId);

    List<Evento> findByGrupoIdOrderByDataEventoAsc(Long grupoId);
}
