package com.rateio.roleapi.repository;

import com.rateio.roleapi.model.SolicitacaoEntradaGrupo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SolicitacaoEntradaGrupoRepository extends JpaRepository<SolicitacaoEntradaGrupo, Long> {
    List<SolicitacaoEntradaGrupo> findByGrupoIdAndStatusOrderByDataCriacaoAsc(Long grupoId, String status);

    Optional<SolicitacaoEntradaGrupo> findByGrupoIdAndUsuarioIdAndStatus(Long grupoId, Long usuarioId, String status);

    boolean existsByGrupoIdAndUsuarioIdAndStatus(Long grupoId, Long usuarioId, String status);
}
