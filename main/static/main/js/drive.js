function toggleFields() {
    var optDiv = document.getElementById("optional-fields")
    if (optDiv.style.display === "block") {
        optDiv.style.display = "none";
    } else {
        optDiv.style.display = "block";
    }
}

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#blah')
                .attr('src', e.target.result)
                .width(150)
                .height(200);
        };

        reader.readAsDataURL(input.files[0]);
    }
}
