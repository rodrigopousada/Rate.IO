package com.rateio.roleapi.dto;

import com.rateio.roleapi.model.Evento;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EventoResponse(
        Long id,
        String nome,
        BigDecimal metaValor,
        BigDecimal arrecadado,
        LocalDate dataEvento,
        Boolean ativo,
        GrupoResumoResponse grupo
) {
    public static EventoResponse from(Evento evento) {
        return from(evento, BigDecimal.ZERO);
    }

    public static EventoResponse from(Evento evento, BigDecimal arrecadado) {
        return new EventoResponse(
                evento.getId(),
                evento.getNome(),
                evento.getMetaValor(),
                arrecadado,
                evento.getDataEvento(),
                evento.getAtivo(),
                GrupoResumoResponse.from(evento.getGrupo())
        );
    }
}
