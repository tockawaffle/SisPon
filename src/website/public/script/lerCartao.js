async function lerCartao() {
    return await $.ajax({
        url: "api/nfc/read",
        type: "GET",
        dataType: "json",
        success: function (data) {
            if(data.error) {
                Swal.fire({
                    title: "Erro",
                    html: data.error,
                    icon: "error",
                    confirmButtonText: "Ok",
                })
            }

            if(data.read) {
                return data.uid
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
}

async function lerEsseCartao() {
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
    $.ajax({
        url: "api/nfc/read/authorized",
        type: "GET",
        dataType: "json",
        success: function (data) {
            const { uid, type, uuid, nome, sobrenome, telefone } = data.payload;
            const nomeCompleto =
                nome.replace(/\0/g, "") + " " + sobrenome.replace(/\0/g, "");
            const telefoneFormatado = telefone.replace(/\0/g, "");
            const uuidFormatado = uuid.replace(/\0/g, "");
            Swal.fire({
                title: "Sucesso",
                html: `
                    <div class="container d-flex justify-content-center text-center">
                        <div class="row">
                            <div class="col-12">
                                <div class="form-group">
                                    <label for="uid">UID</label>
                                    <input type="text" class="form-control" id="uid" value="${uid}" disabled>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="form-group">
                                    <label for="type">Tipo</label>
                                    <input type="text" class="form-control" id="type" value="${type}" disabled>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="form-group">
                                    <label for="uuid">UUID</label>
                                    <input type="text" class="form-control" id="uuid" value="${uuidFormatado}" disabled>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="form-group">
                                    <label for="nome">Nome</label>
                                    <input type="text" class="form-control" id="nome" value="${nomeCompleto}" disabled>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="form-group">
                                    <label for="telefone">Telefone</label>
                                    <input type="text" class="form-control" id="telefone" value="${telefoneFormatado}" disabled>
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                icon: "success",
                confirmButtonText: "Ok",
            })
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
}