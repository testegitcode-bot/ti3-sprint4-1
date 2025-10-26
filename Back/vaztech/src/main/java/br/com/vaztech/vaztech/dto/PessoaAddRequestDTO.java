package br.com.vaztech.vaztech.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;


public record PessoaAddRequestDTO(
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
        String nome,

        @NotBlank(message = "CPF/CNPJ é obrigatório")
        @Size(max = 20, message = "CPF/CNPJ deve ter no máximo 20 caracteres")
        String cpfCnpj,

        LocalDate dataNascimento,

        @Size(max = 50, message = "Origem deve ter no máximo 50 caracteres")
        String origem,

        @Size(max = 20, message = "Função deve ter no máximo 20 caracteres")
        String funcao,

        @Size(max = 500, message = "Observação deve ter no máximo 500 caracteres")
        String observacao
) {}