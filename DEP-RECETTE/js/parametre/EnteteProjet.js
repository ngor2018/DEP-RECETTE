$(function () {
    $('.select_').select2()
    $("#resetImg").click(function () {
        $("#profilePic").attr("src", "../images/user.png");
        $("#error_img_2").html('');
    })
    $("#resetImg_2").click(function () {
        $("#profilePic_2").attr("src", "../images/user.png");
        $("#error_img_2").html('');
    })
    document.getElementById("profileUpload").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file && (file.size <= 100 * 1024)) { //100 Ko
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById("profilePic").src = e.target.result;
            };
            reader.readAsDataURL(file);
            document.getElementById('error_img').textContent = "";
        } else {
            var message = 'La taille de la 1ère image ne doit pas dépasser 100 Ko.';
            document.getElementById('error_img').textContent = message;
            event.target.value = "";
        }
    });
    document.getElementById("profileUpload_2").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file && (file.size <= 100 * 1024)) { //100 Ko
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById("profilePic_2").src = e.target.result;
            };
            reader.readAsDataURL(file);
            document.getElementById('error_img_2').textContent = "";
        } else {
            var message = 'La taille de la 2ème image ne doit pas dépasser 100 Ko.';
            document.getElementById('error_img_2').textContent = message;
            event.target.value = "";
        }
    });
    $('.closeForm').click(function () {
        document.getElementById('fullscreen_popup').style.display = "none";
    })
})