function admin() {
    Swal.fire({
        title: "Autenticação para Registro de Cartão",
        html: `
            <div class="form-group">
                <label for="user">Usuário</label>
                <input type="text" class="form-control" id="user" placeholder="Usuário">
            </div>
            <div class="form-group">
                <label for="senha">Senha</label>
                <input type="password" class="form-control" id="senha" placeholder="Senha">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Continuar",
        cancelButtonText: "Cancelar",
        showLoaderOnConfirm: true,
        preConfirm: () => {
            $.ajax({
                url: "api/autenticar",
                type: "POST",
                dataType: "json",
                data: {
                    user: $("#user").val(),
                    senha: $("#senha").val(),
                },
                success: function (data) {
                    Swal.fire({
                        html: `
                            <div class="container-fluid d-flex justify-content-center mt-5">
                                <div class="container text-center">
                                    <button id="horarios" onclick="horarios()" class="btn btn-primary">Verificar Pontos Batidos</button>
                                    <button id="registrarPonto" onclick="registrarPonto()" class="btn btn-primary">Registrar Ponto Manual</button>
                                    <button id="editarCartao" onclick="editarCartao()" class="btn btn-primary">Editar Informações do Cartão</button>
                                </div>
                            </div>
                            <br>
                            <div class="container d-flex justify-content-center mt-3">
                                <div id="horariosBatidos"></div>
                            </div>
                
                        `,
                        width: "83%",
                        position: "center-end",
                        allowEscapeKey: true,
                        showConfirmButton: false,
                        showCloseButton: true,
                    });
                },
                error: (data) => {
                    const error = data.responseJSON.msg;
                    Swal.fire({
                        title: "Erro",
                        html: error,
                        icon: "error",
                        confirmButtonText: "Ok",
                    });
                },
            });
        },
    });
}
