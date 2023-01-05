function baterPonto() {
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
        url: "api/nfc",
        type: "GET",
        dataType: "json",
        success: function (data) {
            const { error, read, payload } = data;

            if (error || !read) {
                return Swal.fire({
                    title: "Erro",
                    text: data.error,
                    icon: "error",
                    confirmButtonText: "Ok",
                });
            }

            const { uid, type, uuid, nome, sobrenome, telefone } = payload;
            const nomeCompleto =
                nome.replace(/\0/g, "") + " " + sobrenome.replace(/\0/g, "");
            const telefoneFormatado = telefone.replace(/\0/g, "");
            const uuidFormatado = uuid.replace(/\0/g, "");

            $.ajax({
                url: "api/pontoBatido",
                type: "POST",
                dataType: "json",
                data: {
                    uid,
                    type,
                    uuid: uuidFormatado,
                    nome: nomeCompleto,
                    telefone: telefoneFormatado,
                },
                success: function (data) {

                    Swal.fire({
                        title: "Sucesso",
                        html: `
                            Olá ${nomeCompleto}!
                            <br>
                            Seu cartão de identificação foi lido com sucesso!
                            <br><br>
                            Data de Entrada: ${new Date().toLocaleString()}<br>
                            ID do Cartão: ${uuidFormatado}
                            <br>
                            Sua entrada foi registrada com sucesso!
                        `,
                        icon: "success",
                        confirmButtonText: "Ok",
                    });
                },
                error: function(data) {
                    const error = data.responseJSON.error;
                    Swal.fire({
                        title: "Erro",
                        html: error,
                        icon: "error",
                        confirmButtonText: "Ok",
                    });
                }
            })

            
        },
    });
}
