var url = "http://egitim-api.sercanozen.com.tr/api/";
window.onload = function () {
    $('.loader-wrapper').hide();
}

var onloadCallback = function () {
    grecaptcha.render('recaptcha', {
        'sitekey': '6LfEIOEZAAAAAMBoVY1XFp4L_6sKTGG_M4hjO0F3',
        'secretkey':'6LfEIOEZAAAAAPOQxsJ-m0apiaBWjRREpbRmVqgJ'
        //test-sitekey  : 6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
        //test-secretkey: 6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
    });
};


function myFunction(){
    if (grecaptcha.getResponse() ==""){
        Swal.fire({
            icon: 'warning',
            title: 'Uyarı',
            text: 'Lütfen gerçek bir kullanıcı olduğunuzu belirtmek için, robot değilim kutucuğunu işaretleyiniz.',
            confirmButtonText:'Tamam'
        });
    }
    else{
        $('.loader-wrapper').show();
        let email = $('#email').val().trim();
        let password = $('#password').val().trim();


        $.ajax({
            url: url+"login",
            method: "POST",
            async:true,
            data:{
                email:email,
                password:password
            },
            dataType: "json",
            success:function (data){
                sessionStorage.setItem("token",JSON.stringify(data["success"]["token"]));/*+"/"+email+"/"+password*/
                sessionStorage.setItem("time",JSON.stringify(new Date()));
                let timerInterval;
                Swal.fire({
                    icon:'success',
                    title: 'Giriş işlemi başarılı!',
                    html: 'anasayfaya yönlendiriliyorsunuz..',
                    timer: 1750,
                    timerProgressBar: true,
                    willOpen: () => {
                    },
                    willClose: () => {
                        clearInterval(timerInterval);
                        $('.loader-wrapper').hide();
                        window.location.href = "index.html";
                    }

                });

            },
            error:function (){
                $('.loader-wrapper').hide();
                Swal.fire({
                    icon: 'error',
                    title: 'Uyarı',
                    text: 'Kullanıcı adı veya şifre hatalı. Lütfen tekrar deneyiniz..',
                    confirmButtonText:'Tamam'
                });
            }

        });
    }
}

