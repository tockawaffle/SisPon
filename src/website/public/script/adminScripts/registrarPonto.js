function registrarPonto() {
    Swal.fire({
        title: "Coloque o cartão no leitor!",
        html: "<div class='spinner-border text-primary' role='status'></div><br><span class='sr-only' style='font-family:'Raleway', sans-serif'>Carregando . . .</span>",
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

                    <form id="registrarPontoForm">
                        <div class="form-group
                            <label for="tipoPonto">Tipo de ponto</label>
                            <select class="form-control" id="tipoPonto" name="tipoPonto">
                                <option value="entrada">Entrada</option>
                                <option value="saida">Saída</option>
                            </select>

                            <label for="data">Data</label>
                            <input type="text" class="form-control" id="datepicker" name="data">

                            <label for="hora">Hora</label>
                            <input type="type" class="form-control" id="hourpicker" placeholder="Utilize este formato de hora: 'HH:MM:SS'" name="hora" value="${moment().format("HH:MM:SS")}">

                            <label for="observacao">Observação</label>
                            <textarea class="form-control" id="observacao" name="observacao" rows="3"></textarea>
                        </div>
                    </form>
                `,
                icon: "success",
                confirmButtonText: "Continuar",
                showCancelButton: true,
                preConfirm: () => {
                    const tipoPonto = $("#tipoPonto").val();
                    const data = $("#datepicker").val();
                    const hora = $("#hourpicker").val();
                    const observacao = $("#observacao").val();
                    const telefone = $("#telefone").val();

                    if (tipoPonto == "" || data == "" || hora == "") {
                        Swal.showValidationMessage(
                            "Preencha todos os campos obrigatórios!"
                        );
                    }
                    
                    $.ajax({
                        url: "api/nfc/ponto/manual",
                        type: "POST",
                        dataType: "json",
                        data: {
                            uid,
                            type,
                            uuid,
                            nome: nomeCompleto,
                            telefone,
                            tipoPonto,
                            data,
                            hora,
                            observacao,
                        },
                    })
                }
            });
            
            $("#datepicker").datepicker({
                dateFormat: "dd/mm/yyyy",
                language: "pt-BR",
                endDate: "today",
            });

            

                
        },
        error: function (data) {
            const error = data.responseJSON.error;
            Swal.fire({
                title: "Erro",
                html: error,
                icon: "error",
                confirmButtonText: "Ok",
            });
        },
    });
}
