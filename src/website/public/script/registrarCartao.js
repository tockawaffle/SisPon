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
                    if (data.error) {
                        Swal.fire({
                            title: "Erro",
                            html: data.error,
                            icon: "error",
                            confirmButtonText: "Ok",
                        });
                    }

                    if (data.auth) {
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
                            preConfirm: async () => {
                                const nome = $("#nome").val();
                                const sobrenome = $("#sobrenome").val();
                                const telefone = $("#telefone").val();
                                Swal.fire({
                                    title: "Coloque o cartão no leitor!",
                                    html: "<div class='spinner-border text-primary' role='status'></div><br><span class='sr-only' style='font-family:'Raleway', sans-serif'>Loading...</span>",
                                    showConfirmButton: false,
                                    allowOutsideClick: false,
                                    allowEscapeKey: false,
                                    allowEnterKey: false,
                                    onBeforeOpen: () => {
                                        Swal.showLoading();
                                    },
                                });
                                const { uid } = await lerCartao();
                                if (uid) {
                                    $.ajax({
                                        url: "api/registrarCartao",
                                        type: "POST",
                                        dataType: "json",
                                        data: {
                                            uid,
                                            nome,
                                            sobrenome,
                                            telefone,
                                        },
                                        success: function (data) {
                                            if (data.error) {
                                                Swal.fire({
                                                    title: "Erro",
                                                    html: data.error,
                                                    icon: "error",
                                                    confirmButtonText: "Ok",
                                                });
                                            }

                                            if (data.msg && data.code === 100) {
                                                $.ajax({
                                                    url: "api/nfc/write",
                                                    type: "POST",
                                                    dataType: "json",
                                                    data: {
                                                        uid,
                                                        nome,
                                                        sobrenome,
                                                        telefone,
                                                        uuid: data.uuid
                                                    },
                                                    success: function (data) {
                                                        if(data.msg) {
                                                            Swal.fire({
                                                                title: "Sucesso",
                                                                html: data.msg,
                                                                icon: "success",
                                                                confirmButtonText: "Ok",
                                                            });
                                                        }
                                                    }
                                                })
                                            }
                                        },
                                        error: function (data) {
                                            const error =
                                                data.responseJSON.error;
                                            Swal.fire({
                                                title: "Erro",
                                                html: error,
                                                icon: "error",
                                                confirmButtonText: "Ok",
                                            });
                                        },
                                    });
                                }
                            },
                        });
                    }
                },
                error: function (data) {
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
