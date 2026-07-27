package com.rateio.roleapi.service;

import com.rateio.roleapi.dto.AnalisarSolicitacaoRequest;
import com.rateio.roleapi.dto.CriarGrupoRequest;
import com.rateio.roleapi.dto.EntradaGrupoResponse;
import com.rateio.roleapi.dto.EntrarGrupoRequest;
import com.rateio.roleapi.dto.GrupoResponse;
import com.rateio.roleapi.model.Grupo;
import com.rateio.roleapi.model.SolicitacaoEntradaGrupo;
import com.rateio.roleapi.model.Usuario;
import com.rateio.roleapi.repository.GrupoRepository;
import com.rateio.roleapi.repository.SolicitacaoEntradaGrupoRepository;
import com.rateio.roleapi.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class GrupoService {

    private static final String CARACTERES_CONVITE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int TAMANHO_CONVITE = 8;
    private static final String STATUS_PENDENTE = "PENDENTE";
    private static final String STATUS_APROVADA = "APROVADA";
    private static final String STATUS_RECUSADA = "RECUSADA";

    private final GrupoRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final SolicitacaoEntradaGrupoRepository solicitacaoRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public GrupoService(
            GrupoRepository repository,
            UsuarioRepository usuarioRepository,
            SolicitacaoEntradaGrupoRepository solicitacaoRepository
    ) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.solicitacaoRepository = solicitacaoRepository;
    }

    public Grupo criar(CriarGrupoRequest request) {
        Usuario criador = usuarioRepository.findById(request.criadorId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario criador nao encontrado"));

        Grupo grupo = new Grupo();
        grupo.setNome(request.nome());
        grupo.setConviteCodigo(gerarConviteCodigo());
        grupo.setEntradaComAprovacao(request.entradaComAprovacao() == null || request.entradaComAprovacao());
        grupo.setAdministrador(criador);

        Set<Usuario> membros = new LinkedHashSet<>();
        membros.add(criador);

        List<Long> membrosIds = request.membrosIds() == null ? List.of() : request.membrosIds();
        membros.addAll(usuarioRepository.findAllById(membrosIds));
        grupo.setMembros(new ArrayList<>(membros));

        return repository.save(grupo);
    }

    public List<Grupo> listarDoUsuario(Long usuarioId) {
        return repository.findGruposDoUsuario(usuarioId);
    }

    public Grupo buscarPorId(Long grupoId) {
        return repository.findById(grupoId)
                .orElseThrow(() -> new IllegalArgumentException("Clube nao encontrado"));
    }

    public List<Grupo> buscarPorNome(String nome) {
        if (nome == null || nome.isBlank()) {
            return List.of();
        }

        return repository.findTop10ByNomeContainingIgnoreCaseOrderByNomeAsc(nome.trim());
    }

    public EntradaGrupoResponse entrar(EntrarGrupoRequest request) {
        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
        Grupo grupo = buscarGrupoParaEntrada(request);

        if (participaDoGrupo(grupo, usuario.getId())) {
            return new EntradaGrupoResponse("ENTROU", "Voce ja participa desse clube.", GrupoResponse.from(grupo));
        }

        if (Boolean.TRUE.equals(grupo.getEntradaComAprovacao()) && !ehAdministrador(grupo, usuario.getId())) {
            if (!solicitacaoRepository.existsByGrupoIdAndUsuarioIdAndStatus(grupo.getId(), usuario.getId(), STATUS_PENDENTE)) {
                SolicitacaoEntradaGrupo solicitacao = new SolicitacaoEntradaGrupo();
                solicitacao.setGrupo(grupo);
                solicitacao.setUsuario(usuario);
                solicitacao.setStatus(STATUS_PENDENTE);
                solicitacaoRepository.save(solicitacao);
            }

            return new EntradaGrupoResponse("PENDENTE", "Pedido enviado para o administrador do clube.", GrupoResponse.from(grupo));
        }

        adicionarMembro(grupo, usuario);
        Grupo salvo = repository.save(grupo);
        return new EntradaGrupoResponse("ENTROU", "Voce entrou no clube.", GrupoResponse.from(salvo));
    }

    public List<SolicitacaoEntradaGrupo> listarSolicitacoesPendentes(Long grupoId, Long administradorId) {
        Grupo grupo = buscarPorId(grupoId);
        validarAdministrador(grupo, administradorId);
        return solicitacaoRepository.findByGrupoIdAndStatusOrderByDataCriacaoAsc(grupoId, STATUS_PENDENTE);
    }

    public Grupo analisarSolicitacao(Long solicitacaoId, AnalisarSolicitacaoRequest request) {
        SolicitacaoEntradaGrupo solicitacao = solicitacaoRepository.findById(solicitacaoId)
                .orElseThrow(() -> new IllegalArgumentException("Solicitacao nao encontrada"));
        Grupo grupo = solicitacao.getGrupo();
        validarAdministrador(grupo, request.administradorId());

        if (Boolean.TRUE.equals(request.aprovar())) {
            adicionarMembro(grupo, solicitacao.getUsuario());
            solicitacao.setStatus(STATUS_APROVADA);
        } else {
            solicitacao.setStatus(STATUS_RECUSADA);
        }

        solicitacaoRepository.save(solicitacao);
        return repository.save(grupo);
    }

    private void adicionarMembro(Grupo grupo, Usuario usuario) {
        List<Usuario> membros = grupo.getMembros() == null ? new ArrayList<>() : new ArrayList<>(grupo.getMembros());
        if (membros.stream().noneMatch(membro -> membro.getId().equals(usuario.getId()))) {
            membros.add(usuario);
            grupo.setMembros(membros);
        }
    }

    private boolean participaDoGrupo(Grupo grupo, Long usuarioId) {
        return grupo.getMembros() != null && grupo.getMembros().stream()
                .anyMatch(membro -> membro.getId().equals(usuarioId));
    }

    private boolean ehAdministrador(Grupo grupo, Long usuarioId) {
        return grupo.getAdministrador() != null && grupo.getAdministrador().getId().equals(usuarioId);
    }

    private void validarAdministrador(Grupo grupo, Long usuarioId) {
        if (!ehAdministrador(grupo, usuarioId)) {
            throw new IllegalArgumentException("Apenas o administrador pode fazer essa acao");
        }
    }

    private Grupo buscarGrupoParaEntrada(EntrarGrupoRequest request) {
        if (request.grupoId() != null) {
            return repository.findById(request.grupoId())
                    .orElseThrow(() -> new IllegalArgumentException("Clube nao encontrado"));
        }

        if (request.conviteCodigo() != null && !request.conviteCodigo().isBlank()) {
            return repository.findByConviteCodigo(request.conviteCodigo().trim().toUpperCase())
                    .orElseThrow(() -> new IllegalArgumentException("Clube nao encontrado"));
        }

        throw new IllegalArgumentException("Informe o clube ou o codigo de convite");
    }

    private String gerarConviteCodigo() {
        String codigo;

        do {
            StringBuilder builder = new StringBuilder(TAMANHO_CONVITE);
            for (int i = 0; i < TAMANHO_CONVITE; i++) {
                int indice = secureRandom.nextInt(CARACTERES_CONVITE.length());
                builder.append(CARACTERES_CONVITE.charAt(indice));
            }
            codigo = builder.toString();
        } while (repository.existsByConviteCodigo(codigo));

        return codigo;
    }
}
