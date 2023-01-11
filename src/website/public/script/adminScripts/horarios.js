function horarios() {
    Swal.fire({
        title: "Selecione uma data!",
        html: `
            <form id="horariosForm">
                <div class="form-group">
                    <label for="data">Data</label>
                    <input type="date" class="form-control" id="data" name="data">
                </div>
            </form>
        `,
        showCancelButton: true,
        confirmButtonText: "Buscar",
        cancelButtonText: "Cancelar",
        showLoaderOnConfirm: true,
        preConfirm: () => {
            const dataInput = $("#data").val();
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
            const dataHoje = moment().format();
            if (!dataInput || dataInput === dataHoje) {
                $.ajax({
                    url: "api/horarios",
                    type: "GET",
                    dataType: "json",
                    success: function (data) {
                        const horarios = data.horarios;
                        const horariosFormatados = horarios.map((h) => {
                            if (!h) return;
                            const pontoEntrada = h.entrada.map((e) => {
                                if (!e) return;
                                return {
                                    hora: e.hora ?? "Ainda não entrou",
                                    nome: e.nome ?? "Ainda não entrou",
                                };
                            });
                            const pontoSaida = h.saida.map((s) => {
                                if (!s) return;
                                return {
                                    hora: s.hora ?? "Ainda não saiu",
                                    nome: s.nome ?? "Ainda não saiu",
                                };
                            });

                            return {
                                nome: h.nome,
                                entrada: pontoEntrada,
                                saida: pontoSaida,
                            };
                        });

                        const table = `
                            <table class="table table-striped table-bordered table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">Nome</th>
                                    <th scope="col">Data</th>
                                    <th scope="col">Entrada</th>
                                    <th scope="col">Saída</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${
                                    horariosFormatados.length > 0
                                        ? horariosFormatados.map((h) => {
                                              if (!h) return;
                                              return `
                                                        <tr>
                                                            <td>${h.nome}</td>
                                                            <td>${moment().format(
                                                                "DD/MM/YY"
                                                            )}</td>
                                                            <td>${
                                                                h.entrada[0]
                                                                    .hora ??
                                                                "Ainda não entrou"
                                                            }</td>
                                                            <td>${
                                                                h.saida[0]
                                                                    .hora ??
                                                                "Ainda não saiu"
                                                            }</td>
                                                        </tr>
                                                    `;
                                          })
                                        : `<tr><td colspan="4">Nenhum horário batido hoje</td></tr>`
                                }
                            </tbody>
                        </table>
                        `;
                        $("#horariosBatidos").append(table);
                    },
                });
            } else {
                const dataInputFormatado =
                    moment(dataInput).format("DD/MM/YYYY");

                $.ajax({
                    url: "api/horarios",
                    type: "GET",
                    dataType: "json",
                    data: { data: dataInputFormatado },
                    success: (data) => {
                        const horarios = data.horarios;
                        const horariosFormatados = horarios.map((h) => {
                            if (!h) return;
                            const pontoEntrada = h.entrada.map((e) => {
                                if (!e) return;
                                return {
                                    hora: e.hora ?? "Não bateu entrada",
                                    nome: e.nome ?? "Não bateu entrada",
                                };
                            });
                            const pontoSaida = h.saida.map((s) => {
                                if (!s) return;
                                return {
                                    hora: s.hora ?? "Não bateu saída",
                                    nome: s.nome ?? "Não bateu saída",
                                };
                            });
                            return {
                                nome: h.nome,
                                entrada: pontoEntrada,
                                saida: pontoSaida,
                            };
                        });
                        const table = `
                            <table class="table table-striped table-bordered table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">Nome</th>
                                    <th scope="col">Data</th>
                                    <th scope="col">Entrada</th>
                                    <th scope="col">Saída</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${
                                    horariosFormatados.length > 0
                                        ? horariosFormatados.map((h) => {
                                                if (!h) return;
                                                const entrada = h.entrada[0] ?? {hora: "Não bateu entrada", nome: "Não bateu entrada"};
                                                const saida = h.saida[0] ?? {hora: "Não bateu saída", nome: "Não bateu saída"};

                                                return `
                                                    <tr>
                                                        <td>${h.nome}</td>
                                                        <td>${dataInputFormatado}</td>
                                                        <td>${entrada.hora}</td>
                                                        <td>${saida.hora}</td>
                                                    </tr>
                                                `;
                                          })
                                        : `<tr><td colspan="4">Nenhum horário batido hoje</td></tr>`
                                }
                            </tbody>
                        </table>
                        `;
                        $("#horariosBatidos").append(table);
                    },
                });
            }
        },
    });
}
