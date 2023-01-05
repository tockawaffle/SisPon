function registrarCartao() {
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
                    if(data.error) {
                        Swal.fire({
                            title: "Erro",
                            html: data.error,
                            icon: "error",
                            confirmButtonText: "Ok",
                        })
                    }

                    if(data.auth) {
                        Swal.fire({
                            title: "Registro de Cartão",
                            html: `
                                <div class="form-group">
                                    <label style="font-family: 'Raleway', sans-serif;" for="nome">Nome</label>
                                    <input type="text" class="form-control" id="nome">
                                </div>
                                <hr>
                                <div class="form-group">
                                    <label style="font-family: 'Raleway', sans-serif;" for="telefone">Sobrenome</label>
                                    <input type="text" class="form-control" id="sobrenome">
                                </div>
                                <hr>
                                <div class="form-group">
                                    <label style="font-family: 'Raleway', sans-serif;" for="telefone">Telefone</label>
                                    <input type="text" class="form-control" id="telefone">
                                </div>
                            `,
                            showCancelButton: true,
                            confirmButtonText: "Registrar",
                            cancelButtonText: "Cancelar",
                            showLoaderOnConfirm: true,
                            // preConfirm: () => {
                            //     $.ajax({
                            //         url: "api/registrarCartao",
                            //         type: "POST",
                            //         dataType: "json",
                            //         data: {
                            //             nome: $("#nome").val(),
                            //             sobrenome: $("#sobrenome").val(),
                            //             telefone: $("#telefone").val(),
                            //         },
                            //         success: function (data) {
                            //             if(data.error) {
                            //                 Swal.fire({
                            //                     title: "Erro",
                            //                     html: data.error,
                            //                     icon: "error",
                            //                     confirmButtonText: "Ok",
                            //                 })
                            //             }

                            //             if(data.success) {
                            //                 Swal.fire({
                            //                     title: "Sucesso",
                            //                     html: data.success,
                            //                     icon: "success",
                            //                     confirmButtonText: "Ok",
                            //                 })
                            //             }
                            //         },
                            //         error: function (data) {
                            //             const error = data.responseJSON.error;
                            //             Swal.fire({
                            //                 title: "Erro",
                            //                 html: error,
                            //                 icon: "error",
                            //                 confirmButtonText: "Ok",
                            //             })
                            //         }
                            //     })
                            // },
                        })
                    }
                },
                error: function (data) {
                    const error = data.responseJSON.error;
                    Swal.fire({
                        title: "Erro",
                        html: error,
                        icon: "error",
                        confirmButtonText: "Ok",
                    })
                }
            })
        },

    })
}