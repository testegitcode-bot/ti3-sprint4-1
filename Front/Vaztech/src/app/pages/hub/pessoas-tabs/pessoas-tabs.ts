import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputMaskModule } from 'primeng/inputmask';
import { CpfCnpjMaskDirective } from '../../../directives/cpf-cnpj-mask.directive';
import { PessoaService } from '../../../services/pessoa.service';
import { AlterarPessoaBody, CadastrarPessoaBody, PessoaResponse } from '../../../models/pessoa.model';


@Component({
  selector: 'app-pessoas-tabs',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    PaginatorModule,
    ToolbarModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
    InputMaskModule,
    CpfCnpjMaskDirective,
  ],
  templateUrl: './pessoas-tabs.html',
  providers: [MessageService],
})
export class PessoasTabsComponent {
  pessoaService = inject(PessoaService);
  toastService = inject(MessageService);

  pessoas: PessoaResponse[] = [];
  pessoasFiltradas: PessoaResponse[] = [];
  pessoasPaginadas: PessoaResponse[] = [];

  modalFormularioAberto: boolean = false;
  editandoPessoa: PessoaResponse | undefined;


  paginaAtual: number = 0;
  itensPorPagina: number = 6;
  totalRegistros: number = 0;

  searchText: string = '';

  ngOnInit() {
    this.buscarPessoas();
  }

  buscarPessoas() {
    this.pessoaService.buscarPessoas().subscribe({
      next: (pessoas: PessoaResponse[]) => {
        this.pessoas = pessoas;
        this.filtrarPessoas();
      },
      error: (err) => {
        console.error(err);
        this.toastService.add({
          summary: 'Erro ao carregar!',
          detail: 'Não foi possível carregar as pessoas.',
          severity: 'error',
        });
      },
    });
  }

  filtrarPessoas() {
    if (this.searchText.trim() === '') {
      this.pessoasFiltradas = [...this.pessoas];
    } else {
      const termo = this.searchText.toLowerCase();
      this.pessoasFiltradas = this.pessoas.filter(
        (p) =>
          p.nome.toLowerCase().includes(termo) ||
          (p.origem && p.origem.toLowerCase().includes(termo)) ||
          p.cpfCnpj.includes(termo)
      );
    }
    this.totalRegistros = this.pessoasFiltradas.length;
    this.paginaAtual = 0;
    this.atualizarPaginacao();
  }

  atualizarPaginacao() {
    const inicio = this.paginaAtual * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.pessoasPaginadas = this.pessoasFiltradas.slice(inicio, fim);
  }

  onPageChange(event: PaginatorState) {
    this.paginaAtual = event.page || 0;
    this.itensPorPagina = event.rows || 6;
    this.atualizarPaginacao();
  }

  abrirModalCadastrar() {
    this.editandoPessoa = undefined;
    this.modalFormularioAberto = true;
  }

  abrirModalEditar(pessoa: PessoaResponse) {
    this.editandoPessoa = pessoa;
    this.modalFormularioAberto = true;
  }

  esconderFormularioModal(form: NgForm) {
    this.editandoPessoa = undefined;
    form.resetForm();
  }

  enviarFormulario(form: NgForm) {
    if (form.invalid) return;

    if (!this.editandoPessoa) {
      const cpfCnpjLimpo = form.value.cpfCnpj.replace(/\D/g, '');
      const novaPessoa: CadastrarPessoaBody = {
        nome: form.value.nome,
        cpfCnpj: cpfCnpjLimpo,
        dataNascimento: form.value.dataNascimento || null,
        origem: form.value.origem || null,
      };

      this.pessoaService.cadastrarPessoa(novaPessoa).subscribe({
        next: () => {
          this.toastService.add({
            summary: 'Cadastrado!',
            detail: 'A pessoa foi cadastrada com sucesso',
            severity: 'success',
          });
          this.buscarPessoas();
        },
        error: (err) => {
          console.error(err);
          this.toastService.add({
            summary: 'Erro!',
            detail: err.error?.erro || 'Erro ao cadastrar pessoa',
            severity: 'error',
          });
        },
      });
    } else {
      const cpfCnpjLimpo = form.value.cpfCnpj.replace(/\D/g, '');
      const pessoaAtualizada: AlterarPessoaBody = {
        id: this.editandoPessoa.id,
        nome: form.value.nome,
        cpfCnpj: cpfCnpjLimpo,
        dataNascimento: form.value.dataNascimento || null,
        origem: form.value.origem || null,
      };

      this.pessoaService.editarPessoa(pessoaAtualizada).subscribe({
        next: () => {
          this.toastService.add({
            summary: 'Editado!',
            detail: 'A pessoa foi editada com sucesso',
            severity: 'success',
          });
          this.buscarPessoas();
        },
        error: (err) => {
          console.error(err);
          this.toastService.add({
            summary: 'Erro!',
            detail: err.error?.erro || 'Erro ao editar pessoa',
            severity: 'error',
          });
        },
      });
    }

    this.modalFormularioAberto = false;
    this.editandoPessoa = undefined;
    form.resetForm();
  }
}
