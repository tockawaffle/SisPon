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
                url: "api/nfc/ponto",
                type: "POST",
                dataType: "json",
                data: {
                    uid,
                    type,
                    uuid: uuidFormatado,
                    nome: nomeCompleto,
                    telefone: telefoneFormatado,
                },
                success: function (data2) {
                    if(data2.error) {
                        Swal.fire({
                            title: "Erro",
                            html: data.error,
                            icon: "error",
                            confirmButtonText: "Ok",
                            didClose: () => {
                                location.reload();
                            }
                        });
                    }

                    if(data2.read) {
                        const {data, hora, tipo} = data2;
                        Swal.fire({
                            title: "Sucesso",
                            html: `
                                Olá, ${nomeCompleto}!<br>
                                Você bateu o ponto de ${tipo} às ${hora} do dia ${data}.<br><br>
                                ID do Cartão: ${uuidFormatado}<br>
                                Sua entrada foi registrada com sucesso!
                            
                            `,
                            icon: "success",
                            confirmButtonText: "Ok",
                            //After clicking the button, the modal will close and the page will be reloaded
                            onClose: () => {
                                location.reload();
                            }
                        })
                    }
                },
                error: function(data) {
                    const error = data.responseJSON.error;
                    Swal.fire({
                        title: "Erro",
                        html: error,
                        icon: "error",
                        confirmButtonText: "Ok",
                        didClose: () => {
                            location.reload();
                        }
                    });
                }
            })
        },
    });
}
