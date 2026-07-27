package com.rateio.roleapi.repository;

import com.rateio.roleapi.model.Grupo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GrupoRepository extends JpaRepository<Grupo, Long> {
    Optional<Grupo> findByConviteCodigo(String conviteCodigo);

    boolean existsByConviteCodigo(String conviteCodigo);

    List<Grupo> findTop10ByNomeContainingIgnoreCaseOrderByNomeAsc(String nome);

    @Query("SELECT g FROM Grupo g JOIN g.membros m WHERE m.id = :usuarioId")
    List<Grupo> findGruposDoUsuario(@Param("usuarioId") Long usuarioId);
}
