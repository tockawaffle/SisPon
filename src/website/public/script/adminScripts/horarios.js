function horarios() {
    $.ajax({
        url: "api/horarios",
        type: "GET",
        dataType: "json",
        success: function (data) {
            console.log(data)
        }
    })
}