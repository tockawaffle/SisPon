function horarios() {
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
                                                <td>${moment().format("DD/MM/YY")}</td>
                                                <td>${h.entrada[0].hora}</td>
                                                <td>${h.saida[0].hora}</td>
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
