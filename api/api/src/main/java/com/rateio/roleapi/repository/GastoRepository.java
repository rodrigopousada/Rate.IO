package com.rateio.roleapi.repository;

import com.rateio.roleapi.model.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface GastoRepository extends JpaRepository<Gasto, Long> {
    List<Gasto> findByEventoIdAndAtivoTrueOrderByIdDesc(Long eventoId);

    @Query("SELECT COALESCE(SUM(g.valor), 0) FROM Gasto g WHERE g.evento.id = :eventoId AND g.ativo = true")
    BigDecimal somarValorAtivoPorEvento(@Param("eventoId") Long eventoId);
}
