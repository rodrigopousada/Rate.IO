package com.rateio.roleapi.controller;

import com.rateio.roleapi.dto.AnalisarSolicitacaoRequest;
import com.rateio.roleapi.dto.CriarGrupoRequest;
import com.rateio.roleapi.dto.EntradaGrupoResponse;
import com.rateio.roleapi.dto.EntrarGrupoRequest;
import com.rateio.roleapi.dto.GrupoResponse;
import com.rateio.roleapi.dto.SolicitacaoEntradaResponse;
import com.rateio.roleapi.model.Grupo;
import com.rateio.roleapi.service.GrupoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "${app.cors.allowed-origins:*}")
@RestController
@RequestMapping("/grupos")
public class GrupoController {

    private final GrupoService service;

    public GrupoController(GrupoService service) {
        this.service = service;
    }

    @PostMapping({"", "/criar"})
    public ResponseEntity<GrupoResponse> criar(@Valid @RequestBody CriarGrupoRequest request) {
        Grupo novoGrupo = service.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(GrupoResponse.from(novoGrupo));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<GrupoResponse>> listarDoUsuario(@PathVariable Long usuarioId) {
        List<GrupoResponse> grupos = service.listarDoUsuario(usuarioId).stream()
                .map(GrupoResponse::from)
                .toList();
        return ResponseEntity.ok(grupos);
    }

    @GetMapping({"/buscar", "/pesquisar"})
    public ResponseEntity<List<GrupoResponse>> buscarPorNome(@RequestParam String nome) {
        List<GrupoResponse> grupos = service.buscarPorNome(nome).stream()
                .map(GrupoResponse::from)
                .toList();
        return ResponseEntity.ok(grupos);
    }

    @GetMapping("/{grupoId}")
    public ResponseEntity<GrupoResponse> buscarPorId(@PathVariable Long grupoId) {
        return ResponseEntity.ok(GrupoResponse.from(service.buscarPorId(grupoId)));
    }

    @PostMapping("/entrar")
    public ResponseEntity<EntradaGrupoResponse> entrar(@Valid @RequestBody EntrarGrupoRequest request) {
        return ResponseEntity.ok(service.entrar(request));
    }

    @GetMapping("/{grupoId}/solicitacoes")
    public ResponseEntity<List<SolicitacaoEntradaResponse>> listarSolicitacoes(
            @PathVariable Long grupoId,
            @RequestParam Long administradorId
    ) {
        List<SolicitacaoEntradaResponse> solicitacoes = service.listarSolicitacoesPendentes(grupoId, administradorId).stream()
                .map(SolicitacaoEntradaResponse::from)
                .toList();
        return ResponseEntity.ok(solicitacoes);
    }

    @PostMapping("/solicitacoes/{solicitacaoId}/analisar")
    public ResponseEntity<GrupoResponse> analisarSolicitacao(
            @PathVariable Long solicitacaoId,
            @Valid @RequestBody AnalisarSolicitacaoRequest request
    ) {
        return ResponseEntity.ok(GrupoResponse.from(service.analisarSolicitacao(solicitacaoId, request)));
    }
}
